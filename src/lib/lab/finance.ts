import { q, qa, target } from "./dom";

/* Module 05: Monte Carlo projection on fictional inputs. A teaching simulation, never advice. */

type Inputs = { start: number; monthly: number; years: number; ret: number; vol: number; goal: number };
const CONTROLS: [keyof Inputs, string, number, number, number, "$" | "%" | ""][] = [
  ["start", "Starting amount", 0, 50000, 1000, "$"],
  ["monthly", "Monthly contribution", 0, 2000, 50, "$"],
  ["years", "Horizon (years)", 1, 30, 1, ""],
  ["ret", "Assumed average return", 0, 12, 0.5, "%"],
  ["vol", "Assumed volatility (risk)", 0, 30, 1, "%"],
  ["goal", "Goal", 10000, 500000, 5000, "$"],
];
const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

export function simulate(s: Inputs, runs = 400) {
  const paths: number[][] = [];
  for (let r = 0; r < runs; r++) {
    let b = s.start;
    const p = [b];
    for (let y = 0; y < s.years; y++) { b = Math.max(0, b * (1 + s.ret / 100 + (s.vol / 100) * gauss()) + s.monthly * 12); p.push(b); }
    paths.push(p);
  }
  const pct = (qq: number) => Array.from({ length: s.years + 1 }, (_, y) => { const c = paths.map((p) => p[y]).sort((a, b) => a - b); return c[Math.floor(qq * (runs - 1))]; });
  return { paths, bands: [0.1, 0.25, 0.5, 0.75, 0.9].map(pct), hit: paths.filter((p) => p[s.years] >= s.goal).length / runs };
}

export function mountFinance(el: HTMLElement): () => void {
  const s: Inputs = { start: 10000, monthly: 400, years: 15, ret: 6, vol: 14, goal: 150000 };
  el.innerHTML = `<p class="banner">Fictional sample data. This is a teaching simulation, not investment advice, and it says nothing about any real product or market.</p><div class="lab-grid"><div class="ctl col">
    ${CONTROLS.map(([k, l, a, b, st, u]) => `<label>${l} <b data-v="${k}"></b><input type="range" data-k="${k}" data-u="${u}" min="${a}" max="${b}" step="${st}" value="${s[k]}"></label>`).join("")}</div>
    <div><canvas class="fin-cv" width="560" height="280" aria-label="Simulated range of outcomes"></canvas><div class="fin-out" data-out aria-live="polite"></div></div></div>`;
  const cx = q<HTMLCanvasElement>(el, "canvas").getContext("2d")!;

  function render() {
    const R = 400;
    const { bands, hit } = simulate(s, R);
    const max = Math.max(bands[4][s.years], s.goal) * 1.08;
    const X = (y: number) => 46 + (y / s.years) * 500, Y = (v: number) => 256 - (v / max) * 240;
    cx.clearRect(0, 0, 560, 280);
    const area = (lo: number[], hi: number[], c: string) => {
      cx.beginPath();
      lo.forEach((v, y) => (y ? cx.lineTo(X(y), Y(v)) : cx.moveTo(X(y), Y(v))));
      for (let y = s.years; y >= 0; y--) cx.lineTo(X(y), Y(hi[y]));
      cx.fillStyle = c;
      cx.fill();
    };
    area(bands[0], bands[4], "rgba(63,169,232,.16)");
    area(bands[1], bands[3], "rgba(63,169,232,.3)");
    cx.beginPath();
    bands[2].forEach((v, y) => (y ? cx.lineTo(X(y), Y(v)) : cx.moveTo(X(y), Y(v))));
    cx.strokeStyle = "#2f7fe6"; cx.lineWidth = 2.5; cx.stroke();
    cx.setLineDash([5, 5]); cx.beginPath(); cx.moveTo(46, Y(s.goal)); cx.lineTo(546, Y(s.goal)); cx.strokeStyle = "#c2933a"; cx.lineWidth = 1.5; cx.stroke(); cx.setLineDash([]);
    cx.fillStyle = "#778191"; cx.font = "11px ui-monospace, monospace";
    cx.fillText(`goal ${fmt(s.goal)}`, 50, Y(s.goal) - 6); cx.fillText("year 0", 46, 274); cx.fillText(`year ${s.years}`, 500, 274);

    const paid = s.start + s.monthly * 12 * s.years;
    const factors: string[] = [];
    if (s.vol > 20) factors.push("High assumed volatility widens the range more than it lifts the middle.");
    if (s.years < 5) factors.push("A short horizon leaves little time to recover from a bad year.");
    if (bands[2][s.years] < s.goal) factors.push("The median outcome is below the goal: contribution or horizon matters more than return here.");
    if (s.ret > 9) factors.push("The return assumption is optimistic; test a lower one.");
    if (!factors.length) factors.push("Under these assumptions the goal is reached in most simulated paths.");
    q(el, "[data-out]").innerHTML = `<div class="kpis"><div><span>Chance of reaching goal</span><b>${Math.round(hit * 100)}%</b></div><div><span>Median outcome</span><b>${fmt(bands[2][s.years])}</b></div><div><span>Weak case (10th pct)</span><b>${fmt(bands[0][s.years])}</b></div><div><span>Total paid in</span><b>${fmt(paid)}</b></div></div><p class="mono dim">${R} simulated paths · bands show 10–90% and 25–75%</p><ul class="hints">${factors.map((f) => `<li>${f}</li>`).join("")}</ul>`;
  }
  const labels = () => qa<HTMLInputElement>(el, "input[type=range]").forEach((i) => {
    const u = i.dataset.u;
    q(el, `[data-v="${i.dataset.k}"]`).textContent = u === "$" ? fmt(+i.value) : `${i.value}${u}`;
  });
  el.addEventListener("input", (e) => { const t = target(e); if (t.dataset.k) { s[t.dataset.k as keyof Inputs] = +t.value; labels(); render(); } });
  labels();
  render();
  return () => {};
}
