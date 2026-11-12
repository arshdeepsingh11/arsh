import type { AgentId } from "@/lib/content/agents";
import type { Validation } from "./retrieval";

/* Stages and streamed events of the Intelligence Network. Shared by the server orchestrator and the interface. */

export type StageId = "interpret" | "inspect" | "design" | "experience" | "verify" | "next" | "present";
export type Stage = { id: StageId; agent: AgentId; label: string; summary: string; optional?: boolean; fast: boolean };

export const PLAN: Stage[] = [
  { id: "interpret", agent: "aria", label: "Interpret the request", summary: "Reading the task and deciding what each agent needs to establish.", fast: true },
  { id: "inspect", agent: "nex", label: "Inspect technical projects", summary: "Ranking repositories against the request using their stacks and documented features.", fast: true },
  { id: "design", agent: "pixel", label: "Review interface and design work", summary: "Looking at the visual and interaction side of the shortlisted work.", optional: true, fast: true },
  { id: "experience", agent: "atlas", label: "Evaluate professional experience", summary: "Matching roles and verified results to the request.", fast: true },
  { id: "verify", agent: "oracle", label: "Check the claims", summary: "Comparing every figure and project named so far against the knowledge base.", fast: false },
  { id: "next", agent: "nova", label: "Suggest next steps", summary: "Turning the findings into a concrete way to follow up.", optional: true, fast: true },
  { id: "present", agent: "aria", label: "Present the result", summary: "Combining the verified findings into one answer.", fast: false },
];

export type StepRecord = { stage: StageId; agent: AgentId; label: string; text: string; check: Validation; model?: string };
export type NetworkEvent =
  | { type: "plan"; mode: "live" | "demo"; stages: Stage[]; provider?: string }
  | { type: "step-start"; index: number; stage: Stage }
  | { type: "step-done"; index: number; step: StepRecord }
  | { type: "step-error"; index: number; message: string }
  | { type: "result"; final: string; steps: StepRecord[]; ranking: { slug: string; name: string; score: number; why: string[] }[]; mode: "live" | "demo"; calls: number };
