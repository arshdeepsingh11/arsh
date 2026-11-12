import { q, target } from "./dom";

/* Module 02: a real two-layer perceptron trained by gradient descent in the browser. */

type Point = [x: number, y: number, label: 0 | 1];
type Activation = "tanh" | "relu";
type DatasetId = "ring" | "xor" | "split";
type Net = { w1: [number, number][]; b1: number[]; w2: number[]; b2: number };

const ACT: Record<Activation, [(x: number) => number, (y: number) => number]> = {
  tanh: [Math.tanh, (y) => 1 - y * y],
  relu: [(x) => Math.max(0, x), (y) => (y > 0 ? 1 : 0)],
};
const rnd = () => Math.random() * 2 - 1;
const DATASETS: Record<DatasetId, () => Point[]> = {
  xor: () => Array.from({ length: 120 }, () => { const x = rnd(), y = rnd(); return [x, y, x * y > 0 ? 1 : 0]; }),
  ring: () => Array.from({ length: 140 }, () => { const x = rnd(), y = rnd(); return [x, y, x * x + y * y < 0.4 ? 1 : 0]; }),
  split: () => Array.from({ length: 120 }, () => { const x = rnd(), y = rnd(); return [x, y, y > Math.sin(x * 3) * 0.5 ? 1 : 0]; }),
};

