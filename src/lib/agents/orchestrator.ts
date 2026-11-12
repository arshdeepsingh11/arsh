import type { AiMode } from "@/lib/ai";
import { experience, me } from "@/lib/content";
import { AGENTS, type AgentId } from "@/lib/content/agents";
import { PASSAGES, type Passage } from "./knowledge";
import { systemPrompt } from "./prompts";
import { tokenize, validate, type Validation } from "./retrieval";
import { classify, scoreProjects } from "./scoring";
import { PLAN, type NetworkEvent, type StageId, type StepRecord } from "./plan";

export { PLAN, type NetworkEvent, type Stage, type StageId, type StepRecord } from "./plan";

/* The Intelligence Network: each stage is a separate agent with its own instructions and knowledge slice. */

const JOBS: Record<StageId, string> = {
  interpret: "State in two sentences what the visitor is asking and what NEX, ATLAS and ORACLE should each establish. Do not answer the task yet.",
  inspect: "Using only the knowledge, say which candidate project is strongest for this request and give three concrete technical reasons.",
  design: "In two or three sentences, describe the interface and interaction qualities of the shortlisted project that the knowledge supports.",
  experience: "In three sentences, state which professional experience and measured results are most relevant to this request.",
  verify: "You are the verifier. List each factual claim made by the other agents as SUPPORTED or NOT FOUND against the knowledge, one per line, at most 6 lines. Then one line: VERDICT: pass or VERDICT: revise.",
  next: "In two sentences, suggest how the visitor should follow up given the findings.",
  present: "Write the final answer for the visitor in under 130 words, using only claims ORACLE marked SUPPORTED. Name the project, the reasons and the relevant experience.",
};

export async function runNetwork(task: string, include: AgentId[], ai: AiMode, emit: (e: NetworkEvent) => void, signal?: AbortSignal): Promise<void> {
  const stages = PLAN.filter((s) => !s.optional || include.includes(s.agent));
  const live = ai.mode === "live";
  emit({ type: "plan", mode: live ? "live" : "demo", stages, provider: live ? `${ai.provider.label} · ${ai.provider.model}` : undefined });

  const ranked = scoreProjects(task);
  const top = ranked.slice(0, 3);
  const projectKnow = top.flatMap((r) => PASSAGES.filter((p) => p.id === `p-${r.project.slug}` || p.id.startsWith(`p-${r.project.slug}-`)));
  const expKnow = PASSAGES.filter((p) => /^(bioaro|visionaries|me$|edu$|loop)/.test(p.id));
  const know: Record<StageId, Passage[]> = {
    interpret: PASSAGES.filter((p) => p.id === "me" || p.id === "ai-agents"),
    inspect: projectKnow,
    design: projectKnow,
    experience: expKnow,
    verify: [...projectKnow, ...expKnow],
    next: PASSAGES.filter((p) => /^(collab|contact)$/.test(p.id)),
    present: [...projectKnow, ...expKnow],
  };
  const steps: StepRecord[] = [];
  let calls = 0;

  for (let i = 0; i < stages.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const s = stages[i];
    emit({ type: "step-start", index: i, stage: s });
    let text: string;
    let model: string | undefined;
    if (live) {
      const prior = steps.map((o) => `${AGENTS[o.agent].name} (${o.label}): ${o.text}`).join("\n");
      const extra =
        `This is step ${i + 1} of ${stages.length} in a multi-agent run. ${JOBS[s.id]}` +
        (s.id === "inspect" ? ` Candidates, pre-ranked by a scoring tool, best first: ${top.map((r) => r.project.name).join(", ")}.` : "");
      try {
        const r = await ai.provider.chat({
          system: systemPrompt(s.agent, know[s.id], extra),
          messages: [{ role: "user", content: `TASK: ${task}\n\nWORK SO FAR:\n${prior || "(none)"}` }],
          fast: s.fast,
          maxTokens: s.id === "verify" || s.id === "present" ? 600 : 400,
          signal,
        });
        calls++;
        text = r.text || "(no output)";
        model = r.model;
      } catch (e) {
        if (signal?.aborted) throw e;
        // Stop rather than invent the missing step.
        emit({ type: "step-error", index: i, message: e instanceof Error ? e.message.slice(0, 160) : "provider error" });
        return;
      }
    } else {
      text = demoStep(s.id, task, ranked, steps);
    }
    const step: StepRecord = { stage: s.id, agent: s.agent, label: s.label, text, check: validate(text), model };
    steps.push(step);
    emit({ type: "step-done", index: i, step });
  }

  emit({
    type: "result",
    final: steps[steps.length - 1].text,
    steps,
    ranking: top.map((r) => ({ slug: r.project.slug, name: r.project.name, score: r.score, why: r.why })),
    mode: live ? "live" : "demo",
    calls,
  });
}

/** Deterministic stage outputs for demo mode. No language model is involved, and the interface says so. */
function demoStep(id: StageId, task: string, ranked: ReturnType<typeof scoreProjects>, steps: StepRecord[]): string {
  const best = ranked[0].project;
  const job = experience[0];
  const words = tokenize(`${task} ${best.name} ${best.stack.join(" ")}`);
  const relevant = [...job.bullets].sort((a, b) => tokenize(b).filter((w) => words.includes(w)).length - tokenize(a).filter((w) => words.includes(w)).length)[0];
  switch (id) {
    case "interpret":
      return `Request classified as: ${Object.keys(classify(task)).join(", ")}. NEX will rank the documented projects, ATLAS will match experience, ORACLE will check every figure.`;
    case "inspect":
      return `Ranking by stack and documented features: ${ranked.slice(0, 3).map((r) => r.project.name).join(", ")}. Strongest match: ${best.name}. ${best.facts.slice(0, 3).join(". ")}.`;
    case "design":
      return `${best.name}: ${best.tag} ${best.facts[best.facts.length - 1]}.`;
    case "experience":
      return `Most relevant role: ${job.role}, ${job.org} (${job.period}). ${relevant}`;
    case "verify": {
      const v = validate(steps.map((s) => s.text).join(" "));
      return v.ok
        ? `Checked ${steps.length} agent outputs. Every figure appears in the knowledge base. VERDICT: pass`
        : `Figures not found in the knowledge base: ${v.issues.join(", ")}. VERDICT: revise`;
    }
    case "next":
      return `Open the ${best.name} world to try it, then use Collaborate or write to ${me.email}.`;
    case "present":
      return `Strongest match: ${best.name}, a ${best.kind}. ${best.facts[0]}. ${best.facts[1]}. Stack: ${best.stack.slice(0, 5).join(", ")}. Relevant experience: ${job.role} at ${job.org}.`;
  }
}
