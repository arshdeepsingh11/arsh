"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LAB_MODULES } from "@/lib/lab";
import { Avatar } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

/** The Intelligence Lab: module tiles plus the selected working simulation. */
export function LabView({ moduleId }: { moduleId: string }) {
  const app = useApp();
  const host = useRef<HTMLDivElement>(null);
  const mod = LAB_MODULES.find((m) => m.id === moduleId && m.mount) ?? LAB_MODULES[1];

  useEffect(() => {
    if (!host.current || !mod.mount) return;
    const el = document.createElement("div");
    host.current.replaceChildren(el);
    const cleanup = mod.mount(el);
    return () => { cleanup(); el.remove(); };
  }, [mod]);

  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">The Intelligence Lab</p>
        <h1>Six working systems</h1>
        <p className="lede">Nothing here is a picture of a simulation. Each module computes its result in your browser, on fictional sample data where data is needed.</p>
        <div className="ctl"><button className="btn ghost" onClick={() => app.openAgent("oracle")}><Avatar id="oracle" /> Ask ORACLE how these work</button></div>
      </header>
      <nav className="lab-tiles" aria-label="Lab modules">
        {LAB_MODULES.map((m) => (
          <Link key={m.id} className={`tile ${m.id === mod.id ? "on" : ""}`} href={m.href ?? `/lab/${m.id}`} aria-current={m.id === mod.id ? "page" : undefined} scroll={false}>
            <span className="mono">{m.n}</span><b>{m.name}</b><span>{m.d}</span>
          </Link>
        ))}
      </nav>
      <section className="lab-stage" aria-labelledby="lab-title">
        <header><span className="mono">Module {mod.n}</span><h2 id="lab-title">{mod.name}</h2></header>
        <div ref={host} className="lab-body" />
      </section>
      {mod.see && (
        <section className="lab-guide">
          <div className="panel"><p className="mono dim">What you are seeing</p><p>{mod.see}</p></div>
          <div className="panel"><p className="mono dim">Try this</p><ul className="facts">{mod.try?.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="panel"><p className="mono dim">Why it matters</p><p>{mod.why}</p></div>
        </section>
      )}
      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Keep going</p><h2>Learn the ideas behind the Lab</h2></div><Link className="btn ghost" href="/ai">AI Explained</Link></div>
        <div className="ctl wrap">{LAB_MODULES.filter((m) => m.id !== mod.id).map((m) => <Link key={m.id} className="chip" href={m.href ?? `/lab/${m.id}`}>{m.n} · {m.name}</Link>)}</div>
      </section>
    </>
  );
}
