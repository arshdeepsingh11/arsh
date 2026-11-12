/**
 * Verified content inventory. Every fact traces to one of:
 *  - the résumé (Resume), a repository README or source file (GitHub: <repo>),
 *  - the scanned certificates, or SAIT's official program page.
 * Repository facts are a dated snapshot; live metadata is merged in by src/lib/server/github.ts.
 */

export type Profile = { name: string; line: string; city: string; email: string; phone: string; github: string; linkedin: string; portfolio: string; summary: string };
export type Experience = { id: string; role: string; org: string; place: string; period: string; src: string; bullets: string[]; tech: string[]; projects: string[] };
export type FieldMove = { k: string; t: string; e: string };
export type Principle = { t: string; d: string; p: string };
export type ArchNode = [id: string, label: string, col: number, row: number];
export type Architecture = { nodes: ArchNode[]; edges: [string, string][]; notes: Record<string, string> };
export type ProjectCategory = "AI" | "Web" | "Mobile" | "Developer tools" | "Experiments" | "Other";
export type DemoId = "neyu" | "haru" | "secure" | "yeg" | "student" | "convert" | "calc" | "movies" | "shifts" | "feed" | "patina" | "market";
export type Project = {
  slug: string; name: string; cat: ProjectCategory; kind: string; updated: string; repo: string; live?: string; hue: number;
  tag: string; stack: string[]; facts: string[]; contribution?: string; contribSrc?: string; team?: string; note?: string;
  arch: Architecture; tree: string[]; code?: { file: string; text: string }; demo?: DemoId;
};
export type ClientSite = { name: string; url: string; d: string };
export type Education = { school: string; short: string; program: string; credential: string; place: string; completed: string; url: string; programUrl: string; official: string[]; areas: { k: string; d: string; ev: string[] }[] };
export type Certificate = { id: string; title: string; issuer: string; detail: string; issued: string; ref: string; tone: [string, string]; redacted?: boolean };

export const SNAPSHOT_DATE = "11 November 2026";

