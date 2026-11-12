import type { AiMode, ChatMessage } from "@/lib/ai";
import { AGENTS, type AgentId } from "@/lib/content/agents";
import { PASSAGES } from "./knowledge";
import { systemPrompt } from "./prompts";
import { retrieve, validate, type Validation } from "./retrieval";
import { guard } from "./guard";
import { toolsFor, type AgentAction } from "./tools";

export type AgentReply = {
  agent: AgentId;
  text: string;
  sources: string[];
  check: Validation;
  /** live = answered by the configured model; demo = retrieval only, no model configured; fallback = model failed, retrieval answer shown;
   *  guarded = declined by the scope guard before any model call. */
  mode: "live" | "demo" | "fallback" | "guarded";
  model?: string;
  tools: string[];
  actions: AgentAction[];
  error?: string;
};

const LEADS: Record<AgentId, string> = {
  aria: "Here is what the record says.",
  nex: "From the repositories:",
  pixel: "Ooh, here is what I found:",
  atlas: "On the record:",
  oracle: "The sources state the following.",
  nova: "Here is the short version:",
};

/** Retrieval-only answer: quotes the best passages verbatim. Used in demo mode and when the model fails. */
export function retrievalAnswer(agent: AgentId, question: string) {
  const ps = retrieve(question, agent, 3);
  if (!ps.length) return { text: `I don't have that on record. I can speak to ${AGENTS[agent].scope}.`, sources: [] as string[] };
  return { text: `${LEADS[agent]} ${ps.slice(0, 2).map((p) => p.text).join(" ")}`, sources: [...new Set(ps.slice(0, 2).map((p) => p.src))] };
}

/**
 * Answers one turn for one agent. History is supplied by the client (it is not stored on the server).
 * Every answer, live or not, is validated against the knowledge base before it is returned.
 */
export async function answer(agent: AgentId, history: ChatMessage[], ai: AiMode, opts: { intent?: string; signal?: AbortSignal } = {}): Promise<AgentReply> {
  const question = history[history.length - 1]?.content ?? "";
  const recent = history.slice(-3, -1).map((m) => m.content).join(" ");
  const ps = retrieve(`${question} ${recent}`, agent, 7);
  const actions: AgentAction[] = [];

  const g = guard(agent, question);
  if (!g.ok) return { agent, text: g.reply, sources: [], check: validate(g.reply), mode: "guarded", tools: [], actions: [], error: g.kind };

  if (ai.mode === "live") {
    try {
      const core = PASSAGES.filter((p) => p.id === "me");
      const extra = opts.intent ? `Shared context: the visitor said they are here for "${opts.intent}".` : "";
      const r = await ai.provider.chat({
        system: systemPrompt(agent, [...core, ...ps], extra),
        messages: history.slice(-10),
        tools: toolsFor(agent, actions),
        signal: opts.signal,
      });
      const text = r.text || retrievalAnswer(agent, question).text;
      return { agent, text, sources: [...new Set(ps.slice(0, 3).map((p) => p.src))], check: validate(text), mode: "live", model: r.model, tools: r.toolCalls.map((t) => t.name), actions };
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      const d = retrievalAnswer(agent, question);
      return { agent, ...d, check: validate(d.text), mode: "fallback", tools: [], actions: [], error: e instanceof Error ? e.message.slice(0, 160) : "provider error" };
    }
  }
  const d = retrievalAnswer(agent, question);
  return { agent, ...d, check: validate(d.text), mode: "demo", tools: [], actions: [] };
}