export function mountNeural(el: HTMLElement): () => void {
  let hidden = 5, lr = 0.08, act: Activation = "tanh", running = true, selected: number | null = null, epoch = 0, loss = 0, raf = 0, frame = 0;
  let data = DATASETS.ring();
  let net: Net = init();

  function init(): Net {
    epoch = 0;
    selected = null;
    return { w1: Array.from({ length: hidden }, () => [rnd(), rnd()] as [number, number]), b1: Array(hidden).fill(0), w2: Array.from({ length: hidden }, rnd), b2: 0 };
  }
  function forward(x: number, y: number): [number[], number] {
    const h = net.w1.map((w, i) => ACT[act][0](w[0] * x + w[1] * y + net.b1[i]));
    const z = h.reduce((a, v, i) => a + v * net.w2[i], net.b2);
    return [h, 1 / (1 + Math.exp(-z))];
  }
  function trainBatch() {
    let total = 0;
    for (let k = 0; k < 40; k++) {
      const [x, y, t] = data[(Math.random() * data.length) | 0];
      const [h, o] = forward(x, y);
      const d = o - t;
      total += -(t ? Math.log(o + 1e-9) : Math.log(1 - o + 1e-9));
      for (let i = 0; i < hidden; i++) {
        const g = d * net.w2[i] * ACT[act][1](h[i]);
        net.w2[i] -= lr * d * h[i];
        net.w1[i][0] -= lr * g * x;
        net.w1[i][1] -= lr * g * y;
        net.b1[i] -= lr * g;
      }
      net.b2 -= lr * d;
    }
    loss = total / 40;
    epoch++;
  }

  el.innerHTML = `<div class="lab-grid"><div><canvas class="nn-cv" width="260" height="260" aria-label="Decision surface of the network"></canvas><p class="mono dim" data-stat></p></div>
    <div><svg class="nn-svg" viewBox="0 0 320 240" role="img" aria-label="Network graph"></svg>
    <div class="ctl"><label>Dataset<select data-k="set"><option value="ring">Ring</option><option value="xor">XOR</option><option value="split">Wave</option></select></label>
    <label>Hidden neurons <b data-hv>5</b><input type="range" min="2" max="8" value="5" data-k="hidden"></label>
    <label>Learning rate <b data-lv>0.08</b><input type="range" min="1" max="30" value="8" data-k="lr"></label>
    <label>Activation<select data-k="act"><option>tanh</option><option>relu</option></select></label>
    <button class="btn sm" data-k="run">Pause</button><button class="btn sm ghost" data-k="reset">Reset weights</button></div>
    <p class="dim sm">Select a neuron to see what it alone responds to. Line weight shows connection strength; blue is positive, coral is negative.</p></div></div>`;
  const cv = q<HTMLCanvasElement>(el, "canvas");
  const cx = cv.getContext("2d")!;
  const svg = q<SVGSVGElement>(el, "svg");
  const stat = q(el, "[data-stat]");

  function drawGraph() {
    const ys = (n: number, i: number) => 120 + (i - (n - 1) / 2) * (200 / Math.max(n, 3));
    const col = (w: number) => (w > 0 ? "#3fa9e8" : "#f0733f");
    const width = (w: number) => Math.min(5, Math.abs(w) * 1.6 + 0.3);
    let s = "";
    net.w1.forEach((w, i) => {
      [0, 1].forEach((j) => (s += `<line x1="50" y1="${ys(2, j)}" x2="160" y2="${ys(hidden, i)}" stroke="${col(w[j])}" stroke-width="${width(w[j])}" opacity=".7"/>`));
      s += `<line x1="160" y1="${ys(hidden, i)}" x2="270" y2="120" stroke="${col(net.w2[i])}" stroke-width="${width(net.w2[i])}" opacity=".7"/>`;
    });
    ["x", "y"].forEach((n, j) => (s += `<circle cx="50" cy="${ys(2, j)}" r="14" class="nn-n"/><text x="50" y="${ys(2, j) + 4}" text-anchor="middle" class="nn-t">${n}</text>`));
    net.w1.forEach((_, i) => (s += `<circle cx="160" cy="${ys(hidden, i)}" r="12" class="nn-n ${selected === i ? "on" : ""}" data-n="${i}" tabindex="0" role="button" aria-label="Hidden neuron ${i + 1}"/>`));
    s += `<circle cx="270" cy="120" r="15" class="nn-n ${selected === null ? "on" : ""}" data-n="out" tabindex="0" role="button" aria-label="Output neuron"/><text x="270" y="124" text-anchor="middle" class="nn-t">out</text>`;
    svg.innerHTML = s;
  }
  function drawSurface() {
    const N = 40, c = 260 / N;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const [h, o] = forward((i / N) * 2 - 1, 1 - (j / N) * 2);
        const a = Math.max(0, Math.min(1, selected === null ? o : (h[selected] + 1) / 2));
        cx.fillStyle = `rgb(${(255 - a * 120) | 0},${(206 + a * 20) | 0},${(215 + a * 40) | 0})`;
        cx.fillRect(i * c, j * c, c + 1, c + 1);
      }
    for (const [x, y, t] of data) {
      cx.beginPath();
      cx.arc((x + 1) * 130, (1 - y) * 130, 3.2, 0, 7);
      cx.fillStyle = t ? "#2f7fe6" : "#f0733f";
      cx.fill();
      cx.strokeStyle = "#fff";
      cx.lineWidth = 1;
      cx.stroke();
    }
  }
  const redraw = () => { drawSurface(); drawGraph(); };
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!running) return;
    for (let i = 0; i < 4; i++) trainBatch();
    if (frame++ % 3 === 0) {
      redraw();
      stat.textContent = `epoch ${epoch} · loss ${loss.toFixed(3)} · showing ${selected === null ? "network output" : `hidden neuron ${selected + 1}`}`;
    }
  };

  el.addEventListener("input", (e) => {
    const t = target(e);
    if (t.dataset.k === "hidden") { hidden = +t.value; q(el, "[data-hv]").textContent = String(hidden); net = init(); }
    if (t.dataset.k === "lr") { lr = +t.value / 100; q(el, "[data-lv]").textContent = lr.toFixed(2); }
    if (t.dataset.k === "set") { data = DATASETS[t.value as DatasetId](); net = init(); }
    if (t.dataset.k === "act") { act = t.value as Activation; net = init(); }
  });
  el.addEventListener("click", (e) => {
    const t = target(e);
    if (t.dataset.k === "run") { running = !running; t.textContent = running ? "Pause" : "Train"; }
    if (t.dataset.k === "reset") { net = init(); redraw(); }
  });
  const pick = (e: Event) => {
    const n = (e.target as Element).getAttribute?.("data-n");
    if (n === null || n === undefined) return;
    selected = n === "out" ? null : +n;
    redraw();
  };
  svg.addEventListener("click", pick);
  svg.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } });

  redraw();
  loop();
  return () => cancelAnimationFrame(raf);
}
