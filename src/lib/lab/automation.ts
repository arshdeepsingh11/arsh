import { esc, sleep, target } from "./dom";

/* Module 06: build Trigger → AI Agent → Validation → Action and run it on real text with real rules. Actions are simulated. */

type Ctx = { text: string; category?: string; confidence?: number; email?: string | null; summary?: string; log?: string; fail?: string };
type Step = (c: Ctx) => Ctx;
type Kind = "Trigger" | "AI Agent" | "Validation" | "Action";

const LIB: Record<Kind, Record<string, Step>> = {
  Trigger: {
    "Contact form submitted": (c) => ({ ...c, log: "Received a form submission." }),
    "New support email": (c) => ({ ...c, log: "Received an email." }),
  },
  "AI Agent": {
    "Classify the request": (c) => {
      const t = c.text.toLowerCase();
      const category = /refund|charge|invoice|bill/.test(t) ? "billing" : /bug|error|crash|broken|not working/.test(t) ? "technical" : /quote|project|build|hire/.test(t) ? "new project" : "general";
      const confidence = category === "general" ? 0.42 : 0.9;
      return { ...c, category, confidence, log: `Classified as "${category}" (confidence ${confidence}).` };
    },
    "Extract contact details": (c) => {
      const m = c.text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
      return { ...c, email: m ? m[0] : null, log: m ? `Extracted email ${m[0]}.` : "No email address found in the message." };
    },
    "Summarize in one line": (c) => {
      const summary = c.text.split(/[.!?]/)[0].slice(0, 90);
      return { ...c, summary, log: `Summary: "${summary}".` };
    },
  },
  Validation: {
    "Confidence at least 0.7": (c) =>
      c.confidence === undefined ? { ...c, fail: "Nothing was classified, so there is no confidence to check." } : c.confidence >= 0.7 ? { ...c, log: "Confidence check passed." } : { ...c, fail: `Confidence ${c.confidence} is below 0.7.` },
    "Email address present": (c) => (c.email ? { ...c, log: "Email present." } : { ...c, fail: 'No extracted email address. Add an "Extract contact details" step first, or the message has none.' }),
    "No sensitive data": (c) => (/\b\d{3}[- ]?\d{3}[- ]?\d{3}\b|password/i.test(c.text) ? { ...c, fail: "Message appears to contain sensitive data." } : { ...c, log: "No sensitive data detected." }),
  },
  Action: {
    "Create a ticket": (c) => ({ ...c, log: `Simulated: ticket created in queue "${c.category ?? "unsorted"}".` }),
    "Draft a reply": (c) => ({ ...c, log: `Simulated: reply drafted${c.email ? ` to ${c.email}` : ""}. Nothing was sent.` }),
    "Route to a person": (c) => ({ ...c, log: "Simulated: handed to a human reviewer." }),
  },
};
const SAMPLES = [
  "Hi, I was charged twice on my last invoice. Please refund one. Reach me at dana@example.com.",
  "The booking page shows an error when I pick a date. It is not working on my phone.",
  "Hello there, just wondering about things.",
];

export function mountAutomation(el: HTMLElement): () => void {
  let flow: [Kind, string][] = [["Trigger", "Contact form submitted"], ["AI Agent", "Classify the request"], ["Validation", "Confidence at least 0.7"], ["Action", "Create a ticket"]];
  let text = SAMPLES[0], busy = false, alive = true;
  type Result = { st: "run" | "ok" | "fail"; msg: string };

  function render(res: Result[] = []) {
    el.innerHTML = `<div class="auto-flow">${flow
      .map(([k, v], i) => `<div class="auto-step ${res[i]?.st ?? ""}"><span class="mono">${k}</span><select data-i="${i}" aria-label="${k} step">${Object.keys(LIB[k]).map((o) => `<option ${o === v ? "selected" : ""}>${o}</option>`).join("")}</select><button class="x" data-del="${i}" aria-label="Remove step">×</button>${res[i] ? `<p>${esc(res[i].msg)}</p>` : ""}</div>`)
      .join('<i class="auto-arrow" aria-hidden="true">→</i>')}</div>
      <div class="ctl wrap">${(["AI Agent", "Validation", "Action"] as Kind[]).map((k) => `<button class="chip" data-addk="${k}">+ ${k}</button>`).join("")}</div>
      <label class="col">Sample input<textarea rows="2" data-text>${esc(text)}</textarea></label>
      <div class="ctl wrap">${SAMPLES.map((_, i) => `<button class="chip" data-s="${i}">Sample ${i + 1}</button>`).join("")}<button class="btn sm" data-run>Run workflow</button></div>
      <p class="dim sm">Steps run on the text above with real rules. Actions are simulated: nothing is sent or stored.</p>`;
  }
  async function run() {
    if (busy) return;
    busy = true;
    let c: Ctx = { text };
    const res: Result[] = [];
    for (let i = 0; i < flow.length; i++) {
      res[i] = { st: "run", msg: "Running…" };
      render(res);
      await sleep(550);
      if (!alive) return;
      c = LIB[flow[i][0]][flow[i][1]](c);
      if (c.fail) {
        res[i] = { st: "fail", msg: `${c.fail} Workflow stopped; later steps did not run.` };
        render(res);
        busy = false;
        return;
      }
      res[i] = { st: "ok", msg: c.log ?? "" };
      render(res);
    }
    busy = false;
  }

  el.addEventListener("change", (e) => { const t = target(e); if (t.dataset.i !== undefined) flow[+t.dataset.i][1] = t.value; });
  el.addEventListener("input", (e) => { const t = target(e); if (t.hasAttribute("data-text")) text = t.value; });
  el.addEventListener("click", (e) => {
    const t = target(e);
    if (t.dataset.del !== undefined && flow.length > 1 && !busy) { flow.splice(+t.dataset.del, 1); render(); }
    if (t.dataset.addk && !busy) {
      const k = t.dataset.addk as Kind;
      flow.splice(k === "Action" ? flow.length : Math.max(1, flow.length - 1), 0, [k, Object.keys(LIB[k])[0]]);
      render();
    }
    if (t.dataset.s !== undefined && !busy) { text = SAMPLES[+t.dataset.s]; render(); }
    if (t.hasAttribute("data-run")) void run();
  });
  render();
  return () => { alive = false; };
}
