"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { certificates, education, experience, fieldLoop, me, projectBySlug, projects, skills } from "@/lib/content";
import { AGENT_IDS, AGENTS, type AgentId, type CharacterState } from "@/lib/content/agents";
import { AI_CONCEPTS } from "@/lib/content/ai";
import { capabilities, faq, HERO, stats } from "@/lib/content/extra";
import { ORDER } from "@/lib/characters/order";
import { Avatar, vars } from "@/components/agents/Avatar";
import { CharacterCanvas } from "@/components/agents/CharacterCanvas";
import { AiHeroGraphic } from "@/components/ai/AiVisuals";
import { useApp } from "@/components/shell/AppProvider";

const ROUTES: Record<string, { why: string; label: string; steps: [string, string, string][] }> = {
  hire: { why: "a hiring decision", label: "I'm hiring", steps: [["/identity", "Identity", "Roles, measured results and the résumé"], ["/network", "Network", "Ask the agents to match him to your role"], ["/projects/neyu", "NEYU Health", "The flagship AI platform"]] },
  build: { why: "a project to build", label: "I have a project", steps: [["/collab", "Collaborate", "NOVA will help you scope it"], ["/projects", "Multiverse", "Try similar work, live"]] },
  ai: { why: "the AI work", label: "Show me the AI", steps: [["/ai", "AI Explained", "The ideas, in plain words"], ["/projects/neyu", "NEYU Health", "Safety rails around a clinical assistant"], ["/lab", "Intelligence Lab", "Working simulations"]] },
  look: { why: "a look around", label: "Just exploring", steps: [["/projects", "Multiverse", `${projects.length} project worlds`], ["/ai", "AI Explained", "Learn something new"], ["/vault", "Credential Vault", "Certificates on display"]] },
};

const SPOTLIGHT = ["neyu", "haru", "le-sac-dore"];

const JOURNEY = [
  { when: "Aug 2022 – Oct 2023", what: experience[1].role, where: experience[1].org, href: "/identity" },
  { when: "Dec 2022", what: "Basic of Computer", where: "IGEN Edutronics", href: "/vault" },
  { when: "Mar 2023", what: "Web Designing", where: "IGEN Edutronics", href: "/vault" },
  { when: "Sep 2023", what: "C and C++", where: "Shineway Software Solution", href: "/vault" },
  { when: "Dec 2023", what: "Core Java", where: "Shineway Software Solution", href: "/vault" },
  { when: "Feb – Apr 2025", what: "Course projects: mobile apps, web portals", where: "SAIT", href: "/foundation" },
  { when: education.completed, what: `${education.credential}, ${education.program}`, where: "SAIT, Calgary", href: "/foundation" },
  { when: "Nov 2025 – now", what: experience[0].role, where: `${experience[0].org} · BioEMR, Neyu, client sites`, href: "/identity" },
];

function useRotating(list: string[], ms: number, paused: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => { if (paused) return; const t = setInterval(() => setI((x) => (x + 1) % list.length), ms); return () => clearInterval(t); }, [list.length, ms, paused]);
  return list[i];
}

