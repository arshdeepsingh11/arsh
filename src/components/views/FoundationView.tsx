"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { education as E, projectBySlug, projects } from "@/lib/content";
import { vars } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

/** The Foundation: SAIT Software Development, as an explorable stack of the program's published outcomes. */
export function FoundationView() {
  const app = useApp();
  const [sel, setSel] = useState(0);
  const tower = useRef<HTMLDivElement>(null);
  const a = E.areas[sel];
  const path: [string, string, string, boolean][] = [
    ["SAIT", "School for Advanced Digital Technology", E.url, true],
    ["Software Development", `Diploma, completed ${E.completed}`, E.programUrl, true],
    ["Engineering", "Course-era repositories, Feb – Apr 2025", "/projects", false],
    ["Professional experience", "Full Stack Developer, BioAro Inc", "/identity", false],
    ["Projects", `${projects.length} worlds in the Multiverse`, "/projects", false],
  ];

  return (
    <>
      <header className="vhead f-head">
        <p className="eyebrow mono">The Foundation</p>
        <h1>{E.school}</h1>
        <p className="posit">{E.program} · {E.credential} · {E.place}</p>
        <p className="lede">Two years of structured engineering practice in Calgary, completed {E.completed}. Everything since has been built on it.</p>
        <div className="ctl wrap">{E.official.map((o) => <span key={o} className="pill">{o}</span>)}</div>
        <div className="ctl wrap">
          <a className="btn" href={E.programUrl} target="_blank" rel="noopener noreferrer">Official program page ↗</a>
          <a className="btn ghost" href={E.url} target="_blank" rel="noopener noreferrer">sait.ca ↗</a>
        </div>
      </header>

      <section className="campus">
        <div
          className="tower-wrap"
          onPointerMove={(e) => {
            if (app.reduced || !tower.current) return;
            const r = e.currentTarget.getBoundingClientRect();
            tower.current.style.setProperty("--ry", `${-38 + ((e.clientX - r.left) / r.width - 0.5) * 24}deg`);
            tower.current.style.setProperty("--rx", `${58 - ((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
          }}
        >
          <div className="tower" ref={tower} role="tablist" aria-label="Program outcomes">
            {E.areas.map((x, i) => (
              <button key={x.k} role="tab" aria-selected={sel === i} className={`floor ${sel === i ? "on" : ""}`} style={vars({ i })} onClick={() => setSel(i)} aria-label={x.k}><span>{x.k}</span></button>
            ))}
            <div className="plinth"><span>SAIT · CALGARY</span></div>
          </div>
        </div>
        <div className="panel f-out" role="tabpanel" aria-live="polite">
          <p className="mono dim">Program outcome {sel + 1} of {E.areas.length}</p>
          <h3>{a.k}</h3>
          <p>{a.d}</p>
          {a.ev.length ? (
            <>
              <p className="mono dim">Built during the program</p>
              <div className="ctl wrap">{a.ev.map((s) => <Link key={s} className="chip" href={`/projects/${s}`}>{projectBySlug(s)?.name}</Link>)}</div>
              <p className="dim sm">Linked by commit date (February – April 2025) and, for YEG-YYC, by its README naming the Mobile Development course.</p>
            </>
          ) : <p className="dim sm">No public repository is tied to this outcome.</p>}
        </div>
      </section>

      <section>
        <h2>From the classroom to production</h2>
        <ol className="path">
          {path.map(([t, d, u, ext], i) => (
            <li key={t} style={vars({ i })}>
              {ext ? <a href={u} target="_blank" rel="noopener noreferrer"><span className="mono">0{i + 1}</span><b>{t}</b><span>{d}</span></a>
                : <Link href={u}><span className="mono">0{i + 1}</span><b>{t}</b><span>{d}</span></Link>}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">The program at a glance</p><h2>What SAIT Software Development covers</h2></div><a className="btn ghost" href={E.programUrl} target="_blank" rel="noopener noreferrer">Read the official page ↗</a></div>
        <div className="explain-grid">
          {[
            ["Full-stack, end to end", "Front-end and back-end work across web, mobile and desktop applications. No prior background required."],
            ["The whole lifecycle", "Designing, modelling, testing and implementing software, not just writing it."],
            ["Architecture and patterns", "Recognising and applying architectures, design patterns, frameworks and emerging technologies, with an eye on scalability and maintainability."],
            ["Platforms and cloud", "The basics of development platforms, operating systems and cloud-based infrastructure."],
            ["Secure, user-centred work", "Turning real user requirements into secure software, and troubleshooting when things break."],
            ["Professional practice", "Business communication, ethics and a capstone-style project completed with stakeholders."],
          ].map(([t, d], i) => <div key={t} className="explain"><span className="mono">0{i + 1}</span><b>{t}</b><p>{d}</p></div>)}
        </div>
        <div className="mini-stats" style={{ marginTop: 18 }}>
          <div><b>2</b><span>years</span></div><div><b>60</b><span>credits</span></div><div><b>20</b><span>courses</span></div><div><b>1</b><span>diploma, August 2025</span></div>
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Classroom → career</p><h2>Where the program shows up in his work</h2></div></div>
        <div className="bridge">
          {[
            ["Testing and the lifecycle", "Reduced production defects by 20% through functional, integration and regression testing on an EMR platform.", "/identity"],
            ["Secure solutions", "HL7 configuration and HIPAA compliance on BioEMR; Row Level Security in Secure Auth App.", "/projects/secure-auth"],
            ["Architecture", "HARU keeps its financial guarantees in the database; NEYU separates app, worker, cache and audit.", "/projects/haru"],
            ["Mobile development", "YEG-YYC was built for the Mobile Development course; the same skills reach a Capacitor phone app in NEYU.", "/projects/yeg-yyc"],
            ["Working with stakeholders", "Six or more client websites shipped from client briefs across healthcare, longevity, aesthetics and finance.", "/projects"],
          ].map(([a, b, href]) => <Link key={a} href={href}><span className="mono">Program: {a}</span><b>{b}</b></Link>)}
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Where the diploma leads</p><h2>Careers the program prepares for</h2></div></div>
        <div className="ctl wrap">{["Junior software developer", "Programmer", "Software tester", "Quality assurance specialist", "Database administrator", "Web developer", "Desktop support specialist"].map((c) => <span key={c} className="pill">{c}</span>)}</div>
        <p className="dim sm" style={{ marginTop: 12 }}>From SAIT&apos;s program page. The page also lists a transfer pathway to Griffith University&apos;s Bachelor of Information Technology.</p>
      </section>

      <p className="disclaimer">
        Program facts are taken from SAIT&apos;s public program page and paraphrased. The disciplines above are the program&apos;s published learning outcomes, not a transcript: Arshdeep&apos;s individual course record has not been added. This portfolio is not affiliated with, sponsored by or endorsed by SAIT, and does not use SAIT&apos;s logo.
      </p>
    </>
  );
}
