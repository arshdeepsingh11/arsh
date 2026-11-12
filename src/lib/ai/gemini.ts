import { MAX_TOOL_ROUNDS, ProviderError, runTool, type ChatProvider, type ChatRequest, type ChatResult, type ToolCallRecord } from "./types";

type Part = {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
};
type Content = { role: "user" | "model"; parts: Part[] };
type Reply = { candidates?: { content?: { parts?: Part[] }; finishReason?: string }[]; promptFeedback?: { blockReason?: string } };

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Models tried in order. The first that answers wins. Current models first, then lighter and older ones.
 * Entries from AI_MODEL / AI_FALLBACK_MODELS go in front of these; duplicates are removed.
 */
export const GEMINI_CHAIN = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

/** Per-model attempt limit, and the budget for a whole answer (the API route allows 60 s). */
const ATTEMPT_MS = 20_000;
const TURN_BUDGET_MS = 50_000;

/**
 * Keep thinking short: the agents answer from retrieved facts, so deep reasoning only adds seconds.
 * Gemini 3.x takes a thinking level; 2.5 takes a token budget. Thinking tokens count against the output limit,
 * so the output limit is generous.
 */
export function thinkingFor(model: string): Record<string, unknown> {
  if (/^gemini-2\.5/.test(model)) return { thinkingBudget: /lite/.test(model) ? 0 : 512 };
  return { thinkingLevel: "low" };
}

/**
 * Busy models are skipped for a while so the next visitor goes straight to one that works.
 * Lives in server memory; resets when the server restarts.
 */
const cooling = new Map<string, number>();
export function coolDown(model: string, ms: number) { cooling.set(model, Date.now() + ms); }
export function isCooling(model: string) { return (cooling.get(model) ?? 0) > Date.now(); }
export function resetCooling() { cooling.clear(); }

/** A problem with the key itself: no other model will fix it, so stop at once. */
const KEY_PROBLEM = /API_KEY_INVALID|API key not valid|ACCESS_TOKEN_TYPE_UNSUPPORTED|UNAUTHENTICATED|API key expired|invalid authentication/i;

function retryDelayMs(detail: string): number {
  const m = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(detail);
  return m ? Math.min(120_000, Math.ceil(Number(m[1]) * 1000)) : 60_000;
}

/** Busy models go to the back of the queue rather than being dropped, in case every model is cooling. */
export function orderChain(chain: string[]): string[] {
  return [...chain.filter((m) => !isCooling(m)), ...chain.filter((m) => isCooling(m))];
}

export function geminiProvider(apiKey: string, model: string, fastModel: string, fallbacks: string[] = []): ChatProvider {
  const all = [...new Set([model, ...fallbacks, ...GEMINI_CHAIN])];

  async function call(chain: string[], body: (m: string, thinking: boolean) => unknown, deadline: number, signal?: AbortSignal): Promise<{ parts: Part[]; model: string }> {
    let last: ProviderError | null = null;
    for (const m of chain) {
      const left = deadline - Date.now();
      if (left < 2_000) break;
      let thinking = true;
      for (let attempt = 0; attempt < 2; attempt++) {
        let res: Response;
        try {
          const t = AbortSignal.timeout(Math.min(ATTEMPT_MS, left));
          res = await fetch(`${ENDPOINT}/${encodeURIComponent(m)}:generateContent`, {
            method: "POST",
            headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify(body(m, thinking)),
            signal: signal ? AbortSignal.any([signal, t]) : t,
          });
        } catch (e) {
          if (signal?.aborted) throw e;
          // Timed out or the network dropped: this model is slow right now, try the next.
          coolDown(m, 30_000);
          last = new ProviderError(`model ${m} did not answer in time`, 504, true);
          break;
        }
        if (res.ok) {
          const data = (await res.json()) as Reply;
          const parts = data.candidates?.[0]?.content?.parts ?? [];
          if (parts.some((p) => (p.text && !p.thought) || p.functionCall)) return { parts, model: m };
          // Empty answer (blocked, or thinking used the whole budget): another model may do better.
          last = new ProviderError(`model ${m} returned no text (${data.promptFeedback?.blockReason ?? data.candidates?.[0]?.finishReason ?? "empty"})`, 200, true);
          break;
        }
        const detail = (await res.text().catch(() => "")).slice(0, 600);
        if (res.status === 401 || KEY_PROBLEM.test(detail)) {
          throw new ProviderError(`the API key was rejected (${res.status}): ${detail.slice(0, 300)}`, res.status, false);
        }
        // A model that does not accept the thinking setting: ask again without it.
        if (res.status === 400 && thinking && /thinking/i.test(detail)) { thinking = false; continue; }
        if (res.status === 429 || res.status === 503) coolDown(m, retryDelayMs(detail));
        else if (res.status === 404 || res.status === 403) coolDown(m, 10 * 60_000); // not available to this key
        last = new ProviderError(`model ${m} returned ${res.status}: ${detail.slice(0, 300)}`, res.status, true);
        break;
      }
    }
    throw last ?? new ProviderError("no model answered in time", 504, true);
  }

  return {
    id: "gemini",
    label: "Gemini",
    model,
    models: all,
    async chat(req: ChatRequest): Promise<ChatResult> {
      const deadline = Date.now() + TURN_BUDGET_MS;
      // Fast requests start on the light model; everything else starts on the main one. `only` pins one model (health checks).
      const chain = req.only ? [req.only] : orderChain([...new Set([req.fast ? fastModel : model, ...all])]);
      const contents: Content[] = req.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const calls: ToolCallRecord[] = [];
      let used = chain[0];
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const withTools = Boolean(req.tools?.length) && round < MAX_TOOL_ROUNDS;
        // Once a turn has started on one model, stay on it: thought signatures are model-specific.
        const { parts, model: m } = await call(round === 0 ? chain : [used], (mm, thinking) => ({
          systemInstruction: { parts: [{ text: req.system }] },
          contents,
          generationConfig: { maxOutputTokens: Math.max(2048, req.maxTokens ?? 0), ...(thinking ? { thinkingConfig: thinkingFor(mm) } : {}) },
          ...(withTools ? { tools: [{ functionDeclarations: req.tools!.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }] } : {}),
        }), deadline, req.signal);
        used = m;
        const fc = parts.filter((p) => p.functionCall);
        if (!fc.length) return { text: parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim(), toolCalls: calls, model: used };
        // Echo the model's parts unchanged: newer models attach thought signatures that must come back.
        contents.push({ role: "model", parts });
        const responses: Part[] = [];
        for (const p of fc) {
          const name = p.functionCall!.name;
          const input = p.functionCall!.args ?? {};
          const result = await runTool(req.tools, name, input);
          calls.push({ name, input, result });
          responses.push({ functionResponse: { name, response: { result } } });
        }
        contents.push({ role: "user", parts: responses });
      }
      return { text: "", toolCalls: calls, model: used };
    },
  };
}
