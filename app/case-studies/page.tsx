// ============================================================
//  CASE STUDIES INDEX — Lists all case studies
// ============================================================

import Link from "next/link";
import { projects } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Case Studies",
  description: "In-depth engineering breakdowns of my most impactful work.",
};

export default function CaseStudiesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <SectionHeader
        label="// deep dives"
        title="Case Studies"
        subtitle="Engineering breakdowns of my most impactful work"
      />

      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/case-studies/${p.slug}`}
            className="group flex items-center justify-between bg-glass border border-glass-border rounded-xl p-5 sm:p-6 hover:bg-white/5 hover:border-blue-400/30 transition-all"
          >
            <div className="min-w-0">
              <div className="inline-block px-2.5 py-0.5 mb-2 text-[11px] font-mono rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {p.label}
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors truncate">
                {p.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted line-clamp-1">{p.shortDesc}</p>
            </div>
            <span className="text-blue-400 text-2xl ml-4 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
