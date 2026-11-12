import { MAX_TOOL_ROUNDS, ProviderError, runTool, withTimeout, type ChatProvider, type ChatRequest, type ChatResult, type ToolCallRecord } from "./types";

type Part = {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
};
type Content = { role: "user" | "model"; parts: Part[] };

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Keep thinking short: the agents answer from retrieved facts, so deep reasoning only adds seconds.
 * Gemini 3.x takes a thinking level; 2.5 takes a token budget. Thinking tokens count against the output limit,
 * so the output limit is generous.
 */
export function thinkingFor(model: string): Record<string, unknown> {
  if (/^gemini-2\.5/.test(model)) return { thinkingBudget: /lite/.test(model) ? 0 : 512 };
  return { thinkingLevel: "low" };
}

/** Errors that mean "try the next model": quota, overload, or a model this key can't use. Key errors stop at once. */
const MOVE_ON = new Set([404, 429, 500, 502, 503, 504]);

export function geminiProvider(apiKey: string, model: string, fastModel: string, fallbacks: string[] = []): ChatProvider {
  async function call(chain: string[], body: (m: string, thinking: boolean) => unknown, signal?: AbortSignal): Promise<{ parts: Part[]; model: string }> {
    let last: ProviderError | null = null;
    for (const m of chain) {
      let thinking = true;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(`${ENDPOINT}/${encodeURIComponent(m)}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(body(m, thinking)),
          signal: withTimeout(signal),
        });
        if (res.ok) {
          const data = (await res.json()) as { candidates?: { content?: { parts?: Part[] } }[] };
          return { parts: data.candidates?.[0]?.content?.parts ?? [], model: m };
        }
        const detail = (await res.text().catch(() => "")).slice(0, 300);
        last = new ProviderError(`Gemini (${m}) returned ${res.status}${detail ? `: ${detail}` : ""}`, res.status, MOVE_ON.has(res.status));
        // A model that does not accept the thinking setting: ask again without it.
        if (res.status === 400 && thinking && /thinking/i.test(detail)) { thinking = false; continue; }
        break;
      }
      if (!last || !last.retryable) break;
    }
    throw last ?? new ProviderError("Gemini returned no response", 0, true);
  }

  return {
    id: "gemini",
    label: "Google Gemini",
    model,
    async chat(req: ChatRequest): Promise<ChatResult> {
      const first = req.fast ? fastModel : model;
      const chain = [...new Set([first, model, ...fallbacks])];
      const contents: Content[] = req.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const calls: ToolCallRecord[] = [];
      let used = first;
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const withTools = Boolean(req.tools?.length) && round < MAX_TOOL_ROUNDS;
        // Once a turn has started on one model, stay on it: thought signatures are model-specific.
        const { parts, model: m } = await call(round === 0 ? chain : [used], (mm, thinking) => ({
          systemInstruction: { parts: [{ text: req.system }] },
          contents,
          generationConfig: { maxOutputTokens: Math.max(2048, req.maxTokens ?? 0), ...(thinking ? { thinkingConfig: thinkingFor(mm) } : {}) },
          ...(withTools ? { tools: [{ functionDeclarations: req.tools!.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }] } : {}),
        }), req.signal);
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
