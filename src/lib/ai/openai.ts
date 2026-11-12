import { failFrom, MAX_TOOL_ROUNDS, runTool, withTimeout, type ChatProvider, type ChatRequest, type ChatResult, type ToolCallRecord } from "./types";

type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
type Wire =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export function openaiProvider(apiKey: string, model: string, fastModel: string, baseUrl = "https://api.openai.com/v1"): ChatProvider {
  return {
    id: "openai",
    label: "OpenAI",
    model,
    async chat(req: ChatRequest): Promise<ChatResult> {
      const use = req.fast ? fastModel : model;
      const wire: Wire[] = [{ role: "system", content: req.system }, ...req.messages.map((m) => ({ role: m.role, content: m.content }) as Wire)];
      const calls: ToolCallRecord[] = [];
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: use,
            max_completion_tokens: req.maxTokens ?? 700,
            messages: wire,
            ...(req.tools?.length && round < MAX_TOOL_ROUNDS
              ? { tools: req.tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })) }
              : {}),
          }),
          signal: withTimeout(req.signal),
        });
        if (!res.ok) await failFrom(res, "OpenAI");
        const data = (await res.json()) as { choices: { message: { content: string | null; tool_calls?: ToolCall[] } }[] };
        const msg = data.choices[0]?.message;
        if (!msg) return { text: "", toolCalls: calls, model: use };
        if (!msg.tool_calls?.length) return { text: (msg.content ?? "").trim(), toolCalls: calls, model: use };
        wire.push({ role: "assistant", content: msg.content, tool_calls: msg.tool_calls });
        for (const c of msg.tool_calls) {
          let input: Record<string, unknown> = {};
          try {
            input = JSON.parse(c.function.arguments || "{}");
          } catch {}
          const result = await runTool(req.tools, c.function.name, input);
          calls.push({ name: c.function.name, input, result });
          wire.push({ role: "tool", tool_call_id: c.id, content: result });
        }
      }
      return { text: "", toolCalls: calls, model: use };
    },
  };
}
