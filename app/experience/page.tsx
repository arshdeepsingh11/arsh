// ============================================================
//  EXPERIENCE PAGE — Timeline + Education + Certifications
// ============================================================

import { experience, education, certifications } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import { accentMap } from "@/lib/helpers";

export const metadata = {
  title: "Experience",
  description: "Professional career timeline, education, and certifications.",
};

export default function ExperiencePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <SectionHeader
        label="// career"
        title="Experience"
        subtitle="My professional journey building and testing software at scale"
      />

      {/* TIMELINE */}
      <div className="relative pl-8 sm:pl-10">
        {/* Vertical line */}
        <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 via-violet-400 to-transparent" />

        {experience.map((job) => {
          const a = accentMap[job.accentColor];
          return (
            <div key={job.id} className="relative mb-10 last:mb-0">
              {/* Dot */}
              <div
                className={`absolute -left-[26px] sm:-left-[34px] top-1.5 w-2.5 h-2.5 rounded-full ${a.dot} ${a.glow}`}
              />

              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mb-2">
                {job.period}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1">{job.role}</h3>
              <div className={`text-sm mb-1 ${a.text}`}>{job.company}</div>
              <div className="text-xs text-muted mb-4">{job.location}</div>

              <ul className="space-y-2">
                {job.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted leading-relaxed pl-5 relative"
                  >
                    <span className="absolute left-0 text-violet-400 text-xs">→</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* EDUCATION */}
      <div className="my-12 h-px bg-glass-border" />
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet-400 mb-3">
        // education
      </div>
      <h2 className="text-xl font-bold mb-5">Education</h2>

      <div className="bg-glass border border-glass-border rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <div>
            <div className="text-base font-semibold">{education.degree}</div>
            <div className="text-sm text-blue-400 mt-1">{education.institution}</div>
            <div className="text-xs text-muted mt-1">{education.location}</div>
          </div>
          <div className="font-mono text-xs text-muted shrink-0">
            {education.graduated}
          </div>
        </div>
      </div>

      {/* CERTIFICATIONS */}
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet-400 mt-10 mb-3">
        // certifications
      </div>
      <h2 className="text-xl font-bold mb-5">Certifications</h2>

      <div className="flex flex-col gap-2">
        {certifications.map((c) => (
          <div
            key={c.name}
            className="flex justify-between items-center bg-glass border border-glass-border rounded-xl px-5 py-3.5"
          >
            <span className="text-sm">{c.name}</span>
            <span className="font-mono text-xs text-muted">{c.issuer}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
