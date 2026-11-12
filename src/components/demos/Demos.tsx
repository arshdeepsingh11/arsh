"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { DemoId } from "@/lib/content";
import { CalcDemo, FeedDemo, MarketDemo, MovieDemo, PatinaDemo, ShiftDemo } from "./MoreDemos";
import { Phone } from "./Phone";

/*
 * Interactive demonstrations rebuilt from each repository's verified behaviour. Repository code is never executed in
 * the visitor's browser: these components reproduce the documented logic (and quote it where it is short) with
 * fictional data held in memory. Each one says what is real and what is simulated.
 */

/* QuickConvert — same factors and rounding as converter.js. */
const CONV: Record<string, [string, (v: number) => number]> = {
  kg: ["lb", (v) => v * 2.2046], lb: ["kg", (v) => v / 2.2046], km: ["mi", (v) => v / 1.60934], mi: ["km", (v) => v * 1.60934],
  "°C": ["°F", (v) => (v * 9) / 5 + 32], "°F": ["°C", (v) => ((v - 32) * 5) / 9],
};
function ConvertDemo() {
  const [raw, setRaw] = useState("72, 180.5");
  const [unit, setUnit] = useState("kg");
  const out = useMemo(() => {
    const [to, f] = CONV[unit];
    const vals = raw.includes(",") ? raw.split(",").map(Number) : [parseFloat(raw)];
    return vals.some(Number.isNaN) ? "Enter a number, or numbers separated by commas." : `${vals.map((v) => Math.ceil(f(v) * 1000) / 1000).join(", ")} ${to}`;
  }, [raw, unit]);
  return (
    <div className="panel narrow">
      <h3>QuickConvert, running on its own conversion table</h3>
      <form className="row" onSubmit={(e) => e.preventDefault()}>
        <input value={raw} onChange={(e) => setRaw(e.target.value)} aria-label="Value or comma-separated values" />
        <select value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="From unit">{Object.keys(CONV).map((u) => <option key={u}>{u}</option>)}</select>
      </form>
      <p className="bigout" aria-live="polite">{out}</p>
      <p className="dim sm">Same factors and the same behaviour as converter.js: one value or a comma-separated list, rounded up to three decimals.</p>
    </div>
  );
}

/* YEG-YYC — the exact checks from app/auth/sign-in.tsx. */
const PASSWORD_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const CITY: Record<string, [string, string, number]> = {
  Calgary: ["https://www.calgary.ca", "Calgary sits where the Bow and Elbow rivers meet, about an hour east of the Rockies.", 20],
  Edmonton: ["https://www.edmonton.ca", "Edmonton is Alberta's capital, on the North Saskatchewan River.", 210],
};
function YegDemo() {
  const [u, setU] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useState("Home");
  const rules: [boolean, string][] = [[u.length >= 5, "Username: 5+ characters"], [/[a-z]/.test(pw), "Lowercase letter"], [/[A-Z]/.test(pw), "Uppercase letter"], [/\d/.test(pw), "Number"], [/[@$!%*?&]/.test(pw), "Special character @$!%*?&"], [pw.length >= 8, "8+ characters"]];
  const signIn = (e: FormEvent) => {
    e.preventDefault();
    if (u.length < 5) return setErr("Username must be at least 5 characters.");
    if (!PASSWORD_RX.test(pw)) return setErr("Password does not meet the requirements.");
    setErr(""); setUser(u); setTab("Home");
  };
  if (!user)
    return (
      <Phone caption={<>The checks are the ones in app/auth/sign-in.tsx: username length of at least 5 and one regular expression for the password. Nothing is stored. Try <code>Calgary@2025</code>.</>}>
        <form className="ph-pad" onSubmit={signIn}>
          <h4>Sign in</h4>
          <label>Username<input value={u} onChange={(e) => setU(e.target.value)} autoComplete="off" /></label>
          <label>Password<input value={pw} onChange={(e) => setPw(e.target.value)} type="text" autoComplete="off" /></label>
          <ul className="rules">{rules.map(([ok, t]) => <li key={t} className={ok ? "ok" : ""}>{ok ? "✓" : "○"} {t}</li>)}</ul>
          <button className="btn full">Sign in</button>
          <p className="err" role="alert">{err}</p>
        </form>
      </Phone>
    );
  return (
    <Phone caption={<>Tab navigation after a successful sign-in, as in the app. City descriptions are written for this demo. <button className="link" onClick={() => { setUser(null); setPw(""); }}>Sign out</button></>}>
      <div className="ph-pad grow">
        {tab === "Home" ? (
          <><h4>Welcome, {user}</h4><p>Pick a city below.</p></>
        ) : (
          <><div className="city" style={{ ["--h" as string]: CITY[tab][2] }}>{tab}</div><p>{CITY[tab][1]}</p><a href={CITY[tab][0]} target="_blank" rel="noopener noreferrer">Go to city page ↗</a></>
        )}
      </div>
      <div className="ph-tabs" role="tablist">{["Home", "Calgary", "Edmonton"].map((x) => <button key={x} role="tab" aria-selected={x === tab} className={x === tab ? "on" : ""} onClick={() => setTab(x)}>{x}</button>)}</div>
    </Phone>
  );
}

