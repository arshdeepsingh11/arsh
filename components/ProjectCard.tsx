// ============================================================
//  ProjectCard — clickable card linking to case study
// ============================================================

import Link from "next/link";
import { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/case-studies/${project.slug}`}
      className="group relative block bg-glass border border-glass-border rounded-xl p-6 overflow-hidden transition-all duration-200 hover:bg-white/5 hover:border-blue-400/30 hover:-translate-y-1"
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />

      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-violet-400 mb-3">
        {project.label}
      </div>

      <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
        {project.title}
      </h3>

      <p className="text-sm text-muted leading-relaxed mb-4">
        {project.shortDesc}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.stack.slice(0, 5).map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 text-[11px] font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted group-hover:text-blue-400 transition-colors flex items-center gap-1">
        Read case study <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </Link>
  );
}
