"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AGENT_IDS, AGENTS, CHARACTER_STATES, type AgentId, type CharacterState } from "@/lib/content/agents";
import type { AgentReply } from "@/lib/agents/conversation";
import { HANDOFF_LINE, routeAgent } from "@/lib/agents/router";
import { canSpeak, dictate, dictationSupported, speak, stopSpeaking } from "@/lib/voice";
import { useApp, type Turn } from "@/components/shell/AppProvider";
import { Avatar, vars } from "./Avatar";
import { CharacterCanvas } from "./CharacterCanvas";

type Props = { id: AgentId; layout: "drawer" | "page" };

const wait = (ms: number) => new Promise((z) => setTimeout(z, ms));

/**
 * The intelligence interface: one shared conversation with the whole team. The agent whose area a question is in
 * steps in to answer it (ATLAS for career, NEX for code, ...), and the previous one steps out.
 */
export function AgentConsole({ id, layout }: Props) {
  const app = useApp();
  const router = useRouter();
  const [active, setActive] = useState<AgentId>(id);
  const a = AGENTS[active];
  const turns = app.thread;
  const [state, setState] = useState<CharacterState>("greeting");
  const [swapping, setSwapping] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const stopMic = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const client = useIsClient();
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    setActive(id);
    setState("greeting");
    const t = setTimeout(() => setState((s) => (s === "greeting" ? "idle" : s)), 1600);
    const q = app.takePending(id);
    if (q) void send(q, id);
    else inputRef.current?.focus({ preventScroll: true });
    return () => { clearTimeout(t); abort.current?.abort(); stopMic.current?.(); stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: app.reduced ? "auto" : "smooth" }); }, [turns.length, waiting, app.reduced]);

  /** The current agent steps out and the next one steps in, with a short line in the chat. */
  async function handOver(to: AgentId, thread: Turn[]): Promise<Turn[]> {
    const from = activeRef.current;
    if (to === from) return thread;
    const withNote: Turn[] = [...thread, { role: "note", content: HANDOFF_LINE[to], agent: to }];
    app.setThread(withNote);
    setSwapping(true);
    setState("idle");
    await wait(app.reduced ? 0 : 280);
    setActive(to);
    setState("greeting");
    setSwapping(false);
    await wait(app.reduced ? 0 : 520);
    return withNote;
  }

  async function send(text: string, start?: AgentId) {
    const q = text.trim();
    if (!q || busy) return;
    const current = start ?? activeRef.current;
    setInput("");
    setBusy(true);
    let next: Turn[] = [...turnsRef.current, { role: "user", content: q }];
    app.setThread(next);
    // Same routing rules as the server, so the right character is already on stage while the answer is prepared.
    const predicted = routeAgent(q, current);
    next = await handOver(predicted, next);
    setWaiting(true);
    setState("thinking");
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent: current,
          route: true,
          // Hand-off notes are for the visitor only; the model sees the questions and answers.
          messages: next.filter((t) => t.role !== "note").slice(-20).map(({ role, content }) => ({ role, content })),
          intent: app.intent ?? undefined,
        }),
        signal: abort.current.signal,
      });
      if (res.status === 429) throw new Error("rate");
      if (!res.ok) throw new Error("http");
      const r = (await res.json()) as AgentReply;
      if (r.agent !== activeRef.current) next = await handOver(r.agent, next);
      setWaiting(false);
      const { text: content, agent: who, ...meta } = r;
      app.setThread([...next, { role: "assistant", content, agent: who, meta }]);
      app.blip(720, 0.06);
      if (r.mode === "fallback") { setState("error"); await wait(900); }
      setState("speaking");
      if (app.voice && canSpeak()) await speak(who, content);
      else await wait(Math.min(4000, 400 + content.length * 18));
      setState(r.actions.length ? "excited" : "idle");
      const nav = r.actions.find((x) => x.type === "navigate");
      if (nav) setTimeout(() => { app.closeAgent(); router.push(nav.href); }, 1200);
      else setTimeout(() => setState("idle"), 900);
    } catch (e) {
      setWaiting(false);
      if ((e as Error).name === "AbortError") return;
      const msg = (e as Error).message === "rate" ? "Too many questions in a short time. Please wait a minute and try again." : "Something went wrong while answering. Please try again.";
      app.setThread([...next, { role: "assistant", content: msg, agent: activeRef.current }]);
      setState("error");
      setTimeout(() => setState("idle"), 1800);
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    setMicError(null);
    if (listening) { stopMic.current?.(); return; }
    setListening(true);
    setState("listening");
    stopMic.current = dictate(
      (text, final) => { setInput(text); if (final) setState("idle"); },
      (err) => {
        setListening(false);
        setState("idle");
        if (err && err !== "no-speech" && err !== "aborted") setMicError(err === "not-allowed" ? "Microphone permission was declined. You can keep typing." : "Dictation stopped. You can keep typing.");
      },
    );
  }

  function pick(x: AgentId) {
    if (busy || x === active) return;
    setActive(x);
    setState("greeting");
    setTimeout(() => setState((s) => (s === "greeting" ? "idle" : s)), 1400);
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void send(input); };
  const modeNote =
    app.status.mode === "live" ? <><b>Live AI.</b> The agent whose area your question is in answers it, grounded in the verified record and checked before you see it.</>
    : app.status.mode === "demo" ? <><b>Demo mode.</b> No language model is configured, so agents answer by retrieval from the verified knowledge base. Nothing is generated.</>
    : <>Checking the agent service…</>;

  return (
    <div className={layout === "drawer" ? "agent-box" : "agent-page"} style={vars({ c: a.color, s: a.soft })} role={layout === "drawer" ? "dialog" : undefined} aria-modal={layout === "drawer" ? true : undefined} aria-label={`${a.name}, ${a.role}`}>
      {layout === "drawer" && <button className="close" onClick={app.closeAgent} aria-label="Close">×</button>}
      <div className="agent-stage">
        <div key={active} className={`swap ${swapping ? "out" : "in"}`}>
          <CharacterCanvas ids={[active]} states={{ [active]: state }} className="solo-wrap" fallback={<div className="solo-wrap"><Avatar id={active} size="big" /></div>} />
        </div>
        <div className="agent-id">
          <h2>{a.name}</h2>
          <p>{a.role}</p>
          <span className="pill state" aria-live="polite">{state}</span>
        </div>
        <div className="states" role="group" aria-label="Preview character states">
          {CHARACTER_STATES.map((s) => <button key={s} onClick={() => setState(s)}>{s}</button>)}
        </div>
        <div className="switch" role="group" aria-label="Talk to a specific agent">
          {AGENT_IDS.map((x) =>
            layout === "page" ? (
              <Link key={x} href={`/agents/${x}`} className={x === active ? "on" : ""} aria-label={AGENTS[x].name} title={`${AGENTS[x].name} · ${AGENTS[x].role}`}><Avatar id={x} /></Link>
            ) : (
              <button key={x} onClick={() => pick(x)} className={x === active ? "on" : ""} aria-label={AGENTS[x].name} title={`${AGENTS[x].name} · ${AGENTS[x].role}`}><Avatar id={x} /></button>
            ),
          )}
        </div>
      </div>

      <div className="chat">
        <div className="chat-top">
          <span className="sm" data-mode-note>{modeNote}</span>
          <span className="sp" />
          {client && canSpeak() && (
            <button className="pill" aria-pressed={app.voice} onClick={() => { if (app.voice) stopSpeaking(); app.setVoice(!app.voice); }}>{app.voice ? "Voice on" : "Voice off"}</button>
          )}
          <button className="pill" onClick={() => { abort.current?.abort(); app.clearThread(); setState("idle"); }}>Clear conversation</button>
        </div>
        <div className="log" ref={log} aria-live="polite">
          <Bubble who="bot" id={id} text={AGENTS[id].greet} />
          {turns.map((t, i) =>
            t.role === "note" ? <Handoff key={i} id={t.agent ?? active} text={t.content} />
            : <Bubble key={i} who={t.role === "user" ? "me" : "bot"} id={t.agent ?? active} text={t.content} meta={t.meta} />,
          )}
          {waiting && <Bubble who="bot" id={active} text="…" />}
        </div>
        <div className="suggest">{a.ask.map((s) => <button key={s} className="chip" onClick={() => void send(s)} disabled={busy}>{s}</button>)}</div>
        <form className="say" onSubmit={onSubmit}>
          <input ref={inputRef} value={input} onChange={(e) => { setInput(e.target.value); if (!busy) setState(e.target.value ? "listening" : "idle"); }} autoComplete="off" maxLength={2000} placeholder="Ask anything. The right agent answers." aria-label={`Message ${a.name}`} />
          {client && dictationSupported() && (
            <button type="button" className={`mic ${listening ? "on" : ""}`} onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "Stop dictation" : "Dictate"} title="Dictate. Your browser asks for microphone permission the first time.">●</button>
          )}
          <button className="btn" disabled={busy || !input.trim()}>Send</button>
        </form>
        {micError && <p className="err" role="alert">{micError}</p>}
        <p className="dim xs">Conversations stay in this tab&apos;s memory and are gone when you close it. Answers are checked against the verified knowledge base.</p>
      </div>
    </div>
  );
}