/* Secure Auth — sign-up, login, profile CRUD and Row Level Security, simulated in memory. */
function SecureDemo() {
  const [users, setUsers] = useState<Record<string, { pw: string; name: string }>>({});
  const [me, setMe] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const act = (a: string) => {
    if (a === "up") {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg("Enter a valid email.");
      if (pw.length < 6) return setMsg("Password needs 6+ characters.");
      if (users[email]) return setMsg("That email is already registered.");
      setUsers({ ...users, [email]: { pw, name: email.split("@")[0] } }); setMe(email); setName(email.split("@")[0]); setPw(""); return setMsg("Signed up and signed in.");
    }
    if (a === "in") {
      if (!users[email] || users[email].pw !== pw) return setMsg("Invalid login credentials.");
      setMe(email); setName(users[email].name); setPw(""); return setMsg("");
    }
    if (!me) return;
    if (a === "save") { setUsers({ ...users, [me]: { ...users[me], name } }); return setMsg("Row updated."); }
    if (a === "del") { const n = { ...users }; delete n[me]; setUsers(n); setMe(null); return setMsg("Your row was deleted."); }
    if (a === "out") { setMe(null); return setMsg("Logged out."); }
    if (a === "peek") return setMsg("0 rows returned. The policy only matches rows where the row id equals your user id.");
  };
  return (
    <div className="lab-grid">
      <Phone caption="A simulation of the app's flow held in this tab's memory. No account is created and nothing leaves the page; use a made-up email.">
        <div className="ph-pad">
          {me ? (
            <>
              <h4>Profile</h4>
              <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
              <p className="dim sm">{me}</p>
              <button className="btn full" onClick={() => act("save")}>Update</button>
              <button className="btn ghost full" onClick={() => act("del")}>Delete my details</button>
              <button className="btn ghost full" onClick={() => act("out")}>Log out</button>
              <button className="btn ghost full" onClick={() => act("peek")}>Try to read another user&apos;s row</button>
            </>
          ) : (
            <>
              <h4>Secure Auth</h4>
              <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
              <label>Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="demo only" /></label>
              <button className="btn full" onClick={() => act("up")}>Sign up</button>
              <button className="btn ghost full" onClick={() => act("in")}>Log in</button>
            </>
          )}
          <p className="err" role="status">{msg}</p>
        </div>
      </Phone>
      <div className="panel">
        <h3>user_details, as the database sees it</h3>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Email</th></tr></thead>
          <tbody>
            {Object.keys(users).length ? Object.entries(users).map(([e, x]) => (
              <tr key={e} className={e === me ? "mine" : ""}><td>{e === me ? x.name : "••••••"}</td><td>{e === me ? e : "hidden by RLS"}</td></tr>
            )) : <tr><td colSpan={2} className="dim">No rows yet. Sign up on the phone.</td></tr>}
          </tbody>
        </table>
        <p className="dim sm">Row Level Security means a signed-in user can read and change only their own row. Sign up twice with different emails to see the other row stay hidden.</p>
      </div>
    </div>
  );
}

