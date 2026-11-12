import { AGENT_IDS, type AgentId } from "@/lib/content/agents";

/**
 * Decides which agent answers a question. Pure and instant (no model call), so it runs the same on the server and in
 * the browser: the browser uses it to start the hand-off animation, the server uses it to pick the answering agent.
 *
 * Rules:
 *  1. Naming an agent ("ATLAS, what did he study?") always brings that agent in.
 *  2. Otherwise each agent scores the question against its topic words; phrases count more than single words.
 *  3. Another agent takes over only when it clearly beats the current one (by 2 or more). Otherwise the current
 *     agent keeps the conversation, so follow-ups like "tell me more" stay with whoever is talking.
 */

type Rule = [RegExp, number];

const TOPICS: Record<AgentId, Rule[]> = {
  aria: [
    [/\b(hi|hello|hey|good (morning|afternoon|evening))\b/i, 1],
    [/\b(who is (he|arshdeep)|about (him|arshdeep)|30[- ]second|overview|summar(y|ise|ize) (him|arshdeep)|introduce)\b/i, 3],
    [/\b(where (should|do) i (look|start|go)|show me around|navigate|which page|take me|guide me|this (site|website|portfolio))\b/i, 3],
    [/\b(strongest|best|favourite|favorite|top) (project|work)\b/i, 2],
  ],
  nex: [
    [/\b(code|coding|repo|repos|repository|repositories|github|source)\b/i, 2],
    [/\b(tech(nology)? stack|stack|architecture|backend|back-end|frontend|front-end|database|schema|api|apis|endpoint|deploy\w*|infrastructure|devops|ci\/cd)\b/i, 2],
    [/\b(next\.?js|react|typescript|javascript|node|prisma|postgres\w*|supabase|redis|python|java|c\+\+|flutter|expo|react native|tailwind|sql|docker)\b/i, 2],
    [/\b(how (is|was) (it|this|that) built|built with|implement\w*|provider abstraction|bug|testing|tests?)\b/i, 2],
  ],
  pixel: [
    [/\b(design|designs|designed|ui|ux|interface|interfaces|visual\w*|look and feel|looks?|aesthetic\w*)\b/i, 2],
    [/\b(animation\w*|motion|3d|three\.?js|webgl|characters?|illustrat\w*|theme|themes|colou?rs?|typography|layout|figma|branding)\b/i, 2],
    [/\b(digital passport|patina|body explorer)\b/i, 3],
  ],
  atlas: [
    [/\b(career|experience|work history|employ\w*|employer|job|jobs|current role|his role|position|résumé|resume|cv|linkedin)\b/i, 2],
    [/\b(stud(y|ied|ies)|education|degree|diploma|college|school|university|sait|graduat\w*)\b/i, 3],
    [/\b(certific\w*|credential\w*|qualif\w*|courses?)\b/i, 3],
    [/\b(achievement\w*|results?|accomplish\w*|impact|recruit\w*|years of|references?|where (does|did) he work)\b/i, 2],
    [/\b(bioaro|calgary)\b/i, 1],
  ],
  oracle: [
    [/\b(ai|a\.i\.)\b/i, 1],
    [/\b(artificial intelligence|machine learning|ml|deep learning|neural( network)?s?)\b/i, 2],
    [/\b(llms?|large language models?|rag|retrieval|embeddings?|vectors?|vector database|tokens?|context window|fine[- ]?tun\w*|prompt\w*|hallucinat\w*|grounded|guardrails?|evaluation|evals?)\b/i, 3],
    [/\b(how do (these|the|you) agents work|how does this (site|chat|ai) work|the lab|intelligence lab|simulation)\b/i, 3],
  ],
  nova: [
    [/\b(hire (him|arshdeep)|work with (him|arshdeep)|collaborat\w*|freelance|contract work|available|availability)\b/i, 3],
    [/\b(build (me|us|my|our)|i need (a|an)|we need (a|an)|my (clinic|business|company|startup|store|shop|app|idea)|our (clinic|business|company|startup|team))\b/i, 3],
    [/\b(contact|email|get in touch|reach (him|out)|quote|inquiry|enquiry|brief|start a project|new project)\b/i, 2],
  ],
};

const NAMES: Record<AgentId, RegExp> = Object.fromEntries(AGENT_IDS.map((id) => [id, new RegExp(`\\b${id}\\b`, "i")])) as Record<AgentId, RegExp>;

export function topicScores(question: string): Record<AgentId, number> {
  const out = Object.fromEntries(AGENT_IDS.map((id) => [id, 0])) as Record<AgentId, number>;
  for (const id of AGENT_IDS) for (const [rx, w] of TOPICS[id]) if (rx.test(question)) out[id] += w;
  return out;
}

export function routeAgent(question: string, current: AgentId): AgentId {
  const q = question.slice(0, 2000);
  const named = AGENT_IDS.filter((id) => NAMES[id].test(q));
  // "Ask ATLAS" style requests. If several agents are named, the first one mentioned wins.
  if (named.length) return named.sort((a, b) => q.search(NAMES[a]) - q.search(NAMES[b]))[0];
  const s = topicScores(q);
  let best = current;
  for (const id of AGENT_IDS) if (s[id] > s[best]) best = id;
  return s[best] >= s[current] + 2 ? best : current;
}

/** One short line the incoming agent "says" when it takes over, shown in the chat. */
export const HANDOFF_LINE: Record<AgentId, string> = {
  aria: "ARIA steps in. She can give the big picture and show you around.",
  nex: "NEX takes this one. Code and architecture are his area.",
  pixel: "PIXEL jumps in. Design, motion and 3D are her thing.",
  atlas: "ATLAS takes over. He holds the career, education and certificate record.",
  oracle: "ORACLE joins. AI concepts and how these agents work are her field.",
  nova: "NOVA comes in. She helps shape projects and get you in touch.",
};
