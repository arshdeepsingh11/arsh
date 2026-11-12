"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Phone } from "./Phone";

/*
 * More working demonstrations, each rebuilt from the repository's own logic or copy, with fictional data in memory.
 * Nothing is sent anywhere. Each says what is real and what is simulated.
 */

/* ── Expo Calculator: same keypad, history and light/dark toggle as the app; a safe parser instead of eval. ── */
function evaluate(expr: string): number {
  const toks = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").match(/\d*\.?\d+|[+\-*/]/g) ?? [];
  let i = 0;
  const num = (): number => {
    let sign = 1;
    while (toks[i] === "-" || toks[i] === "+") { if (toks[i] === "-") sign = -sign; i++; }
    const v = Number(toks[i++]);
    if (Number.isNaN(v)) throw new Error("bad");
    return sign * v;
  };
  const term = (): number => { let v = num(); while (toks[i] === "*" || toks[i] === "/") { const op = toks[i++]; const r = num(); v = op === "*" ? v * r : v / r; } return v; };
  let v = term();
  while (toks[i] === "+" || toks[i] === "-") { const op = toks[i++]; const r = term(); v = op === "+" ? v + r : v - r; }
  if (i !== toks.length || !Number.isFinite(v)) throw new Error("bad");
  return Math.round(v * 1e10) / 1e10;
}
export function CalcDemo() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState<"calc" | "history">("calc");
  const press = (k: string) => {
    if (k === "C") { setInput(""); setResult(""); return; }
    if (k === "=") {
      try { const r = evaluate(input); setResult(String(r)); setHistory((h) => [`${input} = ${r}`, ...h].slice(0, 20)); } catch { setResult("Error"); }
      return;
    }
    setInput((s) => s + k);
  };
  const rows = [["7", "8", "9", "÷"], ["4", "5", "6", "×"], ["1", "2", "3", "−"], ["0", ".", "C", "+"]];
  return (
    <Phone caption="Same keypad, history list and light/dark toggle as the app. The original evaluates with JavaScript eval; this demo uses a small safe parser instead.">
      <div className={`calc ${dark ? "dark" : ""}`}>
        <div className="calc-top"><b>{tab === "calc" ? "Calculator" : "History"}</b><button onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? "☀" : "☾"}</button></div>
        {tab === "calc" ? (
          <>
            <div className="calc-screen" aria-live="polite"><span>{input || "0"}</span><b>{result}</b></div>
            <div className="calc-keys">
              {rows.flat().map((k) => <button key={k} className={/[÷×−+]/.test(k) ? "op" : k === "C" ? "fn" : ""} onClick={() => press(k)}>{k}</button>)}
              <button className="eq" onClick={() => press("=")}>=</button>
            </div>
          </>
        ) : (
          <ul className="calc-hist">{history.length ? history.map((h, i) => <li key={i}>{h}</li>) : <li className="dim">No calculations yet.</li>}{history.length > 0 && <li><button className="link" onClick={() => setHistory([])}>Clear history</button></li>}</ul>
        )}
        <div className="ph-tabs">{(["calc", "history"] as const).map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t === "calc" ? "Calculator" : "History"}</button>)}</div>
      </div>
    </Phone>
  );
}