/* Student Hub — the fields of StudentForm.jsx with fictional records. */
type Student = { f: string; l: string; d: string; g: string };
function StudentDemo() {
  const [list, setList] = useState<Student[]>([{ f: "Maya", l: "Chen", d: "2008-04-12", g: "11" }, { f: "Omar", l: "Haddad", d: "2009-09-30", g: "10" }]);
  const [form, setForm] = useState<Student>({ f: "", l: "", d: "", g: "" });
  const [errs, setErrs] = useState<Partial<Record<keyof Student, string>>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errs = {};
    if (!form.f.trim()) er.f = "First name is required.";
    if (!form.l.trim()) er.l = "Last name is required.";
    if (!form.d) er.d = "Date of birth is required.";
    if (!form.g || +form.g < 1 || +form.g > 12) er.g = "Grade must be 1 to 12.";
    setErrs(er);
    if (Object.keys(er).length) return;
    setList([...list, form]);
    setForm({ f: "", l: "", d: "", g: "" });
  };
  const field = (k: keyof Student, label: string, type: string) => (
    <label key={k}>{label}<input type={type} value={form[k]} min={k === "g" ? 1 : undefined} max={k === "g" ? 12 : undefined} aria-invalid={!!errs[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />{errs[k] && <span className="err">{errs[k]}</span>}</label>
  );
  return (
    <div className="lab-grid">
      <form className="panel col" noValidate onSubmit={submit}>
        <h3>Add a student</h3>
        {field("f", "First name", "text")}{field("l", "Last name", "text")}{field("d", "Date of birth", "date")}{field("g", "Grade", "number")}
        <button className="btn">Add student</button>
      </form>
      <div className="panel">
        <h3>Student list ({list.length})</h3>
        <table className="tbl"><thead><tr><th>Name</th><th>Born</th><th>Grade</th></tr></thead><tbody>{list.map((s, i) => <tr key={i}><td>{s.f} {s.l}</td><td>{s.d}</td><td>{s.g}</td></tr>)}</tbody></table>
        <p className="dim sm">Same fields as StudentForm.jsx, with fictional sample records held in memory. The validation messages are written for this demo.</p>
      </div>
    </div>
  );
}

/* NEYU — the documented request pipeline: emergency rules, consent switches, model, evidence, review. */
const EMERGENCY = /chest pain|can'?t breathe|cannot breathe|suicid|stroke|unconscious|overdose|severe bleeding/i;
const SOURCES: Record<string, string> = { labs: "LDL cholesterol 3.9 mmol/L on the latest panel (fictional)", wearables: "Resting heart rate averaged 61 bpm this week (fictional)", food: "Three logged meals yesterday (fictional)" };
const PIPE = ["Emergency rules", "Consent switches", "Model call", "Answer with evidence", "Saved for clinic review"];
type NeyuResult = { st: string[]; msg: string[]; kind: "emerg" | "block" | "ans"; title: string; body: string };
function NeyuDemo() {
  const [text, setText] = useState("How is my cholesterol doing?");
  const [on, setOn] = useState<Record<string, boolean>>({ labs: true, wearables: true, food: false });
  const [model, setModel] = useState(true);
  const [r, setR] = useState<NeyuResult | null>(null);
  const run = (t = text) => {
    if (EMERGENCY.test(t)) return setR({ st: ["stop", "skip", "skip", "skip", "ok"], msg: ["Emergency language detected. Fixed rules run before any AI call.", "Not reached", "No AI call was made", "Not reached", "Logged"], kind: "emerg", title: "Call 911 or go to the nearest emergency room", body: "This message is shown first, without calling the model." });
    const allowed = Object.keys(SOURCES).filter((k) => on[k]), off = Object.keys(SOURCES).filter((k) => !on[k]);
    const med = /dose|medication|statin|prescri|diagnos/i.test(t);
    setR({
      st: ["ok", "ok", model ? "ok" : "warn", "ok", "ok"],
      msg: ["No emergency language.", `${allowed.length ? `Sent: ${allowed.join(", ")}` : "No sources allowed"}${off.length ? `. Never sent: ${off.join(", ")}` : ""}.`, model ? "Model answered under a strict clinical system prompt." : "Model slow or unavailable. Rules-based answer used instead.", med ? "Medication and diagnosis advice is blocked." : "Evidence attached to the answer.", "Saved to history and the clinic's AI review."],
      kind: med ? "block" : "ans",
      title: med ? "Neyu will not advise on medication" : model ? "Answer with evidence" : "Rules-based answer",
      body: med ? "That is a question for your care team. I can help you prepare it for your next visit." : allowed.length ? `Based on your records: ${allowed.map((k) => SOURCES[k]).join("; ")}. This is information, not a diagnosis.` : "You have not allowed Neyu to read any of your records, so there is nothing to answer from. You can switch a source on at any time.",
    });
  };
  return (
    <div className="panel">
      <h3>How every Neyu request is handled</h3>
      <p className="dim sm">A simulation of the documented pipeline with fictional patient data. The emergency phrases here are examples written for this demo; the production rules live in src/lib/emergencyDetection.ts.</p>
      <label className="col">Patient message<input value={text} onChange={(e) => setText(e.target.value)} /></label>
      <div className="ctl wrap">
        {["How is my cholesterol doing?", "I have chest pain and can't breathe", "Should I double my statin dose?"].map((s, i) => (
          <button key={s} className="chip" onClick={() => { setText(s); run(s); }}>{["Routine question", "Emergency language", "Asks for medication advice"][i]}</button>
        ))}
      </div>
      <div className="ctl wrap">
        <span className="mono dim">Patient&apos;s AI switches</span>
        {Object.keys(SOURCES).map((k) => <label key={k} className="tog"><input type="checkbox" checked={on[k]} onChange={(e) => setOn({ ...on, [k]: e.target.checked })} /> {k}</label>)}
        <label className="tog"><input type="checkbox" checked={model} onChange={(e) => setModel(e.target.checked)} /> model available</label>
        <button className="btn sm" onClick={() => run()}>Send</button>
      </div>
      <ol className="pipe">{PIPE.map((s, i) => <li key={s} className={r?.st[i] ?? ""}><b>{s}</b><span>{r?.msg[i] ?? ""}</span></li>)}</ol>
      {r && <div className={`neyu-out ${r.kind}`} aria-live="polite"><b>{r.title}</b><p>{r.body}</p></div>}
    </div>
  );
}

/* HARU — one documented database guarantee: a shift's gross must equal minutes × rate. */
function HaruDemo() {
  const [m, setM] = useState(480);
  const [rate, setRate] = useState(24.5);
  const [gross, setGross] = useState("200");
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const calc = Math.round(((m * rate) / 60) * 100) / 100;
  const attempt = (g = +gross) => setRes(Math.abs(g - calc) < 0.005
    ? { ok: true, text: `save_shift passed validation and the check constraint: gross ${g.toFixed(2)} equals minutes × rate.` }
    : { ok: false, text: `Check constraint failed: gross ${g.toFixed(2)} ≠ ${m} min × $${rate.toFixed(2)}/h = ${calc.toFixed(2)}. Nothing was written.` });
  return (
    <div className="panel narrow">
      <h3>The model proposes. The database decides.</h3>
      <p className="dim sm">An illustration of one documented guarantee in HARU&apos;s SQL migrations. Values are fictional.</p>
      <div className="ctl col">
        <label>Minutes worked <b>{m} min</b><input type="range" min={30} max={720} step={15} value={m} onChange={(e) => setM(+e.target.value)} /></label>
        <label>Hourly rate <b>${rate.toFixed(2)}</b><input type="range" min={15} max={80} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} /></label>
        <label>Gross pay the AI tries to save<input type="number" step="0.01" value={gross} onChange={(e) => setGross(e.target.value)} /></label>
        <div className="ctl"><button className="btn sm" onClick={() => { setGross(calc.toFixed(2)); attempt(calc); }}>Use the deterministic calculation</button><button className="btn sm ghost" onClick={() => attempt()}>Attempt the write</button></div>
      </div>
      {res && <div className={`neyu-out ${res.ok ? "ans" : "emerg"}`} aria-live="polite"><b>{res.ok ? "Accepted" : "Rejected by the database"}</b><p>{res.text}</p></div>}
    </div>
  );
}

