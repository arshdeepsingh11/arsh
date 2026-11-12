import { certificates, clientSites, education, experience, fieldLoop, me, principles, projects, skills } from "@/lib/content";
import { AGENT_IDS, AGENTS, type AgentId } from "@/lib/content/agents";
import { AI_CONCEPTS } from "@/lib/content/ai";
import { capabilities, currentFocus, faq } from "@/lib/content/extra";

/** A unit of verified knowledge an agent may retrieve and cite. */
export type Passage = { id: string; title: string; text: string; src: string; tags: AgentId[] };

function build(): Passage[] {
  const out: Passage[] = [];
  const add = (id: string, title: string, text: string, src: string, tags: AgentId[]) => out.push({ id, title, text, src, tags });

  add("me", "Profile", `${me.name}. ${me.line}. Based in ${me.city}. ${me.summary}`, "Resume", ["aria", "atlas", "nova"]);
  add("contact", "Contact", `Email ${me.email}. Phone ${me.phone}. GitHub github.com/arshdeepsingh11. LinkedIn linkedin.com/in/arshdeep-singh-software.`, "Provided by Arshdeep", ["aria", "nova", "atlas"]);
  experience.forEach((e) => e.bullets.forEach((b, i) => add(`${e.id}-${i}`, `${e.role}, ${e.org} (${e.period})`, `As ${e.role} at ${e.org}, ${e.place} (${e.period}): ${b}`, "Resume", ["atlas", "aria"])));
  Object.entries(skills).forEach(([k, v]) => add(`skill-${k}`, `Skills: ${k}`, `${v.join(", ")}.`, "Resume", ["atlas", "nex", "nova"]));
  fieldLoop.forEach((f) => add(`loop-${f.k}`, `How he works: ${f.k}`, `${f.t}. ${f.e}`, "Resume and repositories", ["aria", "atlas", "nova"]));
  principles.forEach((p, i) => add(`pr-${i}`, `Principle: ${p.t}`, p.d, "Repositories", ["oracle", "aria"]));
  projects.forEach((p) => {
    add(
      `p-${p.slug}`,
      `Project: ${p.name}`,
      `${p.name} is a ${p.kind}. ${p.tag} Stack: ${p.stack.join(", ")}. Repository: github.com/arshdeepsingh11/${p.repo}.` +
        (p.live ? ` Live at ${p.live.replace("https://", "")}.` : "") +
        (p.team ? ` ${p.team}` : "") +
        (p.contribution ? ` ${p.contribution}` : ""),
      `GitHub: ${p.repo}`,
      ["nex", "aria", "pixel", "oracle"],
    );
    p.facts.forEach((f, i) => add(`p-${p.slug}-${i}`, `${p.name}: detail`, `${p.name}: ${f}.`, `GitHub: ${p.repo}`, ["nex", "pixel", "oracle"]));
  });
  clientSites.forEach((c, i) => add(`site-${i}`, `Client website: ${c.name}`, `${c.name} (${c.url.replace("https://", "")}). ${c.d} Built at BioAro.`, "Resume", ["atlas", "pixel", "aria"]));
  add("edu", "Education", `${education.credential} in ${education.program}, ${education.school} (${education.short}), ${education.place}. Completed ${education.completed}. Official program facts: ${education.official.join("; ")}.`, "Resume and sait.ca", ["atlas", "aria"]);
  education.areas.forEach((a, i) => add(`edu-${i}`, `SAIT program area: ${a.k}`, a.d, "sait.ca program page", ["atlas"]));
  certificates.forEach((c) => add(c.id, `Certificate: ${c.title}`, `${c.title}, issued by ${c.issuer} on ${c.issued}. ${c.detail}. Reference ${c.ref}.`, "Scanned certificate", ["atlas", "aria"]));
  add("ai-ground", "Concept: grounded answers", "A grounded answer is one whose claims can each be traced to a retrieved source passage. On this site every agent answer is checked on the server: figures that do not appear in the knowledge base are flagged to the visitor.", "This application", ["oracle"]);
  add("ai-agents", "Concept: the Intelligence Network", "The Intelligence Network runs each agent as a separate server-side model call with its own instructions and its own slice of the knowledge base. ARIA interprets, NEX inspects projects, ATLAS reviews experience, ORACLE checks the claims and ARIA presents the result. In demo mode the same stages run as deterministic retrieval and scoring functions with no language model, and the interface says so.", "This application", ["oracle", "aria"]);
  capabilities.forEach((c) => add(`cap-${c.id}`, `What he builds: ${c.title}`, `${c.title}: ${c.line} ${c.detail} Technologies: ${c.tech.join(", ")}.`, "Resume and repositories", ["aria", "nova", "atlas", "nex"]));
  add("focus", "What he is working on now", `${currentFocus.headline}. Currently exploring: ${currentFocus.exploring.join("; ")}. AI tools he lists: ${currentFocus.aiStack.join(", ")}.`, currentFocus.source, ["aria", "oracle", "atlas", "nex"]);
  faq.forEach((f, i) => add(`faq-${i}`, `FAQ: ${f.q}`, `${f.q} ${f.a}`, "Resume and repositories", ["aria", "atlas", "nova"]));
  AI_CONCEPTS.forEach((c) => add(`ai-${c.id}`, `AI explained: ${c.title}`, `${c.title}. ${c.simple} ${c.analogy} ${c.more} In Arshdeep's work: ${c.inWork.text}`, c.inWork.src, ["oracle", "aria"]));
  add("roster", "The agents on this site", AGENT_IDS.map((id) => `${AGENTS[id].name} is the ${AGENTS[id].role}: ${AGENTS[id].scope}.`).join(" "), "This application", ["aria", "oracle"]);
  add("pages", "Pages on this site", "Universe is the home page. The Intelligence Network runs a multi-agent task. The Multiverse lists every project world, each with a demo or live window, architecture, code and facts. AI Explained teaches LLMs, tokens, embeddings, RAG, agents and guardrails in simple words. Identity holds the career record and résumé. The Foundation covers SAIT. The Vault shows certificates. The Lab has working simulations. Collaborate starts a project with NOVA.", "This application", ["aria"]);
  add("collab", "Working together", "His record covers full-stack web and mobile builds, AI assistants grounded in an organisation's own data, clinic and healthcare software, storefronts and client websites. The fastest way to start is the Collaborate space or an email to arsh.016vs@gmail.com.", "Resume and repositories", ["nova", "aria"]);
  return out;
}

export const PASSAGES: Passage[] = build();
export const CORPUS = PASSAGES.map((p) => p.text).join(" ").toLowerCase();
