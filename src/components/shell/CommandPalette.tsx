"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { certificates, experience, projects, skills } from "@/lib/content";
import { AGENT_IDS, AGENTS, type AgentId } from "@/lib/content/agents";
import { LAB_MODULES } from "@/lib/lab";
import { useApp } from "./AppProvider";
import { NAV } from "./nav";

type Item = { t: string; k: string; s?: string; href?: string; agent?: AgentId; q?: string };

const INDEX: Item[] = [
  ...NAV.map((n) => ({ t: n.label, k: "Page", href: n.href })),
  ...projects.map((p) => ({ t: p.name, k: "Project", s: `${p.kind} · ${p.stack.join(" ")}`, href: `/projects/${p.slug}` })),
  ...AGENT_IDS.map((id) => ({ t: AGENTS[id].name, k: "AI agent", s: AGENTS[id].role, agent: id })),
  ...experience.map((e) => ({ t: `${e.role} · ${e.org}`, k: "Experience", s: e.period, href: "/identity" })),
  ...certificates.map((c) => ({ t: c.title, k: "Certificate", s: c.issuer, href: "/vault" })),
  { t: "SAIT Software Development Diploma", k: "Education", s: "Calgary", href: "/foundation" },
  ...LAB_MODULES.map((m) => ({ t: m.name, k: "Lab module", s: m.d, href: m.href ?? `/lab/${m.id}` })),
  ...[...new Set(Object.values(skills).flat())].map((t) => ({ t, k: "Technology", href: `/identity?tech=${encodeURIComponent(t)}#tech` })),
];

/** Command center (⌘K / Ctrl K): search everything, or hand the query to ARIA. */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const app = useApp();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const res = useMemo(() => {
    const n = q.toLowerCase().trim();
    const list = (n ? INDEX.filter((x) => `${x.t} ${x.s ?? ""} ${x.k}`.toLowerCase().includes(n)) : INDEX.filter((x) => x.k === "Page" || x.k === "AI agent")).slice(0, 9);
    if (n) list.push({ t: `Ask ARIA: "${q}"`, k: "Ask", agent: "aria", q });
    return list;
  }, [q]);
  const cur = Math.min(sel, res.length - 1);

  const run = (x?: Item) => {
    if (!x) return;
    onClose();
    if (x.agent) app.openAgent(x.agent, x.q);
    else if (x.href) router.push(x.href);
  };

  return (
    <div className="overlay pal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pal-box" role="dialog" aria-modal="true" aria-label="Command center">
        <input
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((cur + 1) % res.length); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((cur - 1 + res.length) % res.length); }
            if (e.key === "Enter") run(res[cur]);
          }}
          placeholder="Search projects, technologies, experience, certificates, agents, pages"
          aria-label="Search"
          aria-controls="pal-list"
          aria-activedescendant={res.length ? `pal-${cur}` : undefined}
          autoComplete="off"
        />
        <ul id="pal-list" role="listbox">
          {res.map((x, i) => (
            <li key={`${x.k}-${x.t}`} id={`pal-${i}`} role="option" aria-selected={i === cur} onClick={() => run(x)} onMouseEnter={() => setSel(i)}>
              <b>{x.t}</b><span>{x.s ?? ""}</span><i className="mono">{x.k}</i>
            </li>
          ))}
        </ul>
        <footer className="mono dim">↑↓ move · Enter open · Esc close · or ask ARIA anything</footer>
      </div>
    </div>
  );
}
