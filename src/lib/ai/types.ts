/** Provider-neutral chat types. Add a vendor by implementing ChatProvider. */

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type JsonSchema = {
  type: "object";
  properties: Record<string, { type: string; description?: string; enum?: string[] }>;
  required?: string[];
};

/** A tool the model may call. execute() runs on the server; its return value is sent back to the model. */
export type ToolDef = {
  name: string;
  description: string;
  parameters: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<string> | string;
};

export type ChatRequest = {
  system: string;
  messages: ChatMessage[];
  tools?: ToolDef[];
  maxTokens?: number;
  /** Use the faster/cheaper model where the provider has one. */
  fast?: boolean;
  /** Use exactly this model, with no fallbacks (health checks). Providers without a model chain ignore it. */
  only?: string;
  signal?: AbortSignal;
};

export type ToolCallRecord = { name: string; input: Record<string, unknown>; result: string };
export type ChatResult = { text: string; toolCalls: ToolCallRecord[]; model: string };

export interface ChatProvider {
  readonly id: "anthropic" | "openai" | "gemini";
  readonly label: string;
  readonly model: string;
  /** Every model this provider may use, in the order it tries them. */
  readonly models?: string[];
  chat(req: ChatRequest): Promise<ChatResult>;
}

export class ProviderError extends Error {
  constructor(message: string, readonly status: number, readonly retryable: boolean) {
    super(message);
    this.name = "ProviderError";
  }
}

export const MAX_TOOL_ROUNDS = 4;
export const REQUEST_TIMEOUT_MS = 45_000;

export function withTimeout(signal?: AbortSignal): AbortSignal {
  const t = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, t]) : t;
}

export async function failFrom(res: Response, vendor: string): Promise<never> {
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 300);
  } catch {}
  // Never echo the request (it carries the key); the vendor's error body is safe to log.
  throw new ProviderError(`${vendor} returned ${res.status}${detail ? `: ${detail}` : ""}`, res.status, res.status === 429 || res.status >= 500);
}

export async function runTool(tools: ToolDef[] | undefined, name: string, input: Record<string, unknown>): Promise<string> {
  const t = tools?.find((x) => x.name === name);
  if (!t) return `Unknown tool: ${name}`;
  try {
    return await t.execute(input ?? {});
  } catch (e) {
    return `Tool error: ${e instanceof Error ? e.message : "failed"}`;
  }
}