/* ── IMR Movie Portal: the Prisma Movie model (title, actors[], releaseYear) with add, edit and delete. ── */
type Movie = { id: number; title: string; actors: string[]; releaseYear: number };
export function MovieDemo() {
  const [movies, setMovies] = useState<Movie[]>([
    { id: 1, title: "The Northern Lights", actors: ["A. Rivera", "J. Chen"], releaseYear: 2019 },
    { id: 2, title: "Bow River Nights", actors: ["M. Okafor"], releaseYear: 2022 },
  ]);
  const [form, setForm] = useState({ title: "", actors: "", year: "" });
  const [edit, setEdit] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const y = Number(form.year);
    if (!form.title.trim()) return setErr("Title is required.");
    if (!Number.isInteger(y) || y < 1888 || y > 2100) return setErr("Release year must be a whole year.");
    const m = { title: form.title.trim(), actors: form.actors.split(",").map((a) => a.trim()).filter(Boolean), releaseYear: y };
    setMovies(edit ? movies.map((x) => (x.id === edit ? { ...x, ...m } : x)) : [...movies, { id: Date.now(), ...m }]);
    setForm({ title: "", actors: "", year: "" }); setEdit(null); setErr("");
  };
  const list = movies.filter((m) => `${m.title} ${m.actors.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="lab-grid">
      <form className="panel col" onSubmit={submit} noValidate>
        <h3>{edit ? "Edit movie" : "Add a movie"}</h3>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" /></label>
        <label>Actors (comma separated)<input value={form.actors} onChange={(e) => setForm({ ...form, actors: e.target.value })} placeholder="Actors (comma separated)" /></label>
        <label>Release year<input inputMode="numeric" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Release Year" /></label>
        <p className="err" role="alert">{err}</p>
        <div className="ctl"><button className="btn">{edit ? "Save" : "Add movie"}</button>{edit && <button type="button" className="btn ghost" onClick={() => { setEdit(null); setForm({ title: "", actors: "", year: "" }); }}>Cancel</button>}</div>
      </form>
      <div className="panel">
        <div className="ctl" style={{ marginTop: 0 }}><h3 style={{ margin: 0 }}>Catalogue ({movies.length})</h3><span className="sp" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search movies" style={{ maxWidth: 180 }} /></div>
        <ul className="movie-list">
          {list.map((m) => (
            <li key={m.id}><div><b>{m.title}</b><span>{m.releaseYear} · {m.actors.join(", ") || "No actors listed"}</span></div>
              <button className="chip" onClick={() => { setEdit(m.id); setForm({ title: m.title, actors: m.actors.join(", "), year: String(m.releaseYear) }); }}>Edit</button>
              <button className="chip" onClick={() => setMovies(movies.filter((x) => x.id !== m.id))}>Delete</button></li>
          ))}
        </ul>
        <p className="dim sm">Fields match the Movie model in prisma/schema.prisma (MongoDB). Records are fictional and live in memory.</p>
      </div>
    </div>
  );
}

/* ── Trade Shift: employee pay history (hours × rate = gross), employer approvals and an admin audit log. ── */
type Shift = { id: number; who: string; date: string; hours: number; rate: number; status: "pending" | "approved" };
export function ShiftDemo() {
  const [role, setRole] = useState<"employee" | "employer" | "admin">("employee");
  const [shifts, setShifts] = useState<Shift[]>([{ id: 1, who: "Sam", date: "2026-11-03", hours: 8, rate: 24.5, status: "approved" }, { id: 2, who: "Sam", date: "2026-11-05", hours: 6.5, rate: 24.5, status: "pending" }]);
  const [log, setLog] = useState<string[]>(["Company 'Northline Trades' created", "Employee Sam joined"]);
  const [f, setF] = useState({ date: "2026-11-10", hours: "7.5" });
  const total = (s: Shift) => Math.round(s.hours * s.rate * 100) / 100;
  const add = (e: FormEvent) => {
    e.preventDefault();
    const h = Number(f.hours);
    if (!(h > 0 && h <= 16)) return;
    setShifts([...shifts, { id: Date.now(), who: "Sam", date: f.date, hours: h, rate: 24.5, status: "pending" }]);
    setLog([`Sam logged ${h} h on ${f.date}`, ...log]);
  };
  return (
    <div className="panel">
      <div className="ctl wrap" style={{ marginTop: 0 }} role="tablist">
        {(["employee", "employer", "admin"] as const).map((r) => <button key={r} role="tab" aria-selected={role === r} className={`chip ${role === r ? "on" : ""}`} onClick={() => setRole(r)}>{r[0].toUpperCase() + r.slice(1)} view</button>)}
      </div>
      {role === "employee" && (
        <div className="lab-grid" style={{ marginTop: 14 }}>
          <form className="col" onSubmit={add}><h3>Log a shift</h3><label>Date<input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label><label>Hours<input inputMode="decimal" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></label><button className="btn">Submit shift</button></form>
          <div><h3>Pay</h3><p className="dim sm">Your gross pay history (before tax deductions).</p>
            <ul className="movie-list">{shifts.map((s) => <li key={s.id}><div><b>${total(s).toFixed(2)}</b><span>{s.hours} hrs × ${s.rate}/hr · {s.date}</span></div><span className={`tag ${s.status === "approved" ? "ok" : "warn"}`}>{s.status}</span></li>)}</ul></div>
        </div>
      )}
      {role === "employer" && (
        <div style={{ marginTop: 14 }}><h3>Approve shifts</h3>
          <ul className="movie-list">{shifts.map((s) => <li key={s.id}><div><b>{s.who} · {s.date}</b><span>{s.hours} h · ${total(s).toFixed(2)}</span></div>{s.status === "pending" ? <button className="chip" onClick={() => { setShifts(shifts.map((x) => (x.id === s.id ? { ...x, status: "approved" } : x))); setLog([`Employer approved ${s.who}'s shift on ${s.date}`, ...log]); }}>Approve</button> : <span className="tag ok">approved</span>}</li>)}</ul>
          <p className="dim sm">Total approved: ${shifts.filter((s) => s.status === "approved").reduce((a, s) => a + total(s), 0).toFixed(2)}</p></div>
      )}
      {role === "admin" && <div style={{ marginTop: 14 }}><h3>Audit log</h3><ol className="audit">{log.map((l, i) => <li key={i}>{l}</li>)}</ol></div>}
      <p className="dim sm">The pay line uses the app&apos;s own fields (hours_worked × pay_rate = total_pay, shown as gross before tax). People, company and figures are fictional.</p>
    </div>
  );
}