export const DEMOS: Record<DemoId, () => React.JSX.Element> = {
  convert: ConvertDemo, yeg: YegDemo, secure: SecureDemo, student: StudentDemo, neyu: NeyuDemo, haru: HaruDemo,
  calc: CalcDemo, movies: MovieDemo, shifts: ShiftDemo, feed: FeedDemo, patina: PatinaDemo, market: MarketDemo,
};

/** What each demo reproduces, shown under its window. */
export const DEMO_NOTES: Record<DemoId, string> = {
  convert: "Runs QuickConvert's own conversion table in your browser.",
  yeg: "Uses the exact sign-in checks from the app's source. Nothing is stored.",
  secure: "Simulates the app's sign-up, profile CRUD and Row Level Security in memory.",
  student: "Same fields as the app's student form, with fictional records.",
  neyu: "Simulates NEYU's documented AI request pipeline with fictional patient data.",
  haru: "Illustrates one documented database guarantee from HARU's SQL migrations.",
  calc: "Same keypad, history and theme toggle as the app, with a safe parser.",
  movies: "Uses the app's Movie data model with add, edit, delete and search.",
  shifts: "Uses the app's pay fields across employee, employer and admin views.",
  feed: "Follows the app's feed, composer and tab components with fictional posts.",
  patina: "Uses Le Sac Doré's own ageing model and product copy.",
  market: "Runs the storefront's market resolver in its real order of precedence.",
};
