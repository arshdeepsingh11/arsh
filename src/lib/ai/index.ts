import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";
import type { ChatProvider } from "./types";

export type AiMode = { mode: "live"; provider: ChatProvider } | { mode: "demo"; provider: null; reason: string };

const DEFAULTS = {
  anthropic: { model: "claude-sonnet-5-5", fast: "claude-haiku-5-5" },
  openai: { model: "gpt-4.1", fast: "gpt-4.1-mini" },
  gemini: { model: "gemini-3.8-flash", fast: "gemini-3.5-flash-lite" },
} as const;

/**
 * Resolves the configured provider from environment variables. Server-only: keys never leave this module.
 * Falls back to demo mode, with a stated reason, when no provider or key is configured.
 */
export function getAi(env: Record<string, string | undefined> = process.env): AiMode {
  const id = (env.AI_PROVIDER ?? "demo").trim().toLowerCase();
  if (id === "demo" || !id) return { mode: "demo", provider: null, reason: "No AI provider is configured (AI_PROVIDER=demo)." };
  if (!(id in DEFAULTS)) return { mode: "demo", provider: null, reason: `Unknown AI_PROVIDER "${id}".` };
  const key = { anthropic: env.ANTHROPIC_API_KEY, openai: env.OPENAI_API_KEY, gemini: env.GEMINI_API_KEY }[id as keyof typeof DEFAULTS];
  if (!key) return { mode: "demo", provider: null, reason: `AI_PROVIDER is "${id}" but its API key is not set.` };
  const d = DEFAULTS[id as keyof typeof DEFAULTS];
  const model = env.AI_MODEL || d.model;
  const fast = env.AI_MODEL_FAST || env.AI_MODEL || d.fast;
  const provider = id === "anthropic" ? anthropicProvider(key, model, fast) : id === "openai" ? openaiProvider(key, model, fast) : geminiProvider(key, model, fast, (env.AI_FALLBACK_MODELS ?? "").split(",").map((m) => m.trim()).filter(Boolean));
  return { mode: "live", provider };
}

export type { ChatMessage, ChatProvider, ChatRequest, ChatResult, ToolDef } from "./types";
export { ProviderError } from "./types";
