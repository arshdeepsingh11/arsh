// ============================================================
//  DYNAMIC CASE STUDY — /case-studies/[slug]
//  Full deep-dive: Context, Problem, Goal, Approach, Execution,
//  Tech Stack, Impact, Learnings
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/helpers";
import { projects } from "@/data/portfolio";

// Pre-render all known slugs at build time
export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

// Dynamic SEO per case study
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Case Study Not Found" };
  return {
    title: project.title,
    description: project.shortDesc,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  // "Next case study" recommendation
  const idx = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(idx + 1) % projects.length];

  return (
    <article className="max-w-4xl mx-auto px-6 md:px-10 pt-10 pb-16">
      {/* Back link */}
      <Link
        href="/case-studies"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-8 transition-colors"
      >
        ← Back to Case Studies
      </Link>

      {/* HERO */}
      <header className="bg-gradient-to-br from-blue-500/[0.08] to-violet-500/[0.08] border border-glass-border rounded-2xl p-8 md:p-10 mb-8">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-mono rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          {project.label}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          {project.title}
        </h1>
        <p className="text-base md:text-lg text-muted leading-relaxed">
          {project.shortDesc}
        </p>
      </header>

      {/* IMPACT METRICS */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {project.metrics.map((m) => (
          <div
            key={m.label}
            className="bg-glass border border-glass-border rounded-xl p-4 sm:p-5 text-center"
          >
            <div className="font-mono text-xl sm:text-3xl font-bold text-blue-400">
              {m.number}
            </div>
            <div className="text-[11px] sm:text-xs text-muted mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* OVERVIEW BLOCK */}
      <Section heading="Context">{project.context}</Section>
      <Section heading="Problem">{project.problem}</Section>
      <Section heading="Goal">{project.goal}</Section>
      <Section heading="Engineering Approach">{project.approach}</Section>
      <Section heading="Execution">{project.execution}</Section>

      {/* TECH STACK */}
      <div className="bg-glass border border-glass-border rounded-xl p-6 md:p-7 mb-6">
        <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-blue-400 mb-4">
          Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 text-xs font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <Section heading="Learnings">{project.learnings}</Section>

      {/* GITHUB CTA */}
      <div className="flex flex-col sm:flex-row gap-3 mt-10 pt-8 border-t border-glass-border">
        <Link
          href={project.github}
          target="_blank"
          className="flex-1 px-6 py-3 rounded-lg bg-glass border border-glass-border text-sm font-medium text-center hover:bg-white/5 hover:border-blue-400/30 transition-all"
        >
          View Source on GitHub →
        </Link>
        <Link
          href={`/case-studies/${nextProject.slug}`}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium text-center hover:-translate-y-0.5 transition-transform"
        >
          Next: {nextProject.title} →
        </Link>
      </div>
    </article>
  );
}

// ── Local helper component for consistent text sections ──
function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-glass border border-glass-border rounded-xl p-6 md:p-7 mb-6">
      <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-blue-400 mb-3">
        {heading}
      </h3>
      <p className="text-sm md:text-base text-muted leading-relaxed">{children}</p>
    </div>
  );
}
