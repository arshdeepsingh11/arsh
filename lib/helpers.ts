// ============================================================
//  Utility helpers
// ============================================================

import { projects } from "@/data/portfolio";
import { Project } from "./types";

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

// Tailwind colour classes by accent name
export const accentMap = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    glow: "shadow-[0_0_10px_rgba(79,142,247,0.6)]",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
    glow: "shadow-[0_0_10px_rgba(139,92,246,0.6)]",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.6)]",
  },
} as const;
