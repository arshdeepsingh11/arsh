/**
 * The AI curriculum: each concept explained in plain words, with an everyday analogy and where it shows up in
 * Arshdeep's real work. Facts about his work trace to the résumé and repository READMEs.
 */

export type AiVisual = "next" | "tokens" | "context" | "embed" | "rag" | "agent" | "guard" | "eval" | "multi" | "tune" | "vision" | "vector" | "cost";

export type AiConcept = {
  id: string;
  n: string;
  title: string;
  simple: string;
  analogy: string;
  more: string;
  inWork: { text: string; href: string; src: string };
  visual: AiVisual;
};

export const AI_CONCEPTS: AiConcept[] = [
  {
    id: "llm", n: "01", title: "Large language models", visual: "next",
    simple: "A large language model (LLM) is a program that has read a huge amount of text and learned one skill extremely well: guessing the next word.",
    analogy: "Like your phone's autocomplete, if it had read a library. Ask a question and it keeps guessing the most fitting next word until an answer appears.",
    more: "It does not look facts up. It predicts. That is why it can write fluently and still be wrong, and why good systems give it the facts first. Temperature controls how adventurous the guesses are.",
    inWork: { text: "NEYU runs 22 features on Google Gemini; HARU and this site can switch between Gemini and Claude.", href: "/projects/neyu", src: "GitHub: Neyu-AI, Haru" },
  },
  {
    id: "tokens", n: "02", title: "Tokens", visual: "tokens",
    simple: "Models do not read letters or whole words. They read tokens: small chunks of text, often a word or part of a word.",
    analogy: "Like Lego bricks. Common words are one brick; rare words are built from several.",
    more: "Everything is measured in tokens: how much a model can read at once, how fast it answers and what it costs. A rough rule for English is about four characters per token.",
    inWork: { text: "Neyu's health insights engine was designed to optimise AI cost, which in practice means sending fewer, better tokens.", href: "/identity", src: "Resume" },
  },
  {
    id: "context", n: "03", title: "Context window", visual: "context",
    simple: "The context window is the model's working memory: everything it can see at once, including instructions, documents and the conversation so far.",
    analogy: "Like a desk. Only what fits on the desk can be used. When it overflows, the oldest papers fall off.",
    more: "Good systems choose carefully what goes on the desk. This site sends each agent only its instructions, the most relevant facts and the last few messages.",
    inWork: { text: "Every agent here gets a small, focused slice of the knowledge base instead of everything.", href: "/network", src: "This site" },
  },
  {
    id: "embeddings", n: "04", title: "Embeddings", visual: "embed",
    simple: "An embedding turns a piece of text into a list of numbers that captures its meaning. Texts that mean similar things end up with similar numbers.",
    analogy: "Like placing every sentence on a map, where neighbours talk about the same thing even if they use different words.",
    more: "Search by meaning works by finding the nearest neighbours on that map. The map on the right is a simplified two-dimensional picture; real embeddings have hundreds of dimensions.",
    inWork: { text: "Vector databases and embeddings are on his current exploration list.", href: "/identity", src: "GitHub profile README" },
  },
  {
    id: "rag", n: "05", title: "RAG: retrieval-augmented generation", visual: "rag",
    simple: "RAG means: first find the right facts, then let the model answer using only those facts.",
    analogy: "An open-book exam instead of answering from memory. The model looks up the page, then writes the answer and can show you the page.",
    more: "The search step can use keywords, embeddings or both. The demo on the right runs the real retrieval this site uses, over Arshdeep's verified knowledge, right in your browser.",
    inWork: { text: "Biongevity sends the top 3 passages to its assistant and shows them as sources; Neyu always displays supporting evidence; this site retrieves before every answer.", href: "/projects/biongevity", src: "GitHub: Biongevity, Neyu-AI" },
  },
  {
    id: "agents", n: "06", title: "Agents and tool use", visual: "agent",
    simple: "An agent is a model that can take actions: it decides which tool to use, uses it, reads the result and decides what to do next.",
    analogy: "Like a capable assistant with a phone and a calculator. It does not guess your balance; it looks it up.",
    more: "The safe pattern is to give the model narrow, validated tools and let ordinary code do anything that must be exact.",
    inWork: { text: "In HARU the AI calls authorised, validated tools and never does the arithmetic or writes to the database directly.", href: "/projects/haru", src: "GitHub: Haru" },
  },
  {
    id: "guardrails", n: "07", title: "Guardrails", visual: "guard",
    simple: "Guardrails are rules around the model: checks before it runs, limits on what it may say, and validation of what it said.",
    analogy: "Like the barriers on a mountain road. You still drive, but some mistakes are made impossible.",
    more: "The strongest guardrails are plain code, not more instructions to the model, because code cannot be talked out of a rule.",
    inWork: { text: "Neyu detects emergency language with fixed rules before any AI call, validates answers against real data, and blocks diagnosis and medication advice.", href: "/projects/neyu", src: "Resume, GitHub: Neyu-AI" },
  },
  {
    id: "eval", n: "08", title: "Hallucination and evaluation", visual: "eval",
    simple: "A hallucination is a confident answer that is not true. Evaluation is how you catch it: checking answers against sources, automatically and often.",
    analogy: "Like a fact-checker at a newspaper. The writer can be brilliant and still needs one.",
    more: "Even a simple check helps a lot: this site flags any figure in an agent's answer that does not appear in the verified knowledge base.",
    inWork: { text: "Automation scripts in CI cut manual testing by 30%; the Lab's Evaluation Arena shows the checker this site uses.", href: "/lab/evaluation", src: "Resume, this site" },
  },
  {
    id: "multi", n: "09", title: "Multi-agent systems", visual: "multi",
    simple: "Instead of one model doing everything, several specialised agents each do one job and one checks the others.",
    analogy: "Like a small team: a researcher, an analyst, a reviewer and a presenter.",
    more: "Specialists get smaller, clearer instructions, and a separate verifier catches mistakes the others missed.",
    inWork: { text: "The Intelligence Network on this site runs ARIA, NEX, ATLAS, ORACLE and optionally PIXEL and NOVA as separate calls.", href: "/network", src: "This site" },
  },
  {
    id: "tune", n: "10", title: "Prompting versus fine-tuning", visual: "tune",
    simple: "Prompting tells a model what to do in words. Fine-tuning retrains it on examples so the behaviour is built in.",
    analogy: "Prompting is giving a skilled chef a recipe. Fine-tuning is sending the chef to culinary school for one cuisine.",
    more: "Most products start with prompting plus retrieval: it is faster, cheaper and easier to update when the facts change.",
    inWork: { text: "Prompt engineering is part of his listed AI skills; his assistants combine instructions with retrieved data.", href: "/identity", src: "Resume" },
  },
  {
    id: "vision", n: "11", title: "Multimodal AI", visual: "vision",
    simple: "Multimodal models understand more than text: photos, scanned documents and charts.",
    analogy: "Like an assistant who can read the paper form you hand them, not just what you type.",
    more: "A useful pattern is to turn an image into structured data first, label it as AI-read, and keep the original unchanged.",
    inWork: { text: "Neyu's document reader turns a PDF or photo of a medical report into structured lab values and a plain-language summary, keeping the original file unchanged.", href: "/projects/neyu", src: "Resume, GitHub: Neyu-AI" },
  },
  {
    id: "vector", n: "12", title: "Vector databases", visual: "vector",
    simple: "A vector database stores embeddings and finds the closest ones very quickly, even among millions.",
    analogy: "Like a librarian who shelves books by topic instead of title, so the right book is always next to its neighbours.",
    more: "It is the memory behind large RAG systems: documents are embedded once, then every question searches by meaning.",
    inWork: { text: "Moving deeper into vector databases and agentic workflows is on his current list.", href: "/identity", src: "GitHub profile README" },
  },
  {
    id: "cost", n: "13", title: "Speed, cost and fallbacks", visual: "cost",
    simple: "Bigger models are usually smarter but slower and more expensive. Production systems mix models and always have a plan B.",
    analogy: "You do not send a senior surgeon to take a temperature.",
    more: "Use a fast model for small steps, a strong one for the final answer, and fall back to rules or another model when the service is busy.",
    inWork: { text: "Every Neyu AI feature has a rules-based fallback; this site uses a fast model for intermediate agent steps and switches models when one is busy.", href: "/projects/neyu", src: "GitHub: Neyu-AI, this site" },
  },
];
