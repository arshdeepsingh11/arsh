"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AGENT_IDS, AGENTS, CHARACTER_STATES, type AgentId, type CharacterState } from "@/lib/content/agents";
import type { AgentReply } from "@/lib/agents/conversation";
import { canSpeak, dictate, dictationSupported, speak, stopSpeaking } from "@/lib/voice";
import { useApp, type Turn } from "@/components/shell/AppProvider";
import { Avatar, vars } from "./Avatar";
import { CharacterCanvas } from "./CharacterCanvas";

type Props = { id: AgentId; layout: "drawer" | "page"; onSwitch?: (id: AgentId) => void };

/** The intelligence interface for one agent: animated character, state preview, grounded chat, voice. */
export function AgentConsole({ id, layout, onSwitch }: Props) {
  const a = AGENTS[id];
  const app = useApp();
  const router = useRouter();
  const turns = app.histories[id] ?? [];
  const [state, setState] = useState<CharacterState>("greeting");
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

  useEffect(() => {
    setState("greeting");
    const t = setTimeout(() => setState((s) => (s === "greeting" ? "idle" : s)), 1600);
    const q = app.takePending(id);
    if (q) void send(q);
    else inputRef.current?.focus({ preventScroll: true });
    return () => { clearTimeout(t); abort.current?.abort(); stopMic.current?.(); stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: app.reduced ? "auto" : "smooth" }); }, [turns.length, waiting, app.reduced]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setWaiting(true);
    setState("thinking");
    const next: Turn[] = [...turnsRef.current, { role: "user", content: q }];
    app.setHistory(id, next);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agent: id, messages: next.slice(-20).map(({ role, content }) => ({ role, content })), intent: app.intent ?? undefined }),
        signal: abort.current.signal,
      });
      if (res.status === 429) throw new Error("rate");
      if (!res.ok) throw new Error("http");
      const r = (await res.json()) as AgentReply;
      setWaiting(false);
      const { text: content, agent: _agent, ...meta } = r;
      app.setHistory(id, [...next, { role: "assistant", content, meta }]);
      app.blip(720, 0.06);
      if (r.mode === "fallback") { setState("error"); await new Promise((z) => setTimeout(z, 900)); }
      setState("speaking");
      if (app.voice && canSpeak()) await speak(id, content);
      else await new Promise((z) => setTimeout(z, Math.min(4000, 400 + content.length * 18)));
      setState(r.actions.length ? "excited" : "idle");
      const nav = r.actions.find((x) => x.type === "navigate");
      if (nav) setTimeout(() => { app.closeAgent(); router.push(nav.href); }, 1200);
      else setTimeout(() => setState("idle"), 900);
    } catch (e) {
      setWaiting(false);
      if ((e as Error).name === "AbortError") return;
      const msg = (e as Error).message === "rate" ? "Too many questions in a short time. Please wait a minute and try again." : "Something went wrong while answering. Please try again.";
      app.setHistory(id, [...next, { role: "assistant", content: msg }]);
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

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void send(input); };
  const modeNote =
    app.status.mode === "live" ? <><b>Live model.</b> {app.status.provider} answers, grounded in the verified knowledge base and checked before you see it.</>
    : app.status.mode === "demo" ? <><b>Demo mode.</b> No language model is configured, so agents answer by retrieval from the verified knowledge base. Nothing is generated.</>
    : <>Checking the agent service…</>;

  return (
    <div className={layout === "drawer" ? "agent-box" : "agent-page"} style={vars({ c: a.color, s: a.soft })} role={layout === "drawer" ? "dialog" : undefined} aria-modal={layout === "drawer" ? true : undefined} aria-label={`${a.name}, ${a.role}`}>
      {layout === "drawer" && <button className="close" onClick={app.closeAgent} aria-label="Close">×</button>}
      <div className="agent-stage">
        <CharacterCanvas ids={[id]} states={{ [id]: state }} className="solo-wrap" fallback={<div className="solo-wrap"><Avatar id={id} size="big" /></div>} />
        <div className="agent-id">
          <h2>{a.name}</h2>
          <p>{a.role}</p>
          <span className="pill state" aria-live="polite">{state}</span>
        </div>
        <div className="states" role="group" aria-label="Preview character states">
          {CHARACTER_STATES.map((s) => <button key={s} onClick={() => setState(s)}>{s}</button>)}
        </div>
        <div className="switch" role="group" aria-label="Switch agent">
          {AGENT_IDS.map((x) =>
            layout === "page" ? (
              <Link key={x} href={`/agents/${x}`} className={x === id ? "on" : ""} aria-label={AGENTS[x].name} title={`${AGENTS[x].name} · ${AGENTS[x].role}`}><Avatar id={x} /></Link>
            ) : (
              <button key={x} onClick={() => onSwitch?.(x)} className={x === id ? "on" : ""} aria-label={AGENTS[x].name} title={`${AGENTS[x].name} · ${AGENTS[x].role}`}><Avatar id={x} /></button>
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
          <button className="pill" onClick={() => { abort.current?.abort(); app.clearHistory(id); setState("idle"); }}>Clear conversation</button>
        </div>
        <div className="log" ref={log} aria-live="polite">
          <Bubble who="bot" id={id} text={a.greet} />
          {turns.map((t, i) => <Bubble key={i} who={t.role === "user" ? "me" : "bot"} id={id} text={t.content} meta={t.meta} />)}
          {waiting && <Bubble who="bot" id={id} text="…" />}
        </div>
        <div className="suggest">{a.ask.map((s) => <button key={s} className="chip" onClick={() => void send(s)} disabled={busy}>{s}</button>)}</div>
        <form className="say" onSubmit={onSubmit}>
          <input ref={inputRef} value={input} onChange={(e) => { setInput(e.target.value); if (!busy) setState(e.target.value ? "listening" : "idle"); }} autoComplete="off" maxLength={2000} placeholder={`Ask ${a.name} about ${a.scope}`} aria-label={`Message ${a.name}`} />
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

function Bubble({ who, id, text, meta }: { who: "me" | "bot"; id: AgentId; text: string; meta?: Turn["meta"] }) {
  return (
    <div className={`msg ${who}`}>
      {who === "bot" && <Avatar id={id} />}
      <div>
        <p>{text}</p>
        {meta && (
          <div className="meta">
            <span className={`tag ${meta.mode === "live" ? "live" : "demo"}`}>
              {meta.mode === "live" ? `live model${meta.model ? ` · ${meta.model}` : ""}` : meta.mode === "fallback" ? "model unavailable · retrieval answer" : meta.mode === "guarded" ? "outside my scope · answered by the guard" : "demo · retrieval answer"}
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