export const me: Profile = {
  name: 'Arshdeep Singh', line: 'Software Developer · AI & Intelligent Systems · Digital Product Engineering', city: 'Calgary, Alberta, Canada',
  email: 'arsh.016vs@gmail.com', phone: '+1 587-837-3117', github: 'https://github.com/arshdeepsingh11', linkedin: 'https://www.linkedin.com/in/arshdeep-singh-software/', portfolio: 'https://arshdeepsingh-portfolio.vercel.app',
  summary: 'Full-stack developer who ships production React, Next.js and Node.js applications, including AI-enabled healthcare software. Works directly with clinic and client teams, from the first requirement through integration, safety checks and release.'
};
export const experience: Experience[] = [
  { id: 'bioaro', role: 'Full Stack Developer', org: 'BioAro Inc', place: 'Calgary, AB', period: 'November 2025 – Present', src: 'Resume',
    bullets: [
      'Led development on BioEMR, a new Electronic Medical Record platform with AI-powered functionality, HL7 configuration, HIPAA compliance and integrations with Netcare and Connect Care; worked with the team on architecture, backend services, frontend modules and end-to-end integration testing.',
      'Designed and shipped 6+ live client websites across healthcare, longevity, aesthetics and finance using WordPress, Elementor, React and Next.js, with booking and registration flows.',
      'Built Neyu, an AI health companion (Next.js, TypeScript, Prisma, Gemini API) for a Calgary cardiology clinic. It answers patient questions from labs, reports, wearables, food logs and check-ins and always shows supporting evidence. Also built an AI document reader that turns uploaded or scanned medical reports into structured lab values and plain-language summaries.',
      'Designed a health insights engine that tracks longitudinal patient data, detects threshold-based changes, rates evidence strength and optimizes AI cost; implemented AI safety guardrails (emergency detection, answer validation against real data, blocking diagnosis and medication advice) and doctor summary PDFs.',
      'Reduced production defects by 20% through functional, integration and regression testing on the EMR platform; built JavaScript and Python automation scripts that cut manual testing effort by 30% and run in CI.'
    ], tech: ['Next.js', 'TypeScript', 'React', 'Prisma', 'Gemini API', 'PostgreSQL', 'WordPress', 'Python', 'CI/CD', 'HL7'], projects: ['neyu', 'nea', 'biongevity', 'bioaro-drugs', 'overeo'] },
  { id: 'visionaries', role: 'Full Stack Developer', org: 'Visionaries Tech Solutions LLP', place: 'Amritsar, India', period: 'August 2022 – October 2023', src: 'Resume',
    bullets: [
      'Developed and maintained responsive full-stack applications using React, Next.js, Node.js, Express and REST APIs.',
      'Built Business Intelligence dashboards and integrated PostgreSQL and MongoDB with cloud services, reducing reporting time and improving uptime.',
      'Applied testing, code reviews, source control, CI/CD and secure development across the SDLC in Agile teams.',
      'Translated business requirements into technical deliverables across frontend, backend, databases and cloud, working with cross-functional stakeholders.',
      'Supported backlog refinement, effort estimation and clear communication to technical and non-technical audiences.'
    ], tech: ['React', 'Next.js', 'Node.js', 'Express', 'REST APIs', 'PostgreSQL', 'MongoDB', 'CI/CD'], projects: [] }
];
export const skills: Record<string, string[]> = {
  'Languages': ['JavaScript', 'TypeScript', 'Java', 'Python', 'SQL', 'HTML5', 'CSS3', 'C', 'C++'],
  'Frontend': ['React', 'Next.js', 'React Native', 'Expo', 'Tailwind CSS', 'WordPress', 'Elementor'],
  'Backend & APIs': ['Node.js', 'Express', 'REST APIs', 'JWT Authentication', 'Prisma', 'Supabase', 'Spring (basic)'],
  'Databases': ['PostgreSQL', 'MongoDB', 'Supabase (Postgres + RLS)'],
  'AI': ['Gemini API', 'AI document processing', 'AI safety guardrails', 'Responsible AI practices', 'Prompt engineering'],
  'DevOps & Cloud': ['Docker', 'Kubernetes', 'GitHub Actions', 'CI/CD', 'Vercel', 'Linux', 'Git'],
  'Practices': ['Postman', 'Jira', 'Agile / Scrum', 'SDLC', 'Code reviews', 'REST API testing', 'HL7', 'HIPAA']
};
/** The loop that shows up across the record: evidence for each stage is a resume line or a repository. */
export const fieldLoop: FieldMove[] = [
  { k: 'Listen', t: 'Sit with the people who will use it', e: 'Translated business requirements into technical deliverables with cross-functional stakeholders (Visionaries). Client briefs turned into live sites (BioAro).' },
  { k: 'Prototype', t: 'Put something real in front of them fast', e: 'Overeo ships as a working prototype on synthetic data; Le Sac Doré runs with zero setup on an embedded Postgres.' },
  { k: 'Integrate', t: 'Connect it to the systems already there', e: 'HL7, Netcare and Connect Care on BioEMR; Shopify, Supabase, wearable APIs and Gemini across the repositories.' },
  { k: 'Guard', t: 'Make the AI safe before it is clever', e: 'Neyu runs fixed emergency rules before any model call, validates answers against real data and falls back to rules when the model is slow.' },
  { k: 'Ship', t: 'Release it and keep it releasable', e: 'Docker, GitHub Actions, CI/CD and Vercel; automation scripts integrated into CI pipelines.' },
  { k: 'Stay', t: 'Own the result after launch', e: 'Regression testing on the EMR platform reduced production defects by 20% and cut manual testing effort by 30%.' }
];
export const principles: Principle[] = [
  { t: 'Evidence before answers', d: 'Neyu shows the supporting evidence with every answer and labels AI readings as AI.', p: 'neyu' },
  { t: 'The model never does the arithmetic', d: 'In HARU, deterministic code computes every financial number; the AI only calls validated tools.', p: 'haru' },
  { t: 'Rules run before the model', d: 'Emergency language is caught by fixed rules before any AI call, and those rules cannot be switched off.', p: 'neyu' },
  { t: 'Always have a fallback', d: 'Every Neyu AI feature has a rules-based answer for when the AI service is slow or unavailable.', p: 'neyu' }
];