/** Shows the real number by default; if it starts below the fold, counts up when scrolled into view. */
function Count({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const m = value.match(/^(\d+)(.*)$/);
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!m || !ref.current) return;
    const target = Number(m[1]);
    let armed = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { if (!armed) { armed = true; setN(0); } return; }
      io.disconnect();
      if (!armed) return;
      const t0 = performance.now();
      const tick = (t: number) => { const k = Math.min(1, (t - t0) / 900); setN(Math.round(target * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); else setN(null); };
      requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <b ref={ref}>{m && n !== null ? `${n}${m[2]}` : value}</b>;
}

export function UniverseView() {
  const app = useApp();
  const [states, setStates] = useState<Partial<Record<AgentId, CharacterState>>>({});
  const [route, setRoute] = useState<string | null>(null);
  const [cap, setCap] = useState(capabilities[0].id);
  const [open, setOpen] = useState<number | null>(0);
  const word = useRotating(HERO.rotating, 2200, app.reduced);
  const c = capabilities.find((x) => x.id === cap)!;

  useEffect(() => {
    if (app.reduced) return;
    const timers = ORDER.flatMap((id, i) => [
      setTimeout(() => setStates((s) => ({ ...s, [id]: "greeting" })), 500 + i * 220),
      setTimeout(() => setStates((s) => ({ ...s, [id]: undefined })), 1800 + i * 220),
    ]);
    return () => timers.forEach(clearTimeout);
  }, [app.reduced]);

  const choose = (k: string) => {
    setRoute(k);
    app.setIntent(ROUTES[k].why);
    app.blip(880, 0.08);
    setStates((s) => ({ ...s, aria: "excited" }));
    setTimeout(() => setStates((s) => ({ ...s, aria: undefined })), 1400);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow mono">ARSH/OS · software developer · AI & intelligent systems</p>
          <h1>{HERO.title[0]}<br />{HERO.title[1]}</h1>
          <p className="hero-line">{HERO.line}</p>
          <p className="ticker" aria-live="off"><span className="mono dim">Lately:</span> <b key={word}>{word}</b></p>
          <p className="lede">{HERO.sub}</p>
          <div className="intent" role="group" aria-label="Tell ARIA why you are here">
            <span className="mono dim">Why are you here?</span>
            {Object.entries(ROUTES).map(([k, r]) => (
              <button key={k} className={`chip ${route === k ? "on" : ""}`} onClick={() => choose(k)} aria-pressed={route === k}>{r.label}</button>
            ))}
          </div>
          <div aria-live="polite">
            {route && (
              <div className="route">
                <Avatar id="aria" />
                <div>
                  <p><b>ARIA:</b> For {ROUTES[route].why}, I would take this route.</p>
                  <ol>{ROUTES[route].steps.map(([href, n, d]) => <li key={href}><Link href={href}><b>{n}</b> <span>{d}</span></Link></li>)}</ol>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="roster-host">
          <CharacterCanvas ids={ORDER} states={states} labels className="roster-stage" onPick={(id) => app.openAgent(id)} onHover={(id) => id && app.blip(520 + ORDER.indexOf(id) * 60, 0.05)} fallback={null} />
          <ul className="roster-list" aria-label="Open an agent">
            {AGENT_IDS.map((id) => (
              <li key={id}><button onClick={() => app.openAgent(id)} style={vars({ c: AGENTS[id].color, s: AGENTS[id].soft })}><Avatar id={id} /><span><b>{AGENTS[id].name}</b><i>{AGENTS[id].role}</i></span></button></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="signals s8" aria-label="Verified numbers">
        {stats.map((s) => <Link key={s.label} className="signal" href={s.href}><Count value={s.n} /><span>{s.label}</span><i className="mono">{s.src}</i></Link>)}
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">What he builds</p><h2>If you can imagine it, it can be built</h2></div><Link className="btn ghost" href="/projects">See all the work</Link></div>
        <div className="cap-wrap">
          <div className="cap-list" role="tablist" aria-label="Capabilities">
            {capabilities.map((x) => (
              <button key={x.id} role="tab" aria-selected={cap === x.id} className={cap === x.id ? "on" : ""} onClick={() => setCap(x.id)} onMouseEnter={() => setCap(x.id)}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={x.icon} /></svg>
                <span><b>{x.title}</b><i>{x.line}</i></span>
              </button>
            ))}
          </div>
          <div className="cap-detail" role="tabpanel" aria-live="polite" key={c.id}>
            <h3>{c.title}</h3>
            <p className="lede">{c.line}</p>
            <p>{c.detail}</p>
            <div className="tags">{c.tech.map((t) => <span key={t}>{t}</span>)}</div>
            <p className="mono dim">Proof</p>
            <div className="ctl wrap">{c.evidence.map((e) => <Link key={e.label} className="chip" href={e.href}>{e.label} →</Link>)}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Featured work</p><h2>Three worlds to start with</h2></div></div>
        <div className="spot">
          {SPOTLIGHT.map((s) => {
            const p = projectBySlug(s)!;
            return (
              <Link key={s} href={`/projects/${s}`} className="spot-card" style={vars({ h: p.hue })}>
                <span className="planet sm"><i /><em /></span>
                <span className={`badge ${p.live ? "live" : p.demo ? "demo" : ""}`}>{p.live ? "Use it live" : p.demo ? "Try it here" : "Explore"}</span>
                <b>{p.name}</b><span className="pcard-kind">{p.kind}</span><p>{p.tag}</p>
                <ul>{p.facts.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Meet the team</p><h2>Six AI agents, each with one job</h2></div><Link className="btn ghost" href="/network">Watch them work together</Link></div>
        <div className="agent-cards">
          {AGENT_IDS.map((id) => {
            const a = AGENTS[id];
            return (
              <button key={id} className="agent-card" style={vars({ c: a.color, s: a.soft })} onClick={() => app.openAgent(id)}>
                <Avatar id={id} size="lg" />
                <b>{a.name}</b><span className="mono">{a.role}</span>
                <p>{a.does[0]}</p>
                <i>Talk to {a.name} →</i>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ai-teaser">
        <div>
          <p className="eyebrow mono">AI Explained</p>
          <h2>Understand AI in ten minutes</h2>
          <p className="lede">LLMs, tokens, embeddings, RAG, agents and guardrails, explained simply, with something to touch for every idea.</p>
          <div className="ctl wrap">{AI_CONCEPTS.slice(0, 8).map((x) => <Link key={x.id} className="chip" href={`/ai#c-${x.id}`}>{x.title}</Link>)}</div>
          <div className="ctl"><Link className="btn" href="/ai">Start learning</Link></div>
        </div>
        <AiHeroGraphic />
      </section>

      <section className="loop-teaser">
        <div className="sec-head"><div><p className="eyebrow mono">How he works</p><h2>Six moves, every project</h2></div></div>
        <ol className="loop-row">
          {fieldLoop.map((f, i) => <li key={f.k}><span className="mono">0{i + 1}</span><b>{f.k}</b><p>{f.t}</p></li>)}
        </ol>
        <Link className="btn ghost" href="/identity">See the evidence behind each move</Link>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">The journey</p><h2>From first certificate to production AI</h2></div></div>
        <ol className="journey">
          {JOURNEY.map((j, i) => <li key={j.what} style={vars({ i })}><Link href={j.href}><span className="mono">{j.when}</span><b>{j.what}</b><span>{j.where}</span></Link></li>)}
        </ol>
        <p className="dim xs">From the résumé and the {certificates.length} certificates in the Vault.</p>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Toolbox</p><h2>The technology behind the work</h2></div></div>
        <div className="stack-grid">
          {Object.entries(skills).map(([k, v]) => <div key={k} className="stack-col"><span className="mono">{k}</span>{v.map((t) => <Link key={t} href={`/identity?tech=${encodeURIComponent(t)}#tech`}>{t}</Link>)}</div>)}
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Questions</p><h2>What people usually ask</h2></div></div>
        <div className="faq">
          {faq.map((f, i) => (
            <div key={f.q} className={`faq-item ${open === i ? "open" : ""}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}><b>{f.q}</b><span aria-hidden="true">{open === i ? "−" : "+"}</span></button>
              {open === i && <p>{f.a} {f.href && <Link href={f.href}>Learn more →</Link>}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Have something in mind?</h2>
        <p className="lede">Tell NOVA what you want to build. You&apos;ll get a clear brief in two minutes, and Arshdeep gets everything he needs to reply.</p>
        <div className="ctl wrap" style={{ justifyContent: "center" }}>
          <Link className="btn" href="/collab">Start a project</Link>
          <a className="btn ghost" href={`mailto:${me.email}`}>{me.email}</a>
        </div>
      </section>
    </>
  );
}
