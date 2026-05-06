// ============================================================
//  WEBSITES PAGE — Live client websites shipped for BioAro
// ============================================================

import { clientSites } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import { accentMap } from "@/lib/helpers";

export const metadata = {
  title: "Websites",
  description:
    "Live client websites designed and developed for BioAro's healthcare and partner clients.",
};

export default function WebsitesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <SectionHeader
        label="// live client work"
        title="Websites I've Shipped"
        subtitle="Production websites designed, built and delivered for BioAro's healthcare and partner clients"
      />

      {/* Intro card */}
      <div className="bg-gradient-to-br from-blue-500/[0.06] to-violet-500/[0.06] border border-glass-border rounded-2xl p-6 md:p-8 mb-8">
        <p className="text-sm md:text-base text-muted leading-relaxed">
          As part of my role at BioAro, I work directly with client briefs to design and ship
          full websites — branding, layout, content structure, booking flows, and WordPress /
          Elementor delivery. Each of the four sites below is live in production and serves
          real users every day.
        </p>
      </div>

      {/* Sites grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clientSites.map((site) => {
          const a = accentMap[site.accent as keyof typeof accentMap];
          return (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block bg-glass border border-glass-border rounded-xl p-6 overflow-hidden transition-all duration-200 hover:bg-white/5 hover:border-blue-400/30 hover:-translate-y-1"
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />

              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-violet-400">
                  {site.role} · {site.year}
                </div>
                <span className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
                  ↗
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                {site.name}
              </h3>
              <div className={`text-xs font-mono mb-3 ${a.text}`}>
                {site.domain}
              </div>

              <p className="text-sm text-muted leading-relaxed mb-4">
                {site.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 mb-4">
                {site.features.map((f) => (
                  <li
                    key={f}
                    className="text-xs text-muted leading-relaxed pl-4 relative"
                  >
                    <span className="absolute left-0 text-violet-400">→</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {site.tags.map((t) => (
                  <span
                    key={t}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded ${a.bg} ${a.text} border ${a.border}`}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 text-xs text-muted group-hover:text-blue-400 transition-colors flex items-center gap-1">
                Visit live site <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="mt-10 bg-glass border border-glass-border rounded-xl p-5 sm:p-6 text-center">
        <p className="text-sm text-muted leading-relaxed">
          Want a website like these for your business or clinic? I&apos;m available for
          freelance web design and development work alongside my full-time role.
        </p>
      </div>
    </div>
  );
}