const P = (o: Project): Project => o;
export const projects: Project[] = [
  P({ slug: 'neyu', name: 'NEYU Health', cat: 'AI', kind: 'AI health platform', updated: '2026-10-21', repo: 'Neyu-AI', live: 'https://neyuhealth.com', hue: 172,
    tag: 'An AI-enabled health platform for cardiology, prevention and longevity.',
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL 16', 'Prisma', 'Redis', 'BullMQ', 'Gemini', 'Capacitor'],
    facts: ['22 AI features on Google Gemini: 15 public website tools and 7 inside the patient record', 'Every AI feature has the same safety layers and a rules-based fallback', 'Fixed emergency keyword rules run before the AI and again on the server', '62 database tables across eight versioned migrations', 'README reports 608 automated checks passing, plus accessibility and load tests', 'Website of 58 pages, a 12-screen patient space, an operations console and a phone app'],
    contribution: 'From the resume: built Neyu, the AI health companion, and the AI document reader; designed the health insights engine and the AI safety guardrails.', contribSrc: 'Resume',
    note: 'The repository ANRAHealth-New holds the same codebase under its earlier name.',
    arch: { nodes: [['clients', 'Patients · Staff · Visitors', 0, 1], ['nginx', 'Nginx · HTTPS · rate guard', 1, 1], ['app', 'Next.js app (PM2 cluster)', 2, 1], ['rbac', 'Roles + break-glass', 3, 0], ['db', 'PostgreSQL 16', 4, 0], ['redis', 'Redis', 3, 2], ['worker', 'Background worker (BullMQ)', 4, 2], ['files', 'Encrypted files', 5, 2], ['ext', 'Gemini · email · push · wearables', 3, 1], ['audit', 'Audit log', 4, 1]], edges: [['clients', 'nginx'], ['nginx', 'app'], ['app', 'rbac'], ['rbac', 'db'], ['app', 'redis'], ['redis', 'worker'], ['worker', 'db'], ['worker', 'files'], ['app', 'ext'], ['rbac', 'audit']],
      notes: { rbac: 'Every access decision is written to the audit log.', worker: 'Hourly wearable sync, daily briefs, reminders; privacy sweeps run deletions when the 30-day hold ends.', ext: 'If Gemini is slow or unavailable, a rules-based answer is returned instead.' } },
    tree: ['backend/ (58 files)', 'src/components/ (portal, admin, neyu, home)', 'src/lib/emergencyDetection.ts', 'src/lib/portal/', 'src/data/', 'mobile/ (Capacitor phone app)', 'prisma/'], demo: 'neyu' }),
  P({ slug: 'haru', name: 'HARU', cat: 'AI', kind: 'AI work-and-money assistant', updated: '2026-10-23', repo: 'Haru', hue: 38,
    tag: 'One AI command center and one adaptive dashboard over a single PostgreSQL database.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Supabase', 'postgres.js', 'Zod 4', 'Claude', 'Recharts', 'web-push'],
    facts: ['Every financial number is computed by deterministic code from stored records', 'The AI understands requests and calls authorised, validated tools; it never writes to the database directly', 'Guarantees live in the database: composite foreign keys, check constraints (a shift\'s gross must equal minutes × rate) and partial unique indexes', 'Provider abstraction with Anthropic and Gemini adapters', 'README lists 72 unit tests, 38 integration tests and 14 database integrity tests', 'Server-sent push notifications through a durable scheduler'],
    arch: { nodes: [['ui', 'Dashboard · Command center', 0, 1], ['agent', 'Agent loop', 1, 1], ['prov', 'Provider abstraction', 2, 0], ['tools', 'Validated tools (Zod)', 2, 1], ['svc', 'User-scoped services', 3, 1], ['domain', 'Pure payroll / time-zone logic', 3, 2], ['pg', 'PostgreSQL + RLS + constraints', 4, 1], ['push', 'Push scheduler', 4, 2]], edges: [['ui', 'agent'], ['agent', 'prov'], ['agent', 'tools'], ['tools', 'svc'], ['svc', 'domain'], ['svc', 'pg'], ['svc', 'push']], notes: { prov: 'src/lib/ai/provider.ts defines provider-neutral chat types; adapters exist for Anthropic and Gemini.', pg: 'Plain SQL migrations so the financial guarantees are visible and tested.', tools: 'The model can only act through these tools; inputs are validated before anything is stored.' } },
    tree: ['db/migrations/ (7 SQL migrations)', 'db/tests/integrity.sql', 'src/lib/ai/ (agent.ts, provider.ts, tools.ts, anthropic.ts, gemini.ts)', 'src/lib/domain/', 'src/lib/server/services/', 'src/lib/invest/', 'tests/'],
    code: { file: 'src/lib/ai/provider.ts', text: '// Provider-neutral chat types. Swap the model vendor by adding an adapter.\nexport interface ToolSpec {\n  name: string;\n  description: string;\n  inputSchema: Record<string, unknown>;\n}\n\nexport interface ChatResponse {\n  content: Block[];\n  stopReason: "end" | "tool_use" | "max_tokens" | "other";\n}\n\nexport interface ChatProvider {\n  readonly name: string;\n  chat(req: { system: string; messages: ChatMessage[]; tools: ToolSpec[]; maxTokens?: number }): Promise<ChatResponse>;\n}' }, demo: 'haru' }),
  P({ slug: 'le-sac-dore', name: 'Le Sac Doré', cat: 'Web', kind: 'Luxury commerce platform', updated: '2026-10-24', repo: 'Le-Sac-Dore', hue: 44,
    tag: 'A complete handbag boutique: storefront, accounts, Digital Passports, an AI concierge and an admin console.',
    stack: ['Next.js 16', 'TypeScript', 'Drizzle ORM', 'PGlite / Postgres', 'Zustand', 'Claude'],
    facts: ['Runs with no setup: an embedded Postgres (PGlite) is created on first start', 'Digital Passport: every bag gets a serial and QR page with artisan, materials, inspection and history', 'Le Concierge: streaming chat that recommends pieces as tappable cards, with an offline catalogue assistant when no model key is set', 'Admin console with first-party analytics, funnel, live visitors and CSV exports'],
    arch: { nodes: [['store', 'Storefront', 0, 0], ['acct', 'Accounts · Orders', 0, 2], ['app', 'Next.js App Router', 1, 1], ['conc', 'Le Concierge (AI)', 2, 0], ['db', 'Postgres / PGlite (Drizzle)', 2, 1], ['admin', 'Admin console + analytics', 2, 2], ['pass', 'Digital Passport + QR', 3, 1]], edges: [['store', 'app'], ['acct', 'app'], ['app', 'conc'], ['app', 'db'], ['app', 'admin'], ['db', 'pass']], notes: { conc: 'Uses Claude when a key is configured; otherwise an offline catalogue assistant answers.', pass: 'Shipping and repairs are appended to each bag\'s history automatically.' } },
    tree: ['src/app/ (product, journal, wishlist, admin)', 'src/components/ (features, admin, home, ui)', 'src/server/db/', 'src/lib/'] , demo: 'patina' }),
  P({ slug: 'overeo', name: 'OVEREO', cat: 'AI', kind: 'Precision-health prototype', updated: '2026-11-03', repo: 'Overeo', hue: 330,
    tag: 'A women\'s precision-health experience with an on-device assistant, Overeo SI.',
    stack: ['Next.js', 'TypeScript', 'React', 'Three.js', 'GSAP', 'd3-geo'],
    facts: ['Prototype: all personal data is synthetic and the models are illustrative, not clinical', 'Overeo SI answers on-device by default; a live model can be connected through an optional proxy', 'A platform of routes and tabs with a persistent app shell; tabs sync to the URL and support arrow keys and swipe', 'Ten specialties, a test navigator and self-check tools'],
    arch: { nodes: [['shell', 'Persistent app shell + dock', 0, 1], ['views', 'Route views with tabbed panels', 1, 1], ['si', 'Overeo SI (on-device)', 2, 0], ['proxy', 'Optional live-model proxy', 3, 0], ['fx', '3D + scroll motion', 2, 2], ['content', 'Specialties · tests content', 2, 1]], edges: [['shell', 'views'], ['views', 'si'], ['si', 'proxy'], ['views', 'fx'], ['views', 'content']], notes: { si: 'Works without any network model; the proxy is opt-in.' } },
    tree: ['src/app/', 'src/shell/', 'src/views/', 'src/si/', 'src/personal/', 'src/fx/', 'src/tools/'] }),
  P({ slug: 'biongevity', name: 'Biongevity', cat: 'Web', kind: 'Longevity platform site', updated: '2026-10-28', repo: 'Biongevity', hue: 30,
    tag: 'A static, AI-assisted site for a longevity clinic group, with grounded answers and Shopify checkout.',
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind 3.4', 'Capacitor', 'Shopify'],
    facts: ['Grounded answers: a site index is built at build time and an on-device BM25 retriever sends the top 3 passages to the assistant, which shows them as sources', 'No custom backend: checkout on Shopify, chat on a hosted AI endpoint, everything else static HTML', 'Four themes driven by CSS variables; a check fails the build on hard-coded colours', '14 departments, 47 lab tests and 30 static pages, per the README'],
    arch: { nodes: [['next', 'Static Next.js export', 0, 1], ['cdn', 'CDN / any host', 1, 0], ['cap', 'iOS · Android (Capacitor)', 1, 2], ['shop', 'Shopify checkout', 2, 0], ['ai', 'AI assistant endpoint', 2, 1], ['bm', 'On-device BM25 retriever', 1, 1], ['hook', 'Contact webhook', 2, 2]], edges: [['next', 'cdn'], ['next', 'cap'], ['cdn', 'shop'], ['next', 'bm'], ['bm', 'ai'], ['cdn', 'hook']], notes: { bm: 'lib/retrieve.ts ranks passages in the browser, so the assistant answers from the site\'s own content.' } },
    tree: ['src/data/ (29 files)', 'src/components/ai/', 'src/components/fx3d/', 'src/components/shop/', 'src/lib/retrieve.ts', 'scripts/'] }),
  P({ slug: 'nea', name: 'NEA Precision Skin', cat: 'Web', kind: 'Clinic website rebuild', updated: '2026-11-04', repo: 'NEA', hue: 14,
    tag: 'A clinic site rebuilt around four problem-based programs, with a 3D body explorer.',
    stack: ['Next.js 15', 'TypeScript', 'Three.js', 'GSAP', 'Lenis', 'Framer Motion'],
    facts: ['3D Body Explorer: click any region of a realistic or hologram body and face map', 'Four programs replace a 50-link menu; 29 treatments and 12 packages carried over in full', 'AI ask overlay and a live skin-scan flow in the component tree', 'Lead delivery through a configurable webhook'],
    note: 'The resume lists the earlier NEA Medical Aesthetics site (neamedaesthetics.com) as a shipped client website.',
    arch: { nodes: [['app', 'App Router routes', 0, 1], ['content', 'Typed content files', 1, 0], ['three', '3D viewers (Three.js)', 1, 1], ['ai', 'AI ask overlay', 1, 2], ['lead', 'Lead webhook', 2, 1]], edges: [['app', 'content'], ['app', 'three'], ['app', 'ai'], ['app', 'lead']], notes: { content: 'Prices, programs and offers live in src/content so the clinic can confirm them before launch.' } },
    tree: ['src/app/ (programs, treatments, body, packages, tests)', 'src/components/three/', 'src/components/ai/', 'src/components/scan/', 'src/components/sim/', 'src/content/'] }),
  P({ slug: 'bioaro-drugs', name: 'BioAro Drugs storefront', cat: 'Web', kind: 'Multi-market storefront', updated: '2026-07-10', repo: 'bioaro-drugs', hue: 205,
    tag: 'A Vite + React storefront with a market layer for the US, Canada and the UK.',
    stack: ['React 19', 'TypeScript', 'Vite', 'Shopify Storefront API', 'Docker'],
    facts: ['Region resolves in order: saved manual override, Geo-IP bootstrap, then browser language', 'Shopify product and cart integration with local preview fallbacks', 'Docker and Docker Compose setup; Vercel-ready SPA routing'],
    arch: { nodes: [['spa', 'React SPA', 0, 1], ['market', 'Market layer (US · CA · UK)', 1, 0], ['shop', 'Shopify Storefront API', 1, 1], ['cart', 'Cart', 2, 1], ['pages', 'Policy · protocol · FAQ pages', 1, 2]], edges: [['spa', 'market'], ['spa', 'shop'], ['shop', 'cart'], ['spa', 'pages']], notes: { market: 'US and CA share one experience region; GB maps to the UK region.' } },
    tree: ['src/pages/ (18 pages)', 'src/lib/market/', 'src/lib/shopify/', 'src/components/cart/', 'tests/'] , demo: 'market' }),
  P({ slug: 'trade-shift', name: 'Trade Shift', cat: 'Web', kind: 'Workforce scheduling app', updated: '2026-07-27', repo: 'trade-shift-app', hue: 220,
    tag: 'Role-based shift, pay and calendar app for employers, employees and platform admins.',
    stack: ['React', 'TypeScript', 'Vite', 'Supabase', 'React Router'],
    facts: ['Separate admin, employer and employee areas behind a protected route', 'Employee screens for shifts, pay, calendar and overview', 'Admin screens for companies, platform employees and an audit log', 'Sign-up, password reset and security-question flows'],
    arch: { nodes: [['auth', 'Auth + ProtectedRoute', 0, 1], ['emp', 'Employee area', 1, 0], ['er', 'Employer area', 1, 1], ['adm', 'Admin area + audit log', 1, 2], ['sb', 'Supabase', 2, 1]], edges: [['auth', 'emp'], ['auth', 'er'], ['auth', 'adm'], ['emp', 'sb'], ['er', 'sb'], ['adm', 'sb']], notes: {} },
    tree: ['src/pages/admin/', 'src/pages/auth/', 'src/pages/employee/', 'src/hooks/', 'src/lib/'] , demo: 'shifts' }),
  P({ slug: 'pops', name: 'POPS', cat: 'Experiments', kind: 'Social feed experiment', updated: '2025-09-30', repo: 'pops', hue: 280,
    tag: 'A mobile-style social client with a feed, composer, messages, alerts and search.',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'React Hook Form', 'Zod', 'Framer Motion'],
    facts: ['Feed, compose, messages, alerts, search and video routes', 'Bottom tabs, left drawer and theme toggle components', 'Supabase server-side auth; forms validated with Zod'],
    arch: { nodes: [['ui', 'Feed · Compose · Tabs', 0, 1], ['act', 'Server actions + API', 1, 1], ['sb', 'Supabase (SSR auth)', 2, 1]], edges: [['ui', 'act'], ['act', 'sb']], notes: {} },
    tree: ['src/app/ (dashboard, messages, alerts, search, video, login)', 'src/components/', 'src/lib/'] , demo: 'feed' }),
  P({ slug: 'secure-auth', name: 'Secure Auth App', cat: 'Mobile', kind: 'Mobile authentication app', updated: '2025-03-26', repo: 'Secure-Auth-App', hue: 150,
    tag: 'Expo app with email and password sign-in, profile CRUD and Row Level Security.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Supabase Auth', 'PostgreSQL RLS'],
    facts: ['Sign-up, login, logout with session redirect', 'Create, read, update and delete on a user_details table', 'Row Level Security restricts each user to their own row'],
    team: 'Team project: the README lists Parth, Arshdeep Singh and Shubh.',
    arch: { nodes: [['app', 'Expo Router screens', 0, 1], ['auth', 'Supabase Auth', 1, 0], ['tbl', 'user_details table', 1, 1], ['rls', 'Row Level Security', 2, 1]], edges: [['app', 'auth'], ['app', 'tbl'], ['tbl', 'rls']], notes: { rls: 'A signed-in user can only read and change the row that belongs to them.' } },
    tree: ['app/auth/sign-in.tsx', 'app/auth/sign-up.tsx', 'app/(tabs)/', 'supabaseClient.js', 'components/'], demo: 'secure' }),
  P({ slug: 'yeg-yyc', name: 'YEG-YYC Mobile App', cat: 'Mobile', kind: 'Mobile course project', updated: '2025-02-11', repo: 'YEG-YYC-MobileApp', hue: 195,
    tag: 'Expo app with a validated sign-in and a tabbed Calgary and Edmonton city guide.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Expo Router'],
    facts: ['Built for the Mobile Development course', 'Username needs at least 5 characters; the password is checked by one regular expression', 'Tab navigation after sign-in; city pages built from reusable prop-driven components'],
    arch: { nodes: [['signin', 'Sign-in + regex validation', 0, 1], ['tabs', 'Tab navigator', 1, 1], ['yyc', 'Calgary screen', 2, 0], ['yeg', 'Edmonton screen', 2, 2], ['cmp', 'Reusable city components', 3, 1]], edges: [['signin', 'tabs'], ['tabs', 'yyc'], ['tabs', 'yeg'], ['yyc', 'cmp'], ['yeg', 'cmp']], notes: {} },
    tree: ['app/auth/sign-in.tsx', 'app/(tabs)/calgary.tsx', 'app/(tabs)/edmonton.tsx', 'app/(tabs)/home.tsx', 'components/'],
    code: { file: 'app/auth/sign-in.tsx', text: 'const usernameValid = username.length >= 5;\nconst passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/.test(password);' }, demo: 'yeg' }),
  P({ slug: 'expo-calculator', name: 'Expo Calculator', cat: 'Mobile', kind: 'Mobile calculator', updated: '2025-04-15', repo: 'expo-calculator', hue: 250,
    tag: 'A calculator built with Expo, React Native and TypeScript.', stack: ['React Native', 'Expo', 'TypeScript', 'Expo Router', 'Jest'],
    facts: ['Four tabs: basic calculator, scientific (sin, cos, square root, degrees or radians), graphing with Plotly in a WebView, and history', 'Calculation history saved on the device with AsyncStorage', 'Light and dark themes through a React context', 'Expo Router navigation and Jest set up for unit tests'],
    arch: { nodes: [['tabs', 'Tab screens', 0, 1], ['ctx', 'Context state', 1, 1], ['cmp', 'Reusable components', 2, 1]], edges: [['tabs', 'ctx'], ['ctx', 'cmp']], notes: {} }, tree: ['app/(tabs)/', 'components/', 'context/', 'constants/'] , demo: 'calc' }),
  P({ slug: 'student-hub', name: 'Student Hub', cat: 'Web', kind: 'Student records portal', updated: '2025-03-01', repo: 'Student-Hub', hue: 120,
    tag: 'A single-page Next.js portal for viewing and adding student records.', stack: ['Next.js', 'JavaScript', 'Tailwind CSS'],
    facts: ['Student list, add-student form with validation, static navbar and footer', 'Mock data layer for student records'],
    team: 'Team project: the README lists Gyanit, Sahilpreet Singh, Arshdeep Singh and Sneha.',
    arch: { nodes: [['page', 'Single page', 0, 1], ['form', 'StudentForm + validation', 1, 0], ['list', 'StudentList', 1, 2], ['data', 'students.json', 2, 1]], edges: [['page', 'form'], ['page', 'list'], ['list', 'data'], ['form', 'list']], notes: {} },
    tree: ['my-app/app/components/StudentForm.jsx', 'my-app/app/components/StudentList.jsx', 'my-app/app/components/StudentInfo.jsx', 'my-app/public/students.json'], demo: 'student' }),
  P({ slug: 'imr', name: 'IMR Movie Portal', cat: 'Web', kind: 'Movie database portal', updated: '2025-04-01', repo: 'IMR-Movie-Portal', hue: 0,
    tag: 'A portal for managing a movie rental catalogue.', stack: ['Next.js', 'JavaScript', 'Prisma', 'MongoDB'],
    facts: ['Movie form and movie list components', 'API route and a Prisma schema'],
    arch: { nodes: [['ui', 'MovieForm · MovieList', 0, 1], ['api', 'app/api/route.js', 1, 1], ['pr', 'Prisma', 2, 1], ['db', 'MongoDB', 3, 1]], edges: [['ui', 'api'], ['api', 'pr'], ['pr', 'db']], notes: {} },
    tree: ['my-app/app/api/route.js', 'my-app/app/components/', 'my-app/prisma/schema.prisma'] , demo: 'movies' }),
  P({ slug: 'quickconvert', name: 'QuickConvert', cat: 'Other', kind: 'Unit converter', updated: '2025-02-06', repo: 'QuickConvert', hue: 85,
    tag: 'A small static site for metric and imperial conversions.', stack: ['HTML', 'JavaScript', 'Tailwind CSS'],
    facts: ['Weight, distance and temperature conversions', 'Accepts one value or a comma-separated list', 'Results rounded up to three decimal places'],
    team: 'Team project: the README lists Sahilpreet Singh, Gyanit Vasdev, Arshdeep Singh and Sneha.',
    arch: { nodes: [['form', 'Form', 0, 1], ['parse', 'parseInput()', 1, 1], ['conv', 'createConverter()', 2, 1], ['out', 'Rounded result', 3, 1]], edges: [['form', 'parse'], ['parse', 'conv'], ['conv', 'out']], notes: {} },
    tree: ['index.html', 'converter.js'],
    code: { file: 'converter.js', text: 'function createConverter(fromUnit, toUnit) {\n  const conversions = {\n    kg: { lb: v => v * 2.2046 },\n    lb: { kg: v => v / 2.2046 },\n    km: { mi: v => v / 1.60934 },\n    mi: { km: v => v * 1.60934 },\n    "°C": { "°F": v => (v * 9/5) + 32 },\n    "°F": { "°C": v => (v - 32) * 5/9 }\n  };\n  return conversions[fromUnit]?.[toUnit] || (() => "Invalid conversion");\n}' }, demo: 'convert' })
];
export const otherRepos: { repo: string; note: string }[] = [
  { repo: 'ANRAHealth-New', note: 'Same codebase as Neyu-AI under its earlier name.' },
  { repo: 'Amazon', note: 'Static multi-page HTML site (9 files). No README, so it is listed but not given its own world.' },
  { repo: 'tobh', note: 'Contains local folder paths rather than a project; looks like an accidental upload.' },
  { repo: 'WireWrench-Builder', note: 'Empty repository.' },
  { repo: 'arshdeepsingh11', note: 'Profile README.' }
];
export const clientSites: ClientSite[] = [
  { name: 'Precision Health & Longevity Summit', url: 'https://precisionlongevitysummit.com', d: 'Event site for the 2026 Calgary summit: speaker profiles, agenda, sponsorship and Stripe registration.' },
  { name: 'NEA Medical Aesthetics', url: 'https://neamedaesthetics.com', d: 'Calgary skincare clinic site: treatment catalogue, laser services, shop and booking.' }
];
export const education: Education = {
  school: 'Southern Alberta Institute of Technology', short: 'SAIT', program: 'Software Development', credential: 'Diploma', place: 'Calgary, Alberta, Canada', completed: 'August 2025',
  url: 'https://www.sait.ca/', programUrl: 'https://www.sait.ca/programs-and-courses/diplomas/software-development',
  official: ['Two-year diploma', '60 credits across 20 courses', 'School for Advanced Digital Technology', 'Main Campus, Calgary, or online'],
  areas: [
    { k: 'Full-stack development', d: 'Front-end and back-end work across web, mobile and desktop applications.', ev: ['student-hub', 'imr', 'yeg-yyc'] },
    { k: 'Software development lifecycle', d: 'Designing, modelling, testing and implementing software.', ev: ['expo-calculator'] },
    { k: 'Architecture and design patterns', d: 'Recognising and applying architectures, patterns, frameworks and emerging technologies.', ev: ['secure-auth'] },
    { k: 'Secure, user-centred solutions', d: 'Building secure software around real user requirements.', ev: ['secure-auth', 'yeg-yyc'] },
    { k: 'Platforms and cloud', d: 'Basics of development platforms, operating systems and cloud infrastructure.', ev: [] },
    { k: 'Troubleshooting', d: 'Diagnosing problems and implementing fixes.', ev: [] },
    { k: 'Stakeholder collaboration', d: 'Completing projects with stakeholders and solving problems to meet their needs.', ev: ['quickconvert', 'student-hub'] },
    { k: 'Professional practice', d: 'Business communication, ethics and professionalism.', ev: [] }
  ]
};
export const certificates: Certificate[] = [
  { id: 'c_java', title: 'Core Java', issuer: 'Shineway Software Solution', detail: '3-month course · September – November 2023', issued: '5 December 2023', ref: 'SSS/2023/CJ/1638', tone: ['#f6e3e3', '#e9f1ea'], redacted: true },
  { id: 'c_cpp', title: 'C and C++', issuer: 'Shineway Software Solution', detail: '3-month course · June – August 2023', issued: '8 September 2023', ref: 'SSS/2023/CC/1638', tone: ['#f6e3e3', '#e6eef5'], redacted: true },
  { id: 'c_web', title: 'Web Designing', issuer: 'IGEN Edutronics, Pathankot', detail: '4-month course · Certificate of Participation', issued: '23 March 2023', ref: 'CERT/2023/03/808', tone: ['#f3e7c4', '#eceff6'] },
  { id: 'c_basic', title: 'Basic of Computer', issuer: 'IGEN Edutronics, Pathankot', detail: '2-month course · Certificate of Participation', issued: '6 December 2022', ref: 'CERT/2022/12/778', tone: ['#f3e7c4', '#eef2ea'] }
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
