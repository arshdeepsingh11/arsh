"use client";

import Link from "next/link";
import { useState } from "react";
import { projects, type Project } from "@/lib/content";
import type { RepoLive } from "@/lib/server/github";
import { Avatar, vars } from "@/components/agents/Avatar";
import { DEMOS, DEMO_NOTES } from "@/components/demos/Demos";
import { AppWindow, LiveWindow } from "@/components/demos/LiveWindow";
import { useApp } from "@/components/shell/AppProvider";
import { ArchitectureMap } from "./ArchitectureMap";

const gh = (p: Project, file?: string) => `https://github.com/arshdeepsingh11/${p.repo}${file ? `/blob/HEAD/${file}` : ""}`;
const LANG_COLORS = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#3572A5", "#b07219", "#7a8698"];

/** A project world: experience (demo or live site), architecture, code and verified facts. */
export function ProjectView({ project: p, live, liveReason }: { project: Project; live: RepoLive | null; liveReason?: string }) {
  const app = useApp();
  const [tab, setTab] = useState<"x" | "a" | "c" | "f">("x");
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const Demo = p.demo ? DEMOS[p.demo] : null;
  const tabs: [typeof tab, string][] = [["x", p.live ? "Use it live" : p.demo ? "Try it" : "Experience"], ["a", "Architecture"], ["c", "Code"], ["f", "Facts"]];
  const langTotal = live?.languages ? Object.values(live.languages).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={vars({ h: p.hue })}>
      <header className="whead">
        <Link className="back" href="/projects">← Multiverse</Link>
        <div className="wtitle">
          <span className="planet lg"><i /><em /></span>
          <div>
            <p className="eyebrow mono">{p.kind} · last commit {live?.pushedAt.slice(0, 10) ?? p.updated}</p>
            <h1>{p.name}</h1>
            <p className="lede">{p.tag}</p>
            <div className="tags">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
            {live ? (
              <div className="live-gh" aria-label="Live GitHub data">
                <span>★ {live.stars} stars</span><span>{live.forks} forks</span>{live.language && <span>{live.language}</span>}{live.topics.map((t) => <span key={t}>#{t}</span>)}
              </div>
            ) : liveReason ? <p className="dim xs">Live GitHub data unavailable ({liveReason}); showing the verified snapshot.</p> : null}
            <div className="ctl wrap">
              <a className="btn ghost" href={gh(p)} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              {p.live && <a className="btn" href={p.live} target="_blank" rel="noopener noreferrer">Open live site ↗</a>}
              <button className="btn ghost" onClick={() => app.openAgent("nex", `Explain the architecture of ${p.name}`)}><Avatar id="nex" /> Ask NEX</button>
            </div>
          </div>
        </div>
      </header>

      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      <section className="wbody" role="tabpanel">
        {tab === "x" && p.live && (
          <div className="demo-stack">
            <LiveWindow url={p.live} title={p.name} height={620} />
            {Demo && <AppWindow title={`${p.name} · how it works`} note={DEMO_NOTES[p.demo!]}><Demo /></AppWindow>}
          </div>
        )}
        {tab === "x" && !p.live && (Demo ? <AppWindow title={`${p.name} · working demo`} note={DEMO_NOTES[p.demo!]}><Demo /></AppWindow> : (
          <div className="panel">
            <h3>Why there is no running copy here</h3>
            <p>{p.name} needs its own server-side services ({p.stack.slice(-3).join(", ")}), and repository code is never executed in a visitor&apos;s browser. The closest honest experience is the architecture walk-through, built from the repository&apos;s own documentation and file structure. Ask NEX anything about it.</p>
            <button className="btn" onClick={() => setTab("a")}>Walk the architecture</button>
          </div>
        ))}
        {tab === "a" && <ArchitectureMap project={p} />}
        {tab === "c" && (
          <div className="code-grid">
            <div className="panel">
              <h3>Structure</h3>
              <ul className="tree">{p.tree.map((t) => <li key={t}>{t}</li>)}</ul>
              {live?.languages && langTotal > 0 && (
                <>
                  <h3 style={{ marginTop: 18 }}>Languages (live from GitHub)</h3>
                  <div className="langbar">{Object.entries(live.languages).map(([l, b], i) => <i key={l} title={l} style={{ width: `${(b / langTotal) * 100}%`, background: LANG_COLORS[i % LANG_COLORS.length] }} />)}</div>
                  <p className="dim xs">{Object.entries(live.languages).map(([l, b]) => `${l} ${Math.round((b / langTotal) * 100)}%`).join(" · ")}</p>
                </>
              )}
              <a className="btn ghost sm" href={gh(p)} target="_blank" rel="noopener noreferrer">Browse the repository ↗</a>
            </div>
            <div className="panel">
              {p.code ? (
                <><h3>{p.code.file}</h3><pre><code>{p.code.text}</code></pre><p className="dim sm">Excerpt from the public repository, unmodified apart from trimming. <a href={gh(p, p.code.file)} target="_blank" rel="noopener noreferrer">Open the file ↗</a></p></>
              ) : (
                <><h3>Source</h3><p>No excerpt has been selected for this world yet. The full source is public.</p><a className="btn sm" href={gh(p)} target="_blank" rel="noopener noreferrer">Read the code on GitHub ↗</a></>
              )}
            </div>
          </div>
        )}
        {tab === "f" && (
          <div className="code-grid">
            <div className="panel">
              <h3>What the repository documents</h3>
              <ul className="facts">{p.facts.map((f) => <li key={f}>{f}</li>)}</ul>
              <p className="dim sm">Source: README and source files of {p.repo}.</p>
            </div>
            <div className="panel">
              <h3>Contribution</h3>
              <p>{p.contribution ?? (p.team ? `${p.team} Individual roles are not stated in the repository.` : "The repository is under Arshdeep's account. A personal contribution note has not been written for this project yet.")}</p>
              {p.contribSrc && <p className="mono dim">Source: {p.contribSrc}</p>}
              {p.note && <p className="note">{p.note}</p>}
            </div>
          </div>
        )}
      </section>

      <Link className="next" href={`/projects/${next.slug}`} style={vars({ h: next.hue })}><span className="mono">Next world</span><b>{next.name} →</b></Link>
    </div>
  );
}