/* ── POPS: feed, compose and bottom-tab navigation, as in its components. ── */
type Post = { id: number; who: string; text: string; likes: number; liked: boolean; ago: string };
export function FeedDemo() {
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, who: "maya", text: "First snow in Calgary today. The mountains look unreal.", likes: 12, liked: false, ago: "2h" },
    { id: 2, who: "devon", text: "Shipped a tiny feature at work and nothing broke. Celebrating with coffee.", likes: 5, liked: false, ago: "5h" },
  ]);
  const [compose, setCompose] = useState(false);
  const [text, setText] = useState("");
  const [tab, setTab] = useState("Home");
  const post = (e: FormEvent) => { e.preventDefault(); if (!text.trim()) return; setPosts([{ id: Date.now(), who: "you", text: text.trim(), likes: 0, liked: false, ago: "now" }, ...posts]); setText(""); setCompose(false); };
  return (
    <Phone caption="Feed, composer, likes and bottom tabs follow the app's components (FeedCard, Compose, BottomTabs). Posts are fictional and stay in this tab.">
      <div className="feed">
        <div className="calc-top"><b>POPS</b><span className="dim xs">{tab}</span></div>
        <div className="feed-body">
          {tab === "Home" ? posts.map((p) => (
            <article key={p.id} className="feed-card"><header><span className="feed-av">{p.who[0].toUpperCase()}</span><b>@{p.who}</b><i>{p.ago}</i></header><p>{p.text}</p>
              <button className={`link ${p.liked ? "liked" : ""}`} onClick={() => setPosts(posts.map((x) => (x.id === p.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)))}>{p.liked ? "♥" : "♡"} {p.likes}</button></article>
          )) : <p className="dim sm" style={{ padding: 16 }}>{tab} screen. In the app this route is /{tab.toLowerCase()}.</p>}
        </div>
        {compose ? (
          <form className="feed-compose" onSubmit={post}><textarea autoFocus rows={3} maxLength={280} value={text} onChange={(e) => setText(e.target.value)} placeholder="What's happening?" /><div className="ctl" style={{ marginTop: 6 }}><button type="button" className="btn ghost sm" onClick={() => setCompose(false)}>Cancel</button><button className="btn sm" disabled={!text.trim()}>Post</button></div></form>
        ) : tab === "Home" && <button className="feed-fab" onClick={() => setCompose(true)} aria-label="Compose">+</button>}
        <div className="ph-tabs">{["Home", "Search", "Alerts", "Messages"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      </div>
    </Phone>
  );
}

/* ── Le Sac Doré: Patina Preview, using the repository's own material model and copy. ── */
type Family = "leather" | "jute" | "canvas" | "textile";
function look(fam: Family, t: number) {
  switch (fam) {
    case "leather": return `sepia(${0.032 * t}) saturate(${1 + 0.07 * t}) brightness(${1 - 0.018 * t}) contrast(${1 + 0.02 * t})`;
    case "jute": return `brightness(${1 + 0.018 * t}) saturate(${1 - 0.035 * t}) sepia(${0.015 * t})`;
    case "canvas": return `brightness(${1 - 0.012 * t}) saturate(${1 - 0.03 * t}) contrast(${1 + 0.015 * t})`;
    default: return `brightness(${1 - 0.006 * t}) saturate(${1 - 0.012 * t})`;
  }
}
const COPY: Record<Family, Record<number, [string, string]>> = {
  leather: { 0: ["New", "A matte, even surface with a firm hand. The grain is crisp and the edges are freshly painted."], 1: ["One year", "The leather softens where your hand rests. A first, quiet sheen appears on the handle and the flap."], 5: ["Five years", "The colour deepens by about a shade. Creases settle into the bag's own shape — this is the patina we design for."], 10: ["Ten years", "A rich, burnished surface that no two bags share. With a yearly conditioning it is ready for decades more."] },
  jute: { 0: ["New", "A tight, even weave in natural straw tones, framed by firm leather edges."], 1: ["One year", "The fibre relaxes slightly and takes on a softer touch. The leather binding begins to warm."], 5: ["Five years", "Sun lightens the jute a little while the leather trim darkens, sharpening the contrast between them."], 10: ["Ten years", "A weathered, honey-toned weave. Keep it dry and brushed and the structure holds."] },
  canvas: { 0: ["New", "A dense, waxed cotton with a slight bloom on the surface."], 1: ["One year", "The wax settles and soft creases form where the bag flexes."], 5: ["Five years", "A worn, lived-in character. Re-waxing restores water resistance in minutes."], 10: ["Ten years", "Deep creases and a faded tone — the look of a well-travelled piece."] },
  textile: { 0: ["New", "A crisp jacquard with a fine, even lustre."], 1: ["One year", "Almost unchanged. Stored flat and away from light, silk-cotton keeps its colour."], 5: ["Five years", "A subtle softening of the hand. The leather strap darkens gently."], 10: ["Ten years", "Still close to new — evening pieces are carried less, and age slowly."] },
};
const SWATCH: Record<Family, string> = { leather: "#9a5b34", jute: "#c9a66b", canvas: "#5d6b4f", textile: "#7d5a8c" };
const STOPS = [0, 1, 5, 10];
export function PatinaDemo() {
  const [fam, setFam] = useState<Family>("leather");
  const [stop, setStop] = useState(0);
  const t = STOPS[stop];
  const [title, text] = COPY[fam][t];
  return (
    <div className="lab-grid">
      <div className="panel patina">
        <svg viewBox="0 0 220 200" role="img" aria-label={`${fam} bag after ${title.toLowerCase()}`} style={{ filter: look(fam, t) }}>
          <path d="M70 70 Q70 30 110 30 Q150 30 150 70" fill="none" stroke="#3b2a1e" strokeWidth="8" />
          <rect x="30" y="68" width="160" height="112" rx="18" fill={SWATCH[fam]} />
          <rect x="30" y="68" width="160" height="40" rx="18" fill="rgba(0,0,0,.12)" />
          <circle cx="110" cy="112" r="7" fill="#d8b46a" />
          {fam === "jute" && Array.from({ length: 9 }, (_, i) => <line key={i} x1={42 + i * 17} y1="112" x2={42 + i * 17} y2="172" stroke="rgba(0,0,0,.12)" />)}
        </svg>
      </div>
      <div className="panel col">
        <h3>Patina Preview</h3>
        <div className="ctl wrap" role="group" aria-label="Material">{(Object.keys(COPY) as Family[]).map((f) => <button key={f} className={`chip ${fam === f ? "on" : ""}`} aria-pressed={fam === f} onClick={() => setFam(f)}>{f}</button>)}</div>
        <label>Years of use <b>{title}</b><input type="range" min={0} max={3} step={1} value={stop} onChange={(e) => setStop(+e.target.value)} /></label>
        <p aria-live="polite">{text}</p>
        <p className="dim sm">The ageing model and the words are taken from Le Sac Doré&apos;s patina-preview component. The bag drawing is simplified for this demo.</p>
      </div>
    </div>
  );
}

/* ── BioAro Drugs: the market resolver, exactly in its order of precedence. ── */
type Country = "US" | "CA" | "GB";
const isCountry = (c: string): c is Country => c === "US" || c === "CA" || c === "GB";
const region = (c: Country) => (c === "GB" ? "UK" : "NA");
export function resolveMarket(saved: string, geo: string, langs: string[]) {
  if (saved && isCountry(saved)) return { country: saved, region: region(saved), source: "override" as const };
  if (geo && isCountry(geo)) return { country: geo, region: region(geo), source: "geoip" as const };
  const c: Country = langs.some((l) => l.toLowerCase().includes("gb")) ? "GB" : "US";
  return { country: c, region: region(c), source: "fallback" as const };
}
export function MarketDemo() {
  const [saved, setSaved] = useState("");
  const [geo, setGeo] = useState("CA");
  const [langs, setLangs] = useState("en-CA, en");
  const r = useMemo(() => resolveMarket(saved, geo, langs.split(",").map((l) => l.trim())), [saved, geo, langs]);
  return (
    <div className="lab-grid">
      <div className="panel col">
        <h3>Which store does a visitor see?</h3>
        <label>Saved manual choice<select value={saved} onChange={(e) => setSaved(e.target.value)}><option value="">none</option><option>US</option><option>CA</option><option>GB</option></select></label>
        <label>Country from Geo-IP<select value={geo} onChange={(e) => setGeo(e.target.value)}><option value="">unknown</option><option>US</option><option>CA</option><option>GB</option><option>FR</option></select></label>
        <label>Browser languages<input value={langs} onChange={(e) => setLangs(e.target.value)} /></label>
      </div>
      <div className="panel">
        <ol className="pipe pipe-v">
          {[["Saved override", r.source === "override"], ["Geo-IP", r.source === "geoip"], ["Browser language", r.source === "fallback"]].map(([l, on], i) => (
            <li key={String(l)} className={on ? "ok" : (i < ["override", "geoip", "fallback"].indexOf(r.source) ? "skip" : "")}><b>{i + 1}. {l}</b><span>{on ? "Used" : i < ["override", "geoip", "fallback"].indexOf(r.source) ? "Not set or not a supported country" : "Not needed"}</span></li>
          ))}
        </ol>
        <div className="neyu-out ans" aria-live="polite"><b>{r.country} store · {r.region === "NA" ? "North America experience" : "UK experience"}</b><p>Resolved by {r.source === "override" ? "the visitor's saved choice" : r.source === "geoip" ? "Geo-IP" : "browser language (defaults to US unless a language mentions GB)"}.</p></div>
        <p className="dim sm">Same order and rules as src/lib/market/resolve.ts: US and CA share the North America region, GB maps to the UK region.</p>
      </div>
    </div>
  );
}
