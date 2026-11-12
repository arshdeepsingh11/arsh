import { q, target } from "./dom";

/* Module 03: build an AI system from components, connect them, and send a request through it. */

const TYPES = { Frontend: "#3fa9e8", API: "#2f7fe6", Database: "#7a8698", LLM: "#8b6cf0", Agent: "#12a79b", Tool: "#f0733f", Memory: "#c2933a", Evaluation: "#d9488b" } as const;
type Kind = keyof typeof TYPES;
type Node = { id: number; t: Kind; x: number; y: number; hot?: boolean };
type Edge = [number, number];

export function mountArchitecture(el: HTMLElement): () => void {
  let nodes: Node[] = [], edges: Edge[] = [], pick: number | null = null, nextId = 0, raf = 0, running = false;
  let drag: { id: number; moved: boolean } | null = null;
  let packets: { x: number; y: number }[] = [];

  const add = (t: Kind, x?: number, y?: number) => { nodes.push({ id: ++nextId, t, x: x ?? 80 + Math.random() * 400, y: y ?? 60 + Math.random() * 200 }); return nextId; };
  const N = (i: number) => nodes.find((n) => n.id === i)!;
  const preset = () => {
    nodes = []; edges = []; nextId = 0;
    const f = add("Frontend", 70, 150), a = add("API", 200, 150), ag = add("Agent", 340, 110), l = add("LLM", 480, 60), t = add("Tool", 480, 160), m = add("Memory", 340, 230), d = add("Database", 200, 250), ev = add("Evaluation", 600, 60);
    edges = [[f, a], [a, ag], [ag, l], [ag, t], [ag, m], [a, d], [l, ev]];
  };

  el.innerHTML = `<div class="ctl wrap">${(Object.keys(TYPES) as Kind[]).map((t) => `<button class="chip" data-add="${t}" style="--c:${TYPES[t]}">+ ${t}</button>`).join("")}</div>
    <svg class="arch-svg" viewBox="0 0 680 310" role="application" aria-label="Architecture canvas"></svg>
    <div class="ctl"><button class="btn sm" data-run>Send a request</button><button class="btn sm ghost" data-preset>Reference layout</button><button class="btn sm ghost" data-clear>Clear</button><span class="dim sm">Drag to move. Select one component, then another, to connect or disconnect them. Delete removes a focused component.</span></div><ul class="hints" data-hints></ul>`;
  const svg = q<SVGSVGElement>(el, "svg");
  const hints = q(el, "[data-hints]");

  function check() {
    const has = (t: Kind) => nodes.some((n) => n.t === t);
    const linked = (a: Kind, b: Kind) => edges.some(([x, y]) => (N(x).t === a && N(y).t === b) || (N(x).t === b && N(y).t === a));
    const out: string[] = [];
    if (!has("Frontend")) out.push("Add a Frontend: requests start there.");
    if (has("LLM") && !has("Evaluation")) out.push("The LLM has no Evaluation step, so wrong answers would ship unchecked.");
    else if (has("LLM") && !linked("LLM", "Evaluation") && !linked("Agent", "Evaluation")) out.push("Evaluation exists but nothing feeds it. Connect it to the LLM or the Agent.");
    if (has("Agent") && !linked("Agent", "Tool")) out.push("The Agent has no Tool. It can talk, but it cannot act or look anything up.");
    if (has("Frontend") && has("LLM") && linked("Frontend", "LLM")) out.push("The Frontend talks to the LLM directly, which would expose the API key. Route it through the API.");
    if (has("Agent") && !linked("Agent", "Memory")) out.push("No Memory connected: every request starts from zero.");
    if (!out.length) out.push("Sound layout: requests go through the API, the agent has tools and memory, and model output is evaluated.");
    hints.innerHTML = out.map((o) => `<li>${o}</li>`).join("");
  }
  function draw() {
    svg.innerHTML =
      edges.map(([a, b]) => `<line x1="${N(a).x}" y1="${N(a).y}" x2="${N(b).x}" y2="${N(b).y}" class="arch-e"/>`).join("") +
      packets.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#242a35"/>`).join("") +
      nodes.map((n) => `<g class="arch-n ${pick === n.id ? "on" : ""} ${n.hot ? "hot" : ""}" data-id="${n.id}" transform="translate(${n.x},${n.y})" tabindex="0" role="button" aria-label="${n.t}"><rect x="-48" y="-18" width="96" height="36" rx="18" style="--c:${TYPES[n.t]}"/><text text-anchor="middle" y="4">${n.t}</text></g>`).join("");
  }
  const toSvg = (e: PointerEvent): [number, number] => { const r = svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 680, ((e.clientY - r.top) / r.height) * 310]; };
  const select = (i: number) => {
    if (pick && pick !== i) {
      const k = edges.findIndex(([a, b]) => (a === pick && b === i) || (a === i && b === pick));
      if (k >= 0) edges.splice(k, 1);
      else edges.push([pick, i]);
      pick = null;
    } else pick = pick === i ? null : i;
    check();
    draw();
  };

  svg.addEventListener("pointerdown", (e) => {
    const g = (e.target as Element).closest("[data-id]");
    if (!g) { pick = null; draw(); return; }
    drag = { id: Number(g.getAttribute("data-id")), moved: false };
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [x, y] = toSvg(e), n = N(drag.id);
    if (Math.abs(n.x - x) + Math.abs(n.y - y) > 4) drag.moved = true;
    if (drag.moved) { n.x = Math.max(50, Math.min(630, x)); n.y = Math.max(20, Math.min(290, y)); draw(); }
  });
  svg.addEventListener("pointerup", () => { if (drag && !drag.moved) select(drag.id); drag = null; });
  svg.addEventListener("keydown", (e) => {
    const g = (e.target as Element).closest("[data-id]");
    if (!g) return;
    const i = Number(g.getAttribute("data-id"));
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); }
    if (e.key === "Delete" || e.key === "Backspace") { nodes = nodes.filter((n) => n.id !== i); edges = edges.filter(([a, b]) => a !== i && b !== i); check(); draw(); }
  });

  async function flow() {
    if (running) return;
    const start = nodes.find((n) => n.t === "Frontend") ?? nodes[0];
    if (!start) return;
    running = true;
    const seen = new Set([start.id]);
    let frontier = [start.id];
    while (frontier.length && el.isConnected) {
      const next: number[] = [], hops: Edge[] = [];
      frontier.forEach((a) => edges.forEach(([x, y]) => { const b = x === a ? y : y === a ? x : null; if (b && !seen.has(b)) { seen.add(b); next.push(b); hops.push([a, b]); } }));
      if (!hops.length) break;
      await new Promise<void>((res) => {
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / 650);
          packets = hops.map(([a, b]) => ({ x: N(a).x + (N(b).x - N(a).x) * k, y: N(a).y + (N(b).y - N(a).y) * k }));
          draw();
          if (k < 1) raf = requestAnimationFrame(tick);
          else { hops.forEach(([, b]) => (N(b).hot = true)); res(); }
        };
        raf = requestAnimationFrame(tick);
      });
      frontier = next;
    }
    packets = [];
    draw();
    const missed = nodes.filter((n) => !seen.has(n.id));
    hints.insertAdjacentHTML("afterbegin", `<li><b>Request reached ${seen.size} of ${nodes.length} components.</b>${missed.length ? ` Unreached: ${missed.map((m) => m.t).join(", ")}.` : ""}</li>`);
    setTimeout(() => { nodes.forEach((n) => (n.hot = false)); draw(); running = false; }, 1200);
  }

  el.addEventListener("click", (e) => {
    const t = target(e);
    if (t.dataset.add) { add(t.dataset.add as Kind); check(); draw(); }
    if (t.hasAttribute("data-run")) { check(); void flow(); }
    if (t.hasAttribute("data-preset")) { preset(); check(); draw(); }
    if (t.hasAttribute("data-clear")) { nodes = []; edges = []; check(); draw(); }
  });
  preset();
  check();
  draw();
  return () => cancelAnimationFrame(raf);
}
