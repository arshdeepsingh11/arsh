"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { fieldLoop, me } from "@/lib/content";
import { capabilities, faq } from "@/lib/content/extra";
import { Avatar } from "@/components/agents/Avatar";
import { useApp } from "@/components/shell/AppProvider";

const TYPES = ["AI assistant on our own data", "Web application", "Mobile app", "Clinic or healthcare software", "Storefront or client website", "Something else"];
const INTEGRATIONS = ["Supabase / Postgres", "Shopify", "Stripe", "An LLM API", "HL7 / health records", "WordPress", "Email", "Not sure yet"];
const QUESTIONS = ["What kind of thing is it?", "What problem should it solve, and for whom?", "What must it be able to do on day one?", "What does it need to connect to?", "Who should Arshdeep reply to?"];

type Data = { type: string; problem: string; features: string; integrations: string[]; name: string; email: string; timeline: string; website: string };
type Brief = { brief: string; tidied: boolean; similar: { slug: string; name: string }[] };
type SendState = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "fallback"; why: string };

/** Collaboration center: NOVA turns an idea into a brief, then sends it by email if configured, or hands it to the visitor's mail app. */
export function CollabView() {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>({ type: "", problem: "", features: "", integrations: [], name: "", email: "", timeline: "", website: "" });
  const [err, setErr] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [send, setSend] = useState<SendState>({ kind: "idle" });
  const [copied, setCopied] = useState("");

  const validate = (): string => {
    if (step === 0 && !d.type) return "Pick the closest option.";
    if (step === 1 && d.problem.trim().length < 15) return "A sentence or two helps a lot.";
    if (step === 2 && d.features.trim().length < 5) return "List at least one thing it must do.";
    if (step === 4 && !d.name.trim()) return "Please add your name.";
    if (step === 4 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return "That email address does not look complete.";
    return "";
  };

  async function next(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    setErr(v);
    if (v) return;
    if (step < QUESTIONS.length - 1) return setStep(step + 1);
    setBusy(true);
    try {
      const res = await fetch("/api/collab/brief", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "Could not prepare the brief.");
      setBrief(j as Brief);
      setText((j as Brief).brief);
      setStep(QUESTIONS.length);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendIt() {
    setSend({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...d, brief: text }) });
      const j = (await res.json()) as { sent: boolean; reason?: string; message?: string };
      if (j.sent) { setSend({ kind: "sent" }); app.blip(990, 0.12); return; }
      setSend({ kind: "fallback", why: j.reason === "not_configured" ? "Email sending is not set up on this site yet." : j.message ?? "The message could not be sent." });
    } catch {
      setSend({ kind: "fallback", why: "The message could not be sent." });
    }
  }

  const mailto = `mailto:${me.email}?subject=${encodeURIComponent(`Project inquiry: ${d.type}`)}&body=${encodeURIComponent(text)}`;
  const toggleInt = (t: string) => setD({ ...d, integrations: d.integrations.includes(t) ? d.integrations.filter((x) => x !== t) : [...d.integrations, t] });

  return (
    <>
      <header className="vhead">
        <p className="eyebrow mono">Collaboration center</p>
        <h1>Start something</h1>
        <p className="lede">NOVA will help you turn an idea into a brief Arshdeep can answer properly.</p>
      </header>
      <div className="collab">
        <section className="panel nova">
          <div className="nova-h"><Avatar id="nova" size="lg" /><div><b>NOVA</b><p aria-live="polite">{step < QUESTIONS.length ? QUESTIONS[step] : "Here is your brief. Check it, then send it."}</p></div></div>
          <div className="steps" aria-hidden="true">{QUESTIONS.map((_, i) => <i key={i} className={i < step ? "done" : i === step ? "now" : ""} />)}</div>

          {step < QUESTIONS.length ? (
            <form className="col" onSubmit={next} noValidate>
              {step === 0 && <div className="ctl wrap" role="group" aria-label="Project type">{TYPES.map((t) => <button type="button" key={t} className={`chip ${d.type === t ? "on" : ""}`} aria-pressed={d.type === t} onClick={() => setD({ ...d, type: t })}>{t}</button>)}</div>}
              {step === 1 && <><label className="sr" htmlFor="c-problem">{QUESTIONS[1]}</label><textarea id="c-problem" rows={4} maxLength={3000} value={d.problem} onChange={(e) => setD({ ...d, problem: e.target.value })} autoFocus /></>}
              {step === 2 && <><label className="sr" htmlFor="c-features">{QUESTIONS[2]}</label><textarea id="c-features" rows={4} maxLength={3000} value={d.features} onChange={(e) => setD({ ...d, features: e.target.value })} autoFocus /></>}
              {step === 3 && <div className="ctl wrap" role="group" aria-label="Integrations">{INTEGRATIONS.map((t) => <button type="button" key={t} className={`chip ${d.integrations.includes(t) ? "on" : ""}`} aria-pressed={d.integrations.includes(t)} onClick={() => toggleInt(t)}>{t}</button>)}</div>}
              {step === 4 && (
                <>
                  <label>Your name<input value={d.name} maxLength={120} onChange={(e) => setD({ ...d, name: e.target.value })} autoComplete="name" autoFocus /></label>
                  <label>Your email<input type="email" value={d.email} maxLength={200} onChange={(e) => setD({ ...d, email: e.target.value })} autoComplete="email" /></label>
                  <label>Timeline, if you have one<input value={d.timeline} maxLength={120} onChange={(e) => setD({ ...d, timeline: e.target.value })} placeholder="Optional" /></label>
                  <label className="hp" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => setD({ ...d, website: e.target.value })} /></label>
                </>
              )}
              <p className="err" role="alert">{err}</p>
              <div className="ctl">
                {step > 0 && <button type="button" className="btn ghost" onClick={() => { setErr(""); setStep(step - 1); }}>Back</button>}
                <button className="btn" disabled={busy}>{busy ? "Preparing…" : step === QUESTIONS.length - 1 ? "Prepare my brief" : "Next"}</button>
              </div>
            </form>
          ) : (
            <div className="col">
              <label className="sr" htmlFor="brief">Your brief</label>
              <textarea id="brief" rows={12} value={text} onChange={(e) => setText(e.target.value)} />
              <p className="dim sm">{brief?.tidied ? "Tidied by NOVA with a live model from your answers. Read it before sending." : "Assembled from your answers, word for word."}</p>
              {send.kind === "sent" ? (
                <p className="sent" role="status"><b>Sent.</b> Arshdeep will reply to {d.email}.</p>
              ) : (
                <div className="ctl wrap">
                  <button className="btn" onClick={sendIt} disabled={send.kind === "sending"}>{send.kind === "sending" ? "Sending…" : "Send to Arshdeep"}</button>
                  <button className="btn ghost" onClick={() => navigator.clipboard.writeText(text).then(() => setCopied("Copied"), () => setCopied("Select the text and copy it"))}>{copied || "Copy the brief"}</button>
                  <button className="btn ghost" onClick={() => { setStep(0); setSend({ kind: "idle" }); }}>Edit answers</button>
                </div>
              )}
              {send.kind === "fallback" && (
                <div className="note" role="status">
                  <p><b>Not sent.</b> {send.why} You can send it from your own email instead:</p>
                  <div className="ctl wrap"><a className="btn sm" href={mailto}>Open in my email app</a><span className="dim sm">or write to <b>{me.email}</b></span></div>
                </div>
              )}
              {brief && brief.similar.length > 0 && (
                <><p className="mono dim">Similar work to look at</p><div className="ctl wrap">{brief.similar.map((s) => <Link key={s.slug} className="chip" href={`/projects/${s.slug}`}>{s.name}</Link>)}</div></>
              )}
            </div>
          )}
        </section>

        <aside className="panel direct">
          <h3>Or reach him directly</h3>
          <dl>
            <dt>Email</dt><dd><a href={`mailto:${me.email}`}>{me.email}</a></dd>
            <dt>Phone</dt><dd><a href={`tel:${me.phone.replace(/[^+\d]/g, "")}`}>{me.phone}</a></dd>
            <dt>GitHub</dt><dd><a href={me.github} target="_blank" rel="noopener noreferrer">github.com/arshdeepsingh11 ↗</a></dd>
            <dt>LinkedIn</dt><dd><a href={me.linkedin} target="_blank" rel="noopener noreferrer">arshdeep-singh-software ↗</a></dd>
            <dt>Portfolio</dt><dd><a href={me.portfolio} target="_blank" rel="noopener noreferrer">arshdeepsingh-portfolio.vercel.app ↗</a></dd>
          </dl>
          <a className="btn ghost" href="/resume/arshdeep-singh-resume.pdf" target="_blank" rel="noopener">View résumé (PDF)</a>
          <p className="dim sm">Your answers are only sent when you press Send. Nothing is stored on this site.</p>
        </aside>
      </div>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">What you can ask for</p><h2>Things he has already built</h2></div></div>
        <div className="cap-cards">
          {capabilities.map((c) => <div key={c.id} className="cap-card"><b>{c.title}</b><p>{c.line}</p><div className="ctl wrap">{c.evidence.slice(0, 2).map((e) => <Link key={e.label} className="chip" href={e.href}>{e.label}</Link>)}</div></div>)}
        </div>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">How a project runs</p><h2>From idea to something people use</h2></div></div>
        <ol className="loop-row">{fieldLoop.map((f, i) => <li key={f.k}><span className="mono">0{i + 1}</span><b>{f.k}</b><p>{f.t}</p></li>)}</ol>
      </section>

      <section>
        <div className="sec-head"><div><p className="eyebrow mono">Good to know</p><h2>Common questions</h2></div></div>
        <div className="faq">{faq.filter((f) => /build|data|safe|start|code/i.test(f.q)).map((f) => <div key={f.q} className="faq-item open"><button tabIndex={-1} aria-hidden="true"><b>{f.q}</b></button><p>{f.a}</p></div>)}</div>
        <p className="dim sm" style={{ marginTop: 10 }}>Rates, availability and timelines are for Arshdeep to confirm when he replies.</p>
      </section>
    </>
  );
}
