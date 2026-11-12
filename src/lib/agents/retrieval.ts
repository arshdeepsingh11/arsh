import type { AgentId } from "@/lib/content/agents";
import { CORPUS, PASSAGES, type Passage } from "./knowledge";

/* BM25 retrieval over the verified passages, and the response validator. Pure functions; safe on server and client. */

const STOP = new Set(
  "a an the of to in on for and or is are was were be with by at as it its his her he she they this that what which who how do does did can could would should i me my we you your about from into than then there here tell show give more most any some".split(" "),
);
export const tokenize = (s: string) => (s.toLowerCase().match(/[a-z0-9+#.]+/g) ?? []).map((w) => w.replace(/\.$/, "")).filter((w) => w.length > 1 && !STOP.has(w));

type Doc = { p: Passage; tf: Map<string, number>; len: number };
const DOCS: Doc[] = PASSAGES.map((p) => {
  const t = tokenize(`${p.title} ${p.text}`);
  const tf = new Map<string, number>();
  t.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1));
  return { p, tf, len: t.length };
});
const AVG = DOCS.reduce((a, d) => a + d.len, 0) / DOCS.length;
const DF = new Map<string, number>();
DOCS.forEach((d) => d.tf.forEach((_, w) => DF.set(w, (DF.get(w) ?? 0) + 1)));

/** Visitors ask in everyday words; the record uses résumé words. Expand common question vocabulary to match. */
const EXPAND: [RegExp, string][] = [
  [/\b(stud(y|ied|ies)|school|college|education|degree|diploma|graduat\w*|learn(ed)?)\b/i, "education diploma sait software development program"],
  [/\b(work(s|ing)?|job|employ\w*|current(ly)?|now|role|position|company)\b/i, "full stack developer bioaro present role"],
  [/\b(result|achiev\w*|impact|metric|accomplish\w*|outcome)s?\b/i, "reduced defects percent testing effort shipped"],
  [/\b(contact|email|reach|hire|phone|touch)\b/i, "contact email phone collaborate"],
  [/\b(certif\w*|credential|course)s?\b/i, "certificate issued course"],
  [/\b(safe|safety|guardrail\w*|emergenc\w*)\b/i, "safety guardrails emergency rules fallback"],
  [/\b(llm|llms|gpt|chatgpt|language model|gemini|claude)\b/i, "large language models llm next word gemini"],
  [/\b(rag|retriev\w*|grounded|sources?)\b/i, "rag retrieval facts sources passages"],
  [/\b(vector|embedding\w*|semantic)\b/i, "embeddings vector databases meaning"],
  [/\b(agentic|agents?|tools?|autonomous)\b/i, "agents tool use validated tools"],
  [/\b(build|make|create|can he|capable|services|offer)\b/i, "what he builds capabilities"],
  [/\b(working on|exploring|learning|focus(ed)?|interested in|currently|lately)\b/i, "currently exploring focus working now"],
];
export function expand(query: string): string {
  return EXPAND.reduce((q, [rx, extra]) => (rx.test(query) ? `${q} ${extra}` : q), query);
}

/** Top-k passages for a query. Passages tagged for the asking agent get a modest boost. */
export function retrieve(query: string, agent?: AgentId | null, k = 6): Passage[] {
  return retrieveScored(query, agent, k).map((x) => x.p);
}

/** Same as retrieve(), with BM25 scores and the expanded query terms, for visualising how retrieval works. */
export function retrieveScored(query: string, agent?: AgentId | null, k = 6): { p: Passage; s: number }[] {
  const q = tokenize(expand(query));
  return DOCS.map((d) => {
    let s = 0;
    for (const w of q) {
      const f = d.tf.get(w);
      if (!f) continue;
      const df = DF.get(w) ?? 0;
      const idf = Math.log(1 + (DOCS.length - df + 0.5) / (df + 0.5));
      s += (idf * (f * 2.2)) / (f + 1.2 * (0.25 + (0.75 * d.len) / AVG));
    }
    if (s > 0 && agent && d.p.tags.includes(agent)) s *= 1.35;
    return { p: d.p, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k);
}

export type Validation = { ok: boolean; issues: string[] };

/**
 * Checks that every figure in a response (numbers, percentages, "6+") appears somewhere in the verified knowledge.
 * Deliberately simple and transparent: it cannot judge reasoning, but it reliably catches invented metrics.
 */
export function validate(text: string): Validation {
  const issues = new Set<string>();
  for (const raw of text.match(/\d[\d,.]*\+?%?/g) ?? []) {
    const n = raw.replace(/[.,]$/, "");
    if (n.length < 2 && !n.includes("%")) continue;
    if (!CORPUS.includes(n.toLowerCase())) issues.add(n);
  }
  return { ok: issues.size === 0, issues: [...issues] };
}
