import { failFrom, MAX_TOOL_ROUNDS, runTool, withTimeout, type ChatProvider, type ChatRequest, type ChatResult, type ToolCallRecord } from "./types";

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };
type Wire = { role: "user" | "assistant"; content: string | Block[] };

export function anthropicProvider(apiKey: string, model: string, fastModel: string): ChatProvider {
  return {
    id: "anthropic",
    label: "Anthropic Claude",
    model,
    async chat(req: ChatRequest): Promise<ChatResult> {
      const use = req.fast ? fastModel : model;
      const wire: Wire[] = req.messages.map((m) => ({ role: m.role, content: m.content }));
      const calls: ToolCallRecord[] = [];
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: use,
            max_tokens: req.maxTokens ?? 700,
            system: req.system,
            messages: wire,
            ...(req.tools?.length && round < MAX_TOOL_ROUNDS
              ? { tools: req.tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })) }
              : {}),
          }),
          signal: withTimeout(req.signal),
        });
        if (!res.ok) await failFrom(res, "Anthropic");
        const data = (await res.json()) as { content: Block[]; stop_reason: string };
        const uses = data.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
        if (data.stop_reason !== "tool_use" || !uses.length) {
          const text = data.content.filter((b): b is Extract<Block, { type: "text" }> => b.type === "text").map((b) => b.text).join("").trim();
          return { text, toolCalls: calls, model: use };
        }
        wire.push({ role: "assistant", content: data.content });
        const results: Block[] = [];
        for (const u of uses) {
          const result = await runTool(req.tools, u.name, u.input);
          calls.push({ name: u.name, input: u.input, result });
          results.push({ type: "tool_result", tool_use_id: u.id, content: result });
        }
        wire.push({ role: "user", content: results });
      }
      return { text: "", toolCalls: calls, model: use };
    },
  };
}
