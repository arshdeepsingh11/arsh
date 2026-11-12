"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AgentConsole } from "@/components/agents/AgentConsole";
import { Avatar } from "@/components/agents/Avatar";
import { useApp } from "./AppProvider";
import { CommandPalette } from "./CommandPalette";
import { NAV } from "./nav";


const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const section = (path: string) => NAV.find((n) => (n.href === "/" ? path === "/" : path.startsWith(n.href))) ?? (path.startsWith("/agents") ? { href: "/agents", label: "Agents" } : NAV[0]);

/** The operating-system frame: status bar, spatial dock, command center, floating ARIA and the agent drawer. */
export function Shell({ children }: { children: ReactNode }) {
  const app = useApp();
  const path = usePathname();
  const [palette, setPalette] = useState(false);
  const [clock, setClock] = useState("");
  const [mac, setMac] = useState(true);
  const cur = section(path);
  const { closeAgent } = app;

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setClock(`${fmt.format(new Date())} Calgary`);
    tick();
    const t = setInterval(tick, 30_000);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") { setPalette(false); closeAgent(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { clearInterval(t); window.removeEventListener("keydown", onKey); };
  }, [closeAgent]);

  useEffect(() => {
    // Focus the new view and close the drawer on every route change.
    document.getElementById("view")?.focus({ preventScroll: true });
    closeAgent();
  }, [path, closeAgent]);

  const s = app.status;
  const modeLabel = s.mode === "live" ? "Agents: live model" : s.mode === "demo" ? "Agents: demo mode" : "Agents: connecting";
  const modeTitle = s.mode === "live" ? `${s.provider} · ${s.model}` : s.mode === "demo" ? s.reason : "Checking the agent service";

  return (
    <>
      <a className="skip" href="#view">Skip to content</a>
      <div className="sky" aria-hidden="true"><i /><i /><i /></div>
      <header className="top">
        <Link className="brand" href="/" aria-label="ARSH/OS home"><b>ARSH</b><span>/OS</span></Link>
        <span className="pill crumb">{cur.label}</span>
        <span className="sp" />
        <span className={`pill mode ${s.mode}`} title={modeTitle}>{modeLabel}</span>
        <span className="pill hide-s" suppressHydrationWarning>{clock}</span>
        <button className="pill" onClick={() => setPalette(true)} aria-label="Open command center">Search <kbd>{mac ? "⌘K" : "Ctrl K"}</kbd></button>
        <button className="pill hide-s" aria-pressed={app.sound} onClick={() => { app.setSound(!app.sound); }}>{app.sound ? "Sound on" : "Sound off"}</button>
        <button className="pill hide-s" aria-pressed={app.reduced} onClick={() => app.setReduced(!app.reduced)}>{app.reduced ? "Motion reduced" : "Motion on"}</button>
      </header>

      <main id="view" className={`view v-${cur.label.toLowerCase()}`} tabIndex={-1}>{children}</main>

      <nav className="dock" aria-label="Environments">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={cur.href === n.href ? "on" : ""} aria-current={cur.href === n.href ? "page" : undefined} onClick={() => app.blip()}>
            <Icon d={n.icon} /><span>{n.label}</span>
          </Link>
        ))}
      </nav>

      <button className="fab" onClick={() => app.openAgent("aria")} aria-label="Ask ARIA"><Avatar id="aria" /><span>Ask ARIA</span></button>

      {app.drawer && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) app.closeAgent(); }}>
          <AgentConsole key={app.drawer} id={app.drawer} layout="drawer" onSwitch={(x) => app.openAgent(x)} />
        </div>
      )}
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </>
  );
}
