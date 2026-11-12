/**
 * Additional verified content. Sources: résumé, repository READMEs and source, and the GitHub profile README
 * (github.com/arshdeepsingh11, "About Me" and "Currently Exploring").
 */

export const HERO = {
  title: ["Arshdeep", "Singh"],
  line: "I build what you can imagine.",
  sub: "Websites, mobile apps, AI assistants, healthcare platforms, storefronts and the systems behind them, from the first idea to a product people use every day.",
  rotating: ["AI assistants that know your data", "Full-stack web platforms", "Mobile apps", "Healthcare software", "Online stores", "Dashboards and automation", "3D and interactive experiences"],
};

export type Capability = { id: string; title: string; line: string; detail: string; evidence: { label: string; href: string }[]; tech: string[]; icon: string };

/** "I build what you can imagine", backed by something real for every claim. */
export const capabilities: Capability[] = [
  {
    id: "ai", title: "AI assistants & agents", icon: "M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2M12 8a4 4 0 100 8 4 4 0 000-8z",
    line: "Assistants that answer from your own data, show their evidence and stay inside safe limits.",
    detail: "A clinical AI companion with 22 features and a rules-based fallback for each, an agent that only acts through validated tools, a shopping concierge, and the six agents on this site.",
    evidence: [{ label: "NEYU Health", href: "/projects/neyu" }, { label: "HARU", href: "/projects/haru" }, { label: "Le Sac Doré", href: "/projects/le-sac-dore" }],
    tech: ["Gemini API", "Claude", "Prompt engineering", "Tool use", "Guardrails"],
  },
  {
    id: "web", title: "Full-stack web platforms", icon: "M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01",
    line: "Complete products: accounts, databases, admin consoles, payments and analytics.",
    detail: "A luxury commerce platform with Digital Passports and an admin console, a workforce scheduling app with three roles, and a health platform with 62 database tables.",
    evidence: [{ label: "Le Sac Doré", href: "/projects/le-sac-dore" }, { label: "Trade Shift", href: "/projects/trade-shift" }, { label: "NEYU Health", href: "/projects/neyu" }],
    tech: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma"],
  },
  {
    id: "mobile", title: "Mobile apps", icon: "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2",
    line: "iOS and Android apps with secure sign-in, navigation and real data.",
    detail: "Expo and React Native apps with Supabase authentication and Row Level Security, plus a Capacitor phone app with biometric sign-in and health-data connections.",
    evidence: [{ label: "Secure Auth App", href: "/projects/secure-auth" }, { label: "YEG-YYC", href: "/projects/yeg-yyc" }, { label: "Expo Calculator", href: "/projects/expo-calculator" }],
    tech: ["React Native", "Expo", "Capacitor", "Supabase"],
  },
  {
    id: "health", title: "Healthcare software", icon: "M12 21s-7-4.5-7-11a4 4 0 017-2.6A4 4 0 0119 10c0 6.5-7 11-7 11zM9 11h6M12 8v6",
    line: "Clinical systems built with privacy, standards and safety first.",
    detail: "BioEMR, an Electronic Medical Record platform with HL7 configuration, HIPAA compliance and Netcare and Connect Care integrations, and an AI document reader that turns scanned reports into lab values.",
    evidence: [{ label: "Professional record", href: "/identity" }, { label: "NEYU Health", href: "/projects/neyu" }],
    tech: ["HL7", "HIPAA", "Audit logging", "Role-based access"],
  },
  {
    id: "commerce", title: "Online stores", icon: "M5 7h14l-1.5 11h-11zM9 7V5a3 3 0 016 0v2",
    line: "Storefronts that sell across markets, with checkout that works.",
    detail: "A Shopify-powered storefront with a US, Canada and UK market layer, a luxury boutique with appointments and wishlists, and event registration with Stripe.",
    evidence: [{ label: "BioAro Drugs", href: "/projects/bioaro-drugs" }, { label: "Le Sac Doré", href: "/projects/le-sac-dore" }, { label: "Longevity Summit", href: "/projects" }],
    tech: ["Shopify Storefront API", "Stripe", "Next.js", "Vite"],
  },
  {
    id: "data", title: "Dashboards & automation", icon: "M4 19V5m0 14h16M8 15v-4m4 4V8m4 7v-6",
    line: "Numbers people can trust, and fewer manual steps.",
    detail: "Business Intelligence dashboards that cut reporting time, first-party analytics with funnels and live visitors, and test automation that cut manual testing effort by 30%.",
    evidence: [{ label: "Professional record", href: "/identity" }, { label: "Automation Studio", href: "/lab/automation" }],
    tech: ["PostgreSQL", "MongoDB", "Python", "GitHub Actions", "CI/CD"],
  },
  {
    id: "3d", title: "3D & interactive experiences", icon: "M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12 3 7",
    line: "Interfaces people remember: 3D, motion and real-time simulation.",
    detail: "A clickable 3D body explorer for a skin clinic, a precision-health experience with 3D and scroll motion, and the six 3D characters on this site.",
    evidence: [{ label: "NEA Precision Skin", href: "/projects/nea" }, { label: "OVEREO", href: "/projects/overeo" }, { label: "The Lab", href: "/lab" }],
    tech: ["Three.js", "GSAP", "WebGL", "Framer Motion"],
  },
  {
    id: "sites", title: "Websites that ship", icon: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    line: "Branded, responsive, search-aware sites with booking and registration.",
    detail: "Six or more live client websites across healthcare, longevity, aesthetics and finance, built with WordPress, Elementor, React and Next.js.",
    evidence: [{ label: "Client websites", href: "/projects" }],
    tech: ["WordPress", "Elementor", "Next.js", "SEO"],
  },
];

