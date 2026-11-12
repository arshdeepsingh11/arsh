"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AGENTS, type AgentId } from "@/lib/content/agents";
import { PLAN, type NetworkEvent, type Stage, type StepRecord } from "@/lib/agents/plan";
import { readNdjson } from "@/lib/ndjson";
import { Avatar, vars } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

const EXAMPLES = [
  "Explore Arshdeep's projects and identify the strongest technical project for a full-stack developer role.",
  "Which project best shows he can ship safe AI in healthcare?",
  "We need a mobile developer. What is the evidence?",
];

type Card = { stage: Stage; status: "active" | "done" | "error"; step?: StepRecord; error?: string };
type Result = Extract<NetworkEvent, { type: "result" }>;

/** The Intelligence Network: a task runs through separate agent calls on the server, streamed stage by stage. */
export function NetworkView() {
  const app = useApp();
  const [task, setTask] = useState(EXAMPLES[0]);
  const [include, setInclude] = useState<("pixel" | "nova")[]>([]);
  const [running, setRunning] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [plan, setPlan] = useState<{ mode: "live" | "demo"; provider?: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest", behavior: app.reduced ? "auto" : "smooth" }); }, [cards.length, app.reduced]);

  const stages = PLAN.filter((s) => !s.optional || include.includes(s.agent as "pixel" | "nova"));
  const activeIndex = cards.findIndex((c) => c.status === "active");
  const doneCount = cards.filter((c) => c.status === "done").length;

  async function run(e: FormEvent) {
    e.preventDefault();
    if (running || task.trim().length < 8) return;
    setRunning(true); setCards([]); setResult(null); setError(null); setPlan(null);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/agents/network", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ task, include }), signal: abort.current.signal });
      if (res.status === 429) throw new Error("The network allows a few runs per minute. Please wait a moment and try again.");
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? "The run could not start.");
      await readNdjson<NetworkEvent | { type: "fatal"; message: string }>(res, (ev) => {
        if (ev.type === "plan") setPlan({ mode: ev.mode, provider: ev.provider });
        if (ev.type === "step-start") { setCards((c) => [...c, { stage: ev.stage, status: "active" }]); app.blip(440 + ev.index * 50); }
        if (ev.type === "step-done") setCards((c) => c.map((x, i) => (i === ev.index ? { ...x, status: "done", step: ev.step } : x)));
        if (ev.type === "step-error") { setCards((c) => c.map((x, i) => (i === ev.index ? { ...x, status: "error", error: ev.message } : x))); setError("The run stopped because an agent's model call failed. No result is shown rather than a made-up one."); }
        if (ev.type === "result") setResult(ev);
        if (ev.type === "fatal") setError("The run did not complete.");
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">Intelligence Lab · module 01</p>
        <h1>The Intelligence Network</h1>
        <p className="lede">Give the agents a task. Each one does its own part in its own call, ORACLE checks the claims, and ARIA presents only what survived.</p>
        <p className="note">
          {app.status.mode === "live" ? <><b>Live model.</b> Every stage below is a separate server-side call to {app.status.provider}.</>
            : app.status.mode === "demo" ? <><b>Demo mode.</b> No language model is configured, so the same stages run as deterministic retrieval and scoring functions on the server. Nothing is generated.</>
            : "Checking the agent service…"}
        </p>
      </header>

      <form className="net-form" onSubmit={run}>
        <label htmlFor="net-task" className="mono">Task</label>
        <textarea id="net-task" rows={2} value={task} maxLength={500} onChange={(e) => setTask(e.target.value)} />
        <div className="ctl wrap">
          {EXAMPLES.map((x, i) => <button type="button" key={i} className="chip" onClick={() => setTask(x)}>Example {i + 1}</button>)}
          <span className="sp" />
          {(["pixel", "nova"] as const).map((id) => (
            <label key={id} className="tog">
              <input type="checkbox" checked={include.includes(id)} disabled={running} onChange={(e) => setInclude((v) => (e.target.checked ? [...v, id] : v.filter((x) => x !== id)))} />
              <Avatar id={id} /> add {AGENTS[id].name}
            </label>
          ))}
          <button className="btn" disabled={running}>{running ? "Agents working…" : "Run the network"}</button>
        </div>
      </form>

      <div className="net-pipe" aria-hidden="true">
        {stages.map((s, i) => (
          <PipeNode key={s.id + i} stage={s} first={i === 0} active={i === activeIndex} done={i < doneCount} />
        ))}
      </div>

      <div className="net-log" aria-live="polite">
        {cards.map((c, i) => {
          const a = AGENTS[c.stage.agent];
          return (
            <article key={i} className={`step ${c.status === "active" ? "act" : ""} ${c.status === "error" ? "err" : ""}`} style={vars({ c: a.color, s: a.soft })}>
              <Avatar id={c.stage.agent} />
              <div>
                <header><b>{a.name}</b><span className="mono">{c.stage.label}</span></header>
                <p className="sum">{c.stage.summary}</p>
                <p className="out">{c.status === "error" ? `This agent's call failed (${c.error}). The run was stopped rather than filled in.` : c.step?.text ?? ""}</p>
                {c.step && (
                  <div className="meta">
                    <span className={`tag ${c.step.check.ok ? "ok" : "warn"}`}>{c.step.check.ok ? "✓ figures match sources" : `⚠ not in sources: ${c.step.check.issues.join(", ")}`}</span>
                    {c.step.model && <span className="tag live">{c.step.model}</span>}
                  </div>
                )}
              </div>
            </article>
          );
        })}
        <div ref={endRef} />
      </div>

      {error && <p className="banner" role="alert">{error}</p>}
      {result && (
        <section className="result">
          <header>
            <Avatar id="aria" />
            <div>
              <p className="mono">{result.mode === "live" ? `Result · ${result.calls} separate live model calls${plan?.provider ? ` · ${plan.provider}` : ""}` : `Result · demo mode · ${result.steps.length} deterministic stages, no language model`}</p>
              <h2>ARIA&apos;s answer</h2>
            </div>
          </header>
          <p className="final">{result.final}</p>
          <h3>How NEX&apos;s ranking tool scored the projects</h3>
          <div className="rank">
            {result.ranking.map((t) => (
              <Link key={t.slug} href={`/projects/${t.slug}`}>
                <b>{t.name}</b><span className="bar"><i style={{ width: `${Math.min(100, t.score * 3.6)}%` }} /></span><em>{t.score}</em><span className="dim">{t.why.join(" · ")}</span>
              </Link>
            ))}
          </div>
          <p className="dim sm">The score is a transparent count: keyword matches between the task and each project&apos;s documented stack and features, plus points for documented depth, a live deployment and a stated contribution.</p>
        </section>
      )}

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">How it works</p><h2>Why several agents beat one</h2></div><Link className="btn ghost" href="/ai#c-multi">The idea, explained</Link></div>
        <div className="explain-grid">
          {[
            ["Separate calls", "Every stage is its own request to the model, with its own short instructions. Smaller jobs mean fewer mistakes."],
            ["Separate knowledge", "NEX only sees project facts, ATLAS only sees the career record. Each agent reads what its job needs and nothing else."],
            ["A verifier", "ORACLE reads what the others wrote and marks each claim as supported or not found before ARIA writes the final answer."],
            ["Checked in code too", "Every stage's output is scanned for numbers that are not in the verified record, and flagged right here on the page."],
            ["Fast and strong models", "Intermediate stages use a fast model; the verifier and the final answer use the stronger one."],
            ["Stops instead of guessing", "If any call fails, the run stops and says so. It never fills a gap with something invented."],
          ].map(([t, d], i) => <div key={t} className="explain"><span className="mono">0{i + 1}</span><b>{t}</b><p>{d}</p></div>)}
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Ideas to try</p><h2>Good tasks for the network</h2></div></div>
        <div className="ctl wrap">
          {["Is he a good fit for a junior AI engineer role?", "Which project proves he can handle sensitive data?", "What has he built with Supabase?", "Show the strongest evidence of testing and quality work.", "Which project best shows 3D and interactive design?"].map((x) => (
            <button key={x} className="chip" onClick={() => { setTask(x); window.scrollTo({ top: 0, behavior: app.reduced ? "auto" : "smooth" }); }}>{x}</button>
          ))}
        </div>
      </section>
    </>
  );
}

function PipeNode({ stage, first, active, done }: { stage: Stage; first: boolean; active: boolean; done: boolean }) {
  const a = AGENTS[stage.agent as AgentId];
  return (
    <>
      {!first && <i />}
      <div className={`pnode ${active ? "act" : ""} ${done ? "done" : ""}`} style={vars({ c: a.color, s: a.soft })}>
        <Avatar id={stage.agent} />
        <b>{a.name}</b>
        <span>{stage.label}</span>
      </div>
    </>
  );
}
