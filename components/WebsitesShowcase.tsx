"use client";

// ============================================================
//  WebsitesShowcase — site switcher tabs + iPad frame + details
// ============================================================

import { useState } from "react";
import IPadFrame from "./IPadFrame";
import { accentMap } from "@/lib/helpers";

type Site = {
  name: string;
  url: string;
  domain: string;
  role: string;
  year: string;
  accent: string;
  description: string;
  features: string[];
  tags: string[];
};

type Props = { sites: Site[] };

export default function WebsitesShowcase({ sites }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sites[activeIndex];
  const a = accentMap[active.accent as keyof typeof accentMap];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Client website switcher"
        className="flex flex-wrap gap-2 mb-6 justify-center"
      >
        {sites.map((s, i) => {
          const isActive = i === activeIndex;
          const tabA = accentMap[s.accent as keyof typeof accentMap];
          return (
            <button
              key={s.url}
              role="tab"
              aria-selected={isActive}
              aria-controls="ipad-frame-panel"
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium tracking-wide transition-all border ${
                isActive
                  ? `${tabA.bg} ${tabA.text} ${tabA.border}`
                  : "bg-glass border-glass-border text-muted hover:text-text hover:border-white/15"
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div id="ipad-frame-panel" role="tabpanel" className="mb-10">
        <IPadFrame
          key={active.url}
          url={active.url}
          domain={active.domain}
          title={active.name}
        />
      </div>

      <div className="bg-glass border border-glass-border rounded-xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className={`font-mono text-[10px] tracking-[0.2em] uppercase mb-2 ${a.text}`}>
              {active.role} · {active.year}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-1">{active.name}</h3>
            <div className={`text-xs font-mono ${a.text}`}>{active.domain}</div>
          </div>
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition"
          >
            Open live ↗
          </a>
        </div>

        <p className="text-sm md:text-base text-muted leading-relaxed mb-5">
          {active.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-5">
          {active.features.map((f) => (
            <div key={f} className="text-sm text-muted leading-relaxed pl-4 relative">
              <span className="absolute left-0 text-violet-400">→</span>
              {f}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {active.tags.map((t) => (
            <span
              key={t}
              className={`px-2.5 py-1 text-[11px] font-mono rounded ${a.bg} ${a.text} border ${a.border}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}