// ============================================================
//  Shared TypeScript types
// ============================================================

export interface Project {
  slug: string;
  title: string;
  label: string;
  shortDesc: string;
  stack: string[];
  context: string;
  problem: string;
  goal: string;
  approach: string;
  execution: string;
  metrics: { number: string; label: string }[];
  learnings: string;
  github: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  accentColor: "blue" | "violet" | "cyan";
  bullets: string[];
}

export interface SkillGroup {
  category: string;
  accent: "blue" | "violet" | "cyan";
  items: string[];
}

export interface ClientSite {
  name: string;
  url: string;
  domain: string;
  role: string;
  year: string;
  accent: "blue" | "violet" | "cyan";
  description: string;
  features: string[];
  tags: string[];
}
