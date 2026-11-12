import { projects, type Project } from "@/lib/content";
import { tokenize } from "./retrieval";

/* Transparent project ranking used by NEX's tool, the Intelligence Network and NOVA's "similar work". */

const ROLE_WORDS: Record<string, string[]> = {
  ai: ["ai", "llm", "ml", "machine", "agent", "gemini", "claude", "intelligent", "model", "rag"],
  fullstack: ["full", "stack", "fullstack", "full-stack", "backend", "frontend", "web", "api", "database", "postgres"],
  mobile: ["mobile", "ios", "android", "expo", "native", "app"],
  health: ["health", "clinic", "medical", "emr", "patient"],
  commerce: ["shop", "commerce", "store", "retail", "storefront"],
  design: ["design", "ui", "ux", "3d", "visual", "creative"],
};

export function classify(task: string): Record<string, number> {
  const t = tokenize(task);
  const hit: Record<string, number> = {};
  for (const [k, ws] of Object.entries(ROLE_WORDS)) {
    const n = ws.filter((w) => t.includes(w)).length;
    if (n) hit[k] = n;
  }
  return Object.keys(hit).length ? hit : { fullstack: 1 };
}

export type Scored = { project: Project; score: number; why: string[] };

export function scoreProjects(task: string): Scored[] {
  const intent = classify(task);
  return projects
    .map((p) => {
      const txt = [p.name, p.kind, p.tag, p.stack.join(" "), p.facts.join(" "), p.cat].join(" ").toLowerCase();
      let s = 0;
      const why: string[] = [];
      for (const k of Object.keys(intent)) {
        const n = Math.min(3, ROLE_WORDS[k].filter((x) => txt.includes(x)).length);
        if (n) {
          s += n * 1.5;
          why.push(`${k} match ×${n}`);
        }
      }
      s += p.facts.length * 1.2 + p.stack.length * 0.4 + (p.live ? 3 : 0) + (p.contribution ? 3 : 0);
      if (p.live) why.push("live deployment");
      if (p.contribution) why.push("stated contribution");
      why.push(`${p.facts.length} documented features`);
      return { project: p, score: Math.round(s * 10) / 10, why };
    })
    .sort((a, b) => b.score - a.score);
}
