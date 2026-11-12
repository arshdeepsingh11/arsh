"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { certificates, education, experience, fieldLoop, me, principles, projectBySlug, projects, skills } from "@/lib/content";
import { capabilities, currentFocus, stats } from "@/lib/content/extra";
import { Avatar } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

/** Professional identity: how he works, the record, technology mapped to where it was used, and the résumé. */
export function IdentityView({ initialTech }: { initialTech?: string }) {
  const app = useApp();
  const [loop, setLoop] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({ [experience[0].id]: true });
  const [tech, setTech] = useState<string | null>(initialTech ?? null);
  const [resume, setResume] = useState(false);

  const techs = useMemo(() => {
    const all = [...new Set([...experience.flatMap((e) => e.tech), ...projects.flatMap((p) => p.stack.map((s) => s.replace(/ \d+(\.\d+)?$/, "")))])];
    const uses = (t: string) => projects.filter((p) => p.stack.join(" ").includes(t)).length + experience.filter((e) => e.tech.includes(t)).length;
    const list = all.filter((t) => uses(t) > 1).slice(0, 22);
    if (initialTech && !list.includes(initialTech)) list.unshift(initialTech);
    return list;
  }, [initialTech]);

  useEffect(() => { if (initialTech) document.getElementById("tech")?.scrollIntoView({ block: "center" }); }, [initialTech]);
  useEffect(() => {
    if (!resume) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setResume(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [resume]);

  const techProjects = tech ? projects.filter((p) => p.stack.join(" ").includes(tech)) : [];
  const techRoles = tech ? experience.filter((e) => e.tech.includes(tech)) : [];
  const allSkills = Object.values(skills).flat();

  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">Identity · {me.city}</p>
        <h1>{me.name}</h1>
        <p className="posit">{me.line}</p>
        <p className="lede">{me.summary}</p>
        <div className="ctl wrap">
          <button className="btn" onClick={() => setResume(true)}>View résumé</button>
          <button className="btn ghost" onClick={() => app.openAgent("atlas")}><Avatar id="atlas" /> Brief me, ATLAS</button>
          <a className="btn ghost" href={me.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        </div>
      </header>

      <section className="quick">
        <div className="panel">
          <p className="mono dim">Quick facts</p>
          <dl className="facts-dl">
            <dt>Based in</dt><dd>{me.city}</dd>
            <dt>Now</dt><dd>{experience[0].role}, {experience[0].org} (since November 2025)</dd>
            <dt>Before</dt><dd>{experience[1].role}, {experience[1].org} ({experience[1].period})</dd>
            <dt>Education</dt><dd>{education.credential} in {education.program}, SAIT ({education.completed})</dd>
            <dt>Certificates</dt><dd>{certificates.length} · Java, C and C++, web design, computer basics</dd>
            <dt>Core stack</dt><dd>Next.js, React, TypeScript, Node.js, PostgreSQL, React Native</dd>
            <dt>AI</dt><dd>Gemini API, guardrails, document AI, prompt engineering, RAG</dd>
            <dt>Contact</dt><dd><a href={`mailto:${me.email}`}>{me.email}</a> · {me.phone}</dd>
          </dl>
        </div>
        <div className="panel">
          <p className="mono dim">Currently exploring · {currentFocus.source}</p>
          <ul className="facts">{currentFocus.exploring.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="tags">{currentFocus.aiStack.map((t) => <span key={t}>{t}</span>)}</div>
          <Link className="btn ghost sm" href="/ai">See these ideas explained</Link>
        </div>
      </section>

      <section className="mini-stats wide">
        {stats.map((x) => <Link key={x.label} href={x.href}><b>{x.n}</b><span>{x.label}</span></Link>)}
      </section>

      <section className="loop">
        <h2>In the field</h2>
        <p className="dim">Six moves that repeat across his roles and repositories. Select one for the evidence.</p>
        <div className="loop-ring" role="tablist">
          {fieldLoop.map((f, i) => <button key={f.k} role="tab" aria-selected={loop === i} onClick={() => setLoop(i)}><span className="mono">0{i + 1}</span>{f.k}</button>)}
        </div>
        <div className="loop-out" role="tabpanel" aria-live="polite"><h3>{fieldLoop[loop].t}</h3><p>{fieldLoop[loop].e}</p></div>
      </section>

      <section>
        <h2>Professional record</h2>
        <div className="timeline">
          {experience.map((e) => (
            <article key={e.id} className={`tl ${open[e.id] ? "open" : ""}`}>
              <button className="tl-h" aria-expanded={!!open[e.id]} onClick={() => setOpen({ ...open, [e.id]: !open[e.id] })}>
                <span className="mono">{e.period}</span><b>{e.role}</b><span>{e.org} · {e.place}</span>
              </button>
              <div className="tl-b">
                <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                <div className="tags">{e.tech.map((t) => <span key={t}>{t}</span>)}</div>
                {e.projects.length > 0 && (
                  <><p className="mono dim">Connected worlds</p><div className="ctl wrap">{e.projects.map((s) => <Link key={s} className="chip" href={`/projects/${s}`}>{projectBySlug(s)?.name}</Link>)}</div></>
                )}
                <p className="mono dim">Source: {e.src}</p>
              </div>
            </article>
          ))}
          <article className="tl edu">
            <Link className="tl-h" href="/foundation"><span className="mono">Completed {education.completed}</span><b>{education.credential}, {education.program}</b><span>{education.school} · Calgary →</span></Link>
          </article>
        </div>
      </section>

      <section id="tech">
        <h2>Technology, connected to where it was used</h2>
        <div className="ctl wrap">
          {techs.map((t) => <button key={t} className={`chip ${tech === t ? "on" : ""}`} aria-pressed={tech === t} onClick={() => setTech(t)}>{t}</button>)}
        </div>
        <div className="tech-out" aria-live="polite">
          {!tech ? <p className="dim">Select a technology.</p> : (
            <>
              <h3>{tech}</h3>
              {techRoles.length > 0 && <><p className="mono dim">Roles</p>{techRoles.map((e) => <p key={e.id}>{e.role}, {e.org}</p>)}</>}
              {techProjects.length > 0 && <><p className="mono dim">Projects</p><div className="ctl wrap">{techProjects.map((p) => <Link key={p.slug} className="chip" href={`/projects/${p.slug}`}>{p.name}</Link>)}</div></>}
              {!techRoles.length && !techProjects.length && <p className="dim">{allSkills.includes(tech) ? "Listed on the résumé; no public repository uses it yet." : "Not found in the record."}</p>}
            </>
          )}
        </div>
        <details className="skills"><summary>Full skills list from the résumé</summary>{Object.entries(skills).map(([k, v]) => <p key={k}><b>{k}:</b> {v.join(", ")}</p>)}</details>
      </section>

      <section>
        <h2>What he can build</h2>
        <div className="cap-cards">
          {capabilities.map((c) => (
            <div key={c.id} className="cap-card"><b>{c.title}</b><p>{c.line}</p><div className="ctl wrap">{c.evidence.slice(0, 2).map((e) => <Link key={e.label} className="chip" href={e.href}>{e.label}</Link>)}</div></div>
          ))}
        </div>
      </section>

      <section>
        <h2>Principles visible in the work</h2>
        <div className="princ">
          {principles.map((p) => <Link key={p.t} href={`/projects/${p.p}`}><b>{p.t}</b><span>{p.d}</span><i className="mono">{projectBySlug(p.p)?.name} →</i></Link>)}
        </div>
      </section>

      {resume && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setResume(false); }}>
          <div className="sheet-box" role="dialog" aria-modal="true" aria-label="Résumé">
            <header className="ctl" style={{ marginTop: 0 }}>
              <b>Résumé</b><span className="sp" />
              <a className="btn ghost sm" href="/resume/arshdeep-singh-resume.pdf" target="_blank" rel="noopener">Open PDF ↗</a>
              <button className="btn sm" onClick={() => setResume(false)} autoFocus>Close</button>
            </header>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="resume-view"><img src="/resume/arshdeep-singh-resume.jpg" alt="Résumé of Arshdeep Singh: Full Stack Developer at BioAro Inc, previously Visionaries Tech Solutions; SAIT Software Development diploma, August 2025." /></div>
          </div>
        </div>
      )}
    </>
  );
}
