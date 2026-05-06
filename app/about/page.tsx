// ============================================================
//  ABOUT PAGE — Journey, focus areas, future goals
// ============================================================

import { about } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "About",
  description: "About Arshdeep Singh — software developer and QA automation engineer.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <SectionHeader
        label="// about me"
        title="The Engineer Behind the Code"
        subtitle="A results-driven developer who bridges quality engineering with full-stack development"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: prose */}
        <div className="space-y-4">
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-sm md:text-base text-muted leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* RIGHT: cards */}
        <div className="space-y-4">
          <div className="bg-glass border border-glass-border rounded-xl p-5 sm:p-6">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-blue-400 mb-4">
              Focus Areas
            </div>
            <ul className="space-y-2.5">
              {about.focusAreas.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-glass border border-glass-border rounded-xl p-5 sm:p-6">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-cyan-400 mb-4">
              Future Goals
            </div>
            <ul className="space-y-2.5">
              {about.futureGoals.map((g) => (
                <li key={g} className="flex items-center gap-3 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