function Handoff({ id, text }: { id: AgentId; text: string }) {
  const a = AGENTS[id];
  return (
    <div className="handoff" style={vars({ c: a.color, s: a.soft })} role="status">
      <Avatar id={id} />
      <span>{text}</span>
    </div>
  );
}

function Bubble({ who, id, text, meta }: { who: "me" | "bot"; id: AgentId; text: string; meta?: Turn["meta"] }) {
  const a = AGENTS[id];
  return (
    <div className={`msg ${who}`} style={who === "bot" ? vars({ c: a.color, s: a.soft }) : undefined}>
      {who === "bot" && <Avatar id={id} />}
      <div>
        {who === "bot" && <b className="who">{a.name}</b>}
        <p>{text}</p>
        {meta && (
          <div className="meta">
            <span className={`tag ${meta.mode === "live" ? "live" : "demo"}`}>
              {meta.mode === "live" ? "live AI" : meta.mode === "fallback" ? "AI busy · answered from the record" : meta.mode === "guarded" ? "outside my scope · answered by the guard" : "demo · retrieval answer"}
            </span>
            <span className={`tag ${meta.check.ok ? "ok" : "warn"}`}>{meta.check.ok ? "✓ figures match sources" : `⚠ not found in sources: ${meta.check.issues.join(", ")}`}</span>
            {meta.tools.length > 0 && <span className="tag">tools: {[...new Set(meta.tools)].join(", ")}</span>}
            {meta.sources.map((s) => <span key={s} className="tag">{s}</span>)}
            {meta.actions.map((x) => <span key={x.href} className="tag live">opening {x.label}…</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/** Browser feature checks must wait until after hydration so server and client render the same markup. */
export function useIsClient() {
  const [c, setC] = useState(false);
  useEffect(() => setC(true), []);
  return c;
}
