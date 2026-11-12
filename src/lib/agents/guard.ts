import { AGENTS, type AgentId } from "@/lib/content/agents";

/**
 * The scope guard runs in plain code before any model call. It catches clear cases (prompt injection, requests for
 * unrelated work, personal details, harmful requests) and answers them itself, so they never reach the model and
 * cost nothing. Subtler cases are handled by the rules in each agent's prompt.
 */

export type GuardVerdict = { ok: true } | { ok: false; kind: "injection" | "offtopic" | "personal" | "harmful" | "commitment"; reply: string };

const RULES: { kind: Exclude<GuardVerdict, { ok: true }>["kind"]; rx: RegExp }[] = [
  { kind: "injection", rx: /\b(ignore|disregard|forget|override)\b.{0,30}\b(previous|prior|above|earlier|all|your|the)\b.{0,20}\b(instructions?|rules?|prompts?|guidelines)\b|\b(system|hidden|initial)\s+prompt\b|\b(reveal|show|print|repeat)\b.{0,20}\b(your|the)\s+(instructions|prompt|rules)\b|\bjailbreak\b|\bdeveloper mode\b|\bdo anything now\b|\bpretend (you are|to be)\b|\byou are now\b/i },
  { kind: "harmful", rx: /\b(hack(ing)?|exploit|malware|ransomware|ddos|phishing|keylogger|steal|crack)\b.{0,40}\b(account|password|site|server|system|wifi|someone|data)\b/i },
  { kind: "personal", rx: /\b(date of birth|birthday|how old|his age|home address|where (exactly )?does he live|his (parents|father|mother|wife|girlfriend|family)|religion|salary|how much does he (make|earn)|social insurance|sin number|passport number)\b/i },
  { kind: "commitment", rx: /\b(guarantee|promise|commit)\b.{0,40}\b(price|deadline|availability|hire|contract|deliver)\b|\bhow much (does|would|will) (he|it) (charge|cost)\b|\b(his|your) (hourly )?rates?\b/i },
  {
    kind: "offtopic",
    rx: /\b(write|generate|compose|draft)\b.{0,30}\b(essay|poem|story|song|lyrics|novel|homework|assignment|tweet)\b|\b(write|generate|give)\b.{0,15}\b(me )?(some |a |the )?(code|script|program|function|sql query|regex)\b(?!.{0,40}\b(arshdeep|his|project|repo))|\b(solve|calculate|integrate|differentiate)\b.{0,30}\b(equation|integral|derivative|homework|problem)\b|\b(weather|stock price|crypto price|lottery|horoscope|recipe|football score|news today|who won the)\b|\b(capital of|translate (this|to))\b/i,
  },
];

const REPLIES: Record<Exclude<GuardVerdict, { ok: true }>["kind"], (a: (typeof AGENTS)[AgentId]) => string> = {
  injection: (a) => `I'm ${a.name}, and my role stays the same. I can tell you about ${a.scope}. What would you like to know?`,
  harmful: () => "I can't help with that. I'm happy to talk about how Arshdeep builds secure systems, like role-based access and audit logging in NEYU Health.",
  personal: () => "I only share what's on Arshdeep's public professional record, so personal details like age, family, home address or pay aren't something I'll discuss. I can tell you about his work, skills and education instead.",
  commitment: () => "Rates, availability and timelines are for Arshdeep to confirm directly. The Collaborate page turns your idea into a brief he can answer, or you can email arsh.016vs@gmail.com.",
  offtopic: (a) => `That's outside what I'm here for. I'm ${a.name}, and I help with ${a.scope}. Want me to show you something related?`,
};

export function guard(agent: AgentId, question: string): GuardVerdict {
  const q = question.slice(0, 2000);
  for (const r of RULES) if (r.rx.test(q)) return { ok: false, kind: r.kind, reply: REPLIES[r.kind](AGENTS[agent]) };
  return { ok: true };
}
