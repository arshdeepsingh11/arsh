import { retrieve, validate } from "@/lib/agents/retrieval";
import { esc, q, target } from "./dom";

/* Module 04: four responses to one question, scored by the same transparent checker the agents use. */

const QUESTIONS: { q: string; r: [string, string][] }[] = [
  {
    q: "What testing results does Arshdeep report at BioAro?",
    r: [
      ["Incorrect", "He reduced production defects by 45% and removed manual testing entirely."],
      ["Unsupported", "He is widely regarded as the best QA engineer in Alberta and won a national testing award."],
      ["Validated", "He reduced production defects by 20% and cut manual testing effort by 30%."],
      ["Source-grounded", "He reduced production defects by 20% through functional, integration and regression testing on the EMR platform, and cut manual testing effort by 30% with automation scripts. [Resume]"],
    ],
  },
  {
    q: "How many AI features does NEYU Health have?",
    r: [
      ["Incorrect", "NEYU Health has 40 AI features running on GPT."],
      ["Unsupported", "NEYU Health has the most advanced clinical AI in Canada."],
      ["Validated", "NEYU Health has 22 AI features on Google Gemini."],
      ["Source-grounded", "NEYU Health has 22 AI features on Google Gemini: 15 public website tools and 7 inside the patient record. [GitHub: Neyu-AI]"],
    ],
  },
];

export function judge(text: string) {
  const body = text.replace(/\[[^\]]+\]/g, "").trim();
  const cite = /\[[^\]]+\]/.test(text);
  const figures = validate(body);
  const top = retrieve(body, null, 1)[0];
  const words = [...new Set(body.toLowerCase().match(/[a-z]{4,}/g) ?? [])];
  const support = top ? words.filter((w) => top.text.toLowerCase().includes(w)).length / Math.max(1, words.length) : 0;
  const verdict = !figures.ok ? "Incorrect" : support < 0.45 ? "Unsupported" : cite ? "Source-grounded" : "Validated";
  return { verdict, figures, support, top, cite };
}

export function mountEvaluation(el: HTMLElement): () => void {
  let qi = 0;
  const card = (label: string, text: string) => {
    const j = judge(text);
    const cls = j.verdict.toLowerCase().replace(/[^a-z]/g, "");
    return `<article class="eval-card ${cls}"><header><span class="mono">${label ? `Labelled: ${label}` : "Your response"}</span><b>${j.verdict}</b></header><p>${esc(text)}</p><ul>
      <li>${j.figures.ok ? "Figures: all found in sources" : `Figures not in sources: ${esc(j.figures.issues.join(", "))}`}</li>
      <li>Wording supported by closest passage: ${Math.round(j.support * 100)}%${j.top ? ` <span class="dim">(${esc(j.top.title)})</span>` : ""}</li>
      <li>${j.cite ? "Cites a source" : "No citation"}</li></ul></article>`;
  };
  const render = () => {
    const cur = QUESTIONS[qi];
    el.innerHTML = `<div class="ctl wrap">${QUESTIONS.map((x, i) => `<button class="chip ${i === qi ? "on" : ""}" data-q="${i}">${esc(x.q)}</button>`).join("")}</div>
      <div class="eval-grid">${cur.r.map(([l, t]) => card(l, t)).join("")}</div>
      <form class="eval-own"><label for="ev-own">Write your own answer and run the same checker</label><div class="row"><input id="ev-own" placeholder="Type a response to the question above"><button class="btn sm">Evaluate</button></div><div data-own aria-live="polite"></div></form>
      <p class="dim sm">The checker does three things: it looks for every figure in the knowledge base, measures how much of the wording is supported by the closest source passage, and checks for a citation. It is a simple, transparent evaluator, not a second model.</p>`;
  };
  el.addEventListener("click", (e) => { const t = target(e); if (t.dataset.q !== undefined) { qi = +t.dataset.q; render(); } });
  el.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = q<HTMLInputElement>(el, "#ev-own").value.trim();
    if (v) q(el, "[data-own]").innerHTML = card("", v);
  });
  render();
  return () => {};
}
