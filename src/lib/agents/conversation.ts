import type { AiMode, ChatMessage } from "@/lib/ai";
import { AGENTS, type AgentId } from "@/lib/content/agents";
import { PASSAGES } from "./knowledge";
import { systemPrompt } from "./prompts";
import { retrieve, validate, type Validation } from "./retrieval";
import { guard } from "./guard";
import { toolsFor, type AgentAction } from "./tools";
import { routeAgent } from "./router";

export type AgentReply = {
  /** The agent that answered. With routing on, this can differ from the agent the visitor was talking to. */
  agent: AgentId;
  /** Set when another agent took over the conversation for this answer. */
  handoff?: { from: AgentId; to: AgentId };
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
export async function answer(current: AgentId, history: ChatMessage[], ai: AiMode, opts: { intent?: string; signal?: AbortSignal; route?: boolean } = {}): Promise<AgentReply> {
  const question = history[history.length - 1]?.content ?? "";
  // One shared conversation: the agent whose area the question falls in answers it.
  const agent = opts.route ? routeAgent(question, current) : current;
  const handoff = agent !== current ? { from: current, to: agent } : undefined;
  const reply = await answerAs(agent, history, ai, opts, handoff);
  return handoff ? { ...reply, handoff } : reply;
}

async function answerAs(agent: AgentId, history: ChatMessage[], ai: AiMode, opts: { intent?: string; signal?: AbortSignal }, handoff?: { from: AgentId; to: AgentId }): Promise<AgentReply> {
  const question = history[history.length - 1]?.content ?? "";
  const recent = history.slice(-3, -1).map((m) => m.content).join(" ");
  const ps = retrieve(`${question} ${recent}`, agent, 7);
  const actions: AgentAction[] = [];

  const g = guard(agent, question);
  if (!g.ok) return { agent, text: g.reply, sources: [], check: validate(g.reply), mode: "guarded", tools: [], actions: [], error: g.kind };

  if (ai.mode === "live") {
    try {
      const core = PASSAGES.filter((p) => p.id === "me");
      const extra = [
        opts.intent ? `Shared context: the visitor said they are here for "${opts.intent}".` : "",
        handoff ? `You are taking over this conversation from ${AGENTS[handoff.from].name} because the question is in your area. Earlier assistant messages came from other agents. Do not greet again or introduce yourself at length; answer the question directly.` : "",
      ].filter(Boolean).join("\n");
      const r = await ai.provider.chat({
        system: systemPrompt(agent, [...core, ...ps], extra),
        messages: history.slice(-10),
        tools: toolsFor(agent, actions),
        signal: opts.signal,
      });
      const text = r.text || retrievalAnswer(agent, question).text;
      return { agent, text, sources: [...new Set(ps.slice(0, 3).map((p) => p.src))], check: validate(text), mode: r.text ? "live" : "fallback", tools: r.toolCalls.map((t) => t.name), actions };
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      // The details (model names, status codes) stay in the server log; visitors get a labelled retrieval answer.
      console.error(`[agents] live answer failed for ${agent}:`, e instanceof Error ? e.message : e);
      const d = retrievalAnswer(agent, question);
      return { agent, ...d, check: validate(d.text), mode: "fallback", tools: [], actions: [], error: "model_unavailable" };
    }
  }
  const d = retrievalAnswer(agent, question);
  return { agent, ...d, check: validate(d.text), mode: "demo", tools: [], actions: [] };
}