/** From the GitHub profile README. */
export const currentFocus = {
  headline: "Crafting intelligent, scalable applications at the intersection of code and AI",
  exploring: ["LLMs, RAG systems and intelligent agents", "Production-ready AI features inside real products", "AI tooling, vector databases and agentic workflows", "RAG pipelines and agentic workflows", "Production deployment patterns for intelligent systems"],
  aiStack: ["Python", "LangChain", "LLMs", "RAG", "Prompt Engineering", "Vector DBs"],
  source: "GitHub profile README",
};

export const stats: { n: string; label: string; src: string; href: string }[] = [
  { n: "15", label: "project worlds from public repositories", src: "GitHub", href: "/projects" },
  { n: "22", label: "AI features in NEYU Health", src: "GitHub: Neyu-AI", href: "/projects/neyu" },
  { n: "608", label: "automated checks reported passing in NEYU", src: "GitHub: Neyu-AI", href: "/projects/neyu" },
  { n: "62", label: "database tables in the NEYU data model", src: "GitHub: Neyu-AI", href: "/projects/neyu" },
  { n: "6+", label: "live client websites shipped", src: "Resume", href: "/identity" },
  { n: "20%", label: "fewer production defects on an EMR platform", src: "Resume", href: "/identity" },
  { n: "30%", label: "less manual testing after automation", src: "Resume", href: "/identity" },
  { n: "6", label: "AI agents on this site, each a separate model call", src: "This site", href: "/network" },
];

export const faq: { q: string; a: string; href?: string }[] = [
  { q: "What does Arshdeep build?", a: "Full-stack web platforms, mobile apps, AI assistants grounded in an organisation's own data, healthcare software, online stores, dashboards and client websites. Every category here links to real work.", href: "/projects" },
  { q: "Where is he based?", a: "Calgary, Alberta, Canada." },
  { q: "What is his current role?", a: "Full Stack Developer at BioAro Inc in Calgary since November 2025, working on BioEMR, client websites and the Neyu AI health companion.", href: "/identity" },
  { q: "Has he worked with sensitive data?", a: "Yes. BioEMR involved HL7 configuration, HIPAA compliance and integrations with Netcare and Connect Care. NEYU documents role-based access, break-glass access, audit logging and encrypted files.", href: "/projects/neyu" },
  { q: "How does he make AI safe?", a: "Rules run before the model, answers are validated against real data, every feature has a fallback, and diagnosis or medication advice is blocked in clinical settings.", href: "/ai" },
  { q: "Where did he study?", a: "Software Development Diploma at the Southern Alberta Institute of Technology (SAIT), Calgary, completed August 2025.", href: "/foundation" },
  { q: "Can I see the code?", a: "Yes. Every project world links to its public repository, with a file structure and code excerpts.", href: "/projects" },
  { q: "How do I start a project with him?", a: "Use the Collaborate space: NOVA turns your idea into a short brief and sends it. Or email arsh.016vs@gmail.com.", href: "/collab" },
];

/** Live sites that can be opened in a window on this site (if the site allows framing). */
export const liveSites: { id: string; name: string; url: string; kind: string; src: string; project?: string }[] = [
  { id: "neyu", name: "NEYU Health", url: "https://neyuhealth.com", kind: "AI health platform", src: "GitHub: Neyu-AI", project: "neyu" },
  { id: "summit", name: "Precision Health & Longevity Summit", url: "https://precisionlongevitysummit.com", kind: "Event website", src: "Resume" },
  { id: "nea", name: "NEA Medical Aesthetics", url: "https://neamedaesthetics.com", kind: "Clinic website", src: "Resume" },
];
