"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AI_CONCEPTS } from "@/lib/content/ai";
import { currentFocus } from "@/lib/content/extra";
import { projectBySlug } from "@/lib/content";
import { AiHeroGraphic, VISUALS } from "@/components/ai/AiVisuals";
import { Avatar } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

const IN_PROJECTS: [string, string, string][] = [
  ["neyu", "Guardrails, document reading, fallbacks, evidence", "22 AI features on Gemini, each with a rules-based fallback"],
  ["haru", "Agents with validated tools, provider switching", "The AI calls tools; code does the maths"],
  ["biongevity", "RAG with on-device BM25 and sources", "Top 3 passages sent to the assistant and shown as sources"],
  ["le-sac-dore", "AI concierge with an offline fallback", "Streaming chat that recommends pieces as cards"],
  ["overeo", "On-device assistant, optional live model", "Answers locally by default"],
];

/** AI Explained: the ideas behind modern AI in plain words, with something to touch for each. */
export function AiView() {
  const app = useApp();
  const [active, setActive] = useState(AI_CONCEPTS[0].id);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("c-", ""))), { rootMargin: "-40% 0px -55% 0px" });
    AI_CONCEPTS.forEach((c) => { const el = document.getElementById(`c-${c.id}`); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="ai-top">
        <div>
          <p className="eyebrow mono">AI Explained</p>
          <h1>AI, in plain words</h1>
          <p className="lede">Thirteen ideas behind today&apos;s AI, each explained like you&apos;d explain it to a friend, with something you can touch. And for every idea, where Arshdeep has used it in real work.</p>
          <div className="ctl wrap"><a className="btn" href="#c-llm">Start learning</a><button className="btn ghost" onClick={() => app.openAgent("oracle")}><Avatar id="oracle" /> Ask ORACLE anything</button></div>
        </div>
        <AiHeroGraphic />
      </section>

      <section className="focus">
        <div className="sec-head"><div><p className="eyebrow mono">What he is working on</p><h2>{currentFocus.headline}</h2></div></div>
        <div className="focus-grid">
          {currentFocus.exploring.slice(0, 3).concat(currentFocus.exploring.slice(4)).map((x, i) => <div key={x} className="focus-card" style={{ animationDelay: `${i * 120}ms` }}><span className="mono">0{i + 1}</span><b>{x}</b></div>)}
        </div>
        <div className="tags">{currentFocus.aiStack.map((t) => <span key={t}>{t}</span>)}</div>
        <p className="dim xs">Source: {currentFocus.source}.</p>
      </section>

      <div className="ai-layout">
        <nav className="ai-toc" aria-label="Concepts">
          {AI_CONCEPTS.map((c) => <a key={c.id} href={`#c-${c.id}`} className={active === c.id ? "on" : ""}><span className="mono">{c.n}</span>{c.title}</a>)}
        </nav>
        <div className="ai-list">
          {AI_CONCEPTS.map((c) => {
            const V = VISUALS[c.visual];
            return (
              <article key={c.id} id={`c-${c.id}`} className="concept">
                <div className="concept-text">
                  <p className="mono dim">Concept {c.n}</p>
                  <h2>{c.title}</h2>
                  <p className="simple">{c.simple}</p>
                  <p className="analogy"><span aria-hidden="true">💡</span> {c.analogy}</p>
                  <p>{c.more}</p>
                  <Link className="in-work" href={c.inWork.href}><span className="mono">In Arshdeep&apos;s work</span>{c.inWork.text}<i className="mono">Source: {c.inWork.src} →</i></Link>
                  <button className="link" onClick={() => app.openAgent("oracle", `Explain ${c.title.toLowerCase()} in one more simple example`)}>Ask ORACLE for another example →</button>
                </div>
                <V />
              </article>
            );
          })}
        </div>
      </div>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Where the ideas live</p><h2>AI inside his projects</h2></div></div>
        <div className="ai-map">
          {IN_PROJECTS.map(([slug, how, fact]) => (
            <Link key={slug} href={`/projects/${slug}`}><b>{projectBySlug(slug)?.name}</b><span>{how}</span><i>{fact}</i></Link>
          ))}
          <Link href="/network"><b>This website</b><span>Multi-agent orchestration, RAG, guardrails, validation</span><i>Six agents, separate calls, figures checked against sources</i></Link>
        </div>
      </section>
    </>
  );
}
