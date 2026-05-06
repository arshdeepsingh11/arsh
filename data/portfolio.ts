// ============================================================
//  PORTFOLIO DATA — Edit all content from this single file
//  No need to touch any JSX/TSX files for content changes
// ============================================================

export const siteConfig = {
  name: "Arshdeep Singh",
  initials: "AS",
  brandName: "ARSH", // nav logo first half
  brandAccent: "DEEP", // nav logo second half (coloured)
  tagline: "Software Developer · QA Automation · Web Designer",
  location: "Calgary, AB, Canada",
  available: true, // controls the green "available" badge
  availableText: "Available for Dev, QA & Web Design Roles · Calgary, AB",
  email: "arshthakur2002@gmail.com",
  phone: "(587) 837-3117",
  github: "https://github.com/arshdeepsingh11",
  githubHandle: "arshdeepsingh11",
  linkedin: "https://linkedin.com/in/arshdeep-singh-software",
  linkedinHandle: "arshdeep-singh-software",
  summary:
    "Results-driven Software Developer, QA Automation Engineer and Web Designer with hands-on experience shipping full-stack applications, mobile apps, healthcare EMR integrations (HL7 v2.x), and live client websites for BioAro. Proven track record reducing production defects by 20% and cutting manual testing effort by 30% through automation.",
  heroDescription:
    "Building robust systems at the intersection of full-stack development, web design, and quality engineering. Specializing in HL7 healthcare integrations, client website delivery, mobile apps, and CI/CD-driven pipelines.",
};

// ── STATS (shown on hero) ──────────────────────────────────
export const stats = [
  { number: "20%", label: "Defect Reduction" },
  { number: "30%", label: "Testing Time Saved" },
  { number: "4+", label: "Client Sites Shipped" },
  { number: "3+", label: "Years Experience" },
];

// ── SKILLS ────────────────────────────────────────────────
export const skills = [
  {
    category: "Languages",
    accent: "blue",
    items: ["Java", "Python", "JavaScript", "TypeScript", "C", "C++", "SQL"],
  },
  {
    category: "Frameworks & UI",
    accent: "violet",
    items: ["React", "Next.js", "React Native", "Expo", "Node.js", "Express.js", "WordPress", "Elementor"],
  },
  {
    category: "QA & Testing",
    accent: "cyan",
    items: ["HL7 v2.x", "Postman", "Jira", "API Testing", "Manual Testing", "Agile", "SDLC"],
  },
  {
    category: "DevOps, Cloud & Databases",
    accent: "blue",
    items: ["Docker", "Kubernetes", "CI/CD", "Supabase", "PostgreSQL", "MongoDB", "Linux", "Git/GitHub"],
  },
];

// ── EXPERIENCE ────────────────────────────────────────────
export const experience = [
  {
    id: "bioaro",
    role: "Software Tester, Junior Developer & Web Designer",
    company: "BioAro Healthcare EMR",
    location: "Calgary, AB",
    period: "Sep 2025 – Present",
    accentColor: "cyan",
    bullets: [
      "Reduced production defects by 20% through comprehensive functional, integration, and regression testing",
      "Validated HL7 v2.x healthcare integrations, improving data accuracy and reducing interface errors",
      "Built JavaScript and Python automation scripts, cutting manual testing effort by 30%",
      "Designed, developed and shipped 4+ client-facing websites for BioAro's healthcare and partner clients (cardiology, longevity, aesthetics, wealth) using WordPress, Elementor and custom UI work",
      "Translated client briefs into responsive, branded, SEO-aware websites with booking, registration and content management features",
      "Collaborated in Agile ceremonies and release cycles, improving on-time delivery of software releases",
    ],
  },
  {
    id: "visionaries",
    role: "Business Intelligence & Web Developer",
    company: "Visionaries Tech Solutions",
    location: "Amritsar, India",
    period: "Mar 2024 – Feb 2025",
    accentColor: "blue",
    bullets: [
      "Developed responsive React and Next.js web applications, improving client user engagement",
      "Built BI dashboards that significantly reduced reporting time for multiple clients",
      "Integrated PostgreSQL and MongoDB with cloud services, improving application uptime",
      "Translated business requirements into scalable technical deliverables",
    ],
  },
  {
    id: "codebrew",
    role: "Technical Analyst",
    company: "Code Brew Labs",
    location: "Chandigarh, India",
    period: "Jan 2023 – Nov 2023",
    accentColor: "violet",
    bullets: [
      "Developed and tested REST APIs using Postman, achieving 95%+ successful integration rates",
      "Optimized API performance, reducing latency and improving throughput",
      "Assisted with Docker and CI/CD deployments in an Agile development environment",
    ],
  },
];

// ── EDUCATION ─────────────────────────────────────────────
export const education = {
  degree: "Diploma in Software Development",
  institution: "Southern Alberta Institute of Technology (SAIT)",
  location: "Calgary, AB",
  graduated: "Aug 2025",
};

// ── CERTIFICATIONS ────────────────────────────────────────
export const certifications = [
  { name: "Advanced Java", issuer: "Shinewave" },
  { name: "Web Development", issuer: "IGEN" },
  { name: "C++ & C", issuer: "Shinewave" },
];

// ── PROJECTS / CASE STUDIES ───────────────────────────────
// slug is used in the URL: /case-studies/[slug]
export const projects = [
  {
    slug: "imr-movie-portal",
    title: "IMR Movie Portal",
    label: "Full Stack · React",
    shortDesc:
      "Full-stack movie discovery platform with role-based access control, movie API integration, and MongoDB-backed data layer.",
    stack: ["React", "Node.js", "Express.js", "MongoDB", "REST API", "JWT Auth"],
    context: "Personal Project built during SAIT Software Development diploma.",
    problem:
      "Needed a full-stack platform that demonstrates role-based access control, third-party API integration, and modern UI — showcasing end-to-end engineering competence.",
    goal: "Build a production-quality movie portal with distinct user roles (admin vs viewer), secure auth flows, and a responsive dashboard-style UI.",
    approach:
      "Designed a React frontend with component-based architecture and Node.js backend with Express REST API. Used MongoDB for flexible document storage of movie data and user profiles.",
    execution:
      "Implemented JWT-based authentication, integrated a public movie API for data, and built an admin panel for content management. Deployed with CI/CD automation.",
    metrics: [
      { number: "100%", label: "Role-based access" },
      { number: "3", label: "User roles implemented" },
      { number: "<200ms", label: "Avg API response" },
    ],
    learnings:
      "Learned to design scalable component hierarchies and the importance of separating business logic from UI. MongoDB document modeling for nested data was a key challenge resolved through schema design.",
    github: "https://github.com/arshdeepsingh11",
  },
  {
    slug: "secure-auth-system",
    title: "Secure Auth System",
    label: "Security · DevOps",
    shortDesc:
      "Enterprise-grade authentication system with multi-factor authentication support. Fully Dockerized with automated CI/CD pipeline.",
    stack: ["Node.js", "Express.js", "Docker", "GitHub Actions", "bcrypt", "TOTP/MFA"],
    context: "Personal project to demonstrate enterprise security engineering and DevOps capabilities.",
    problem:
      "Standard authentication implementations are often insecure or fragile. The goal was to engineer a production-hardened auth system with MFA, containerization, and automated deployment.",
    goal: "Build an authentication service that supports multi-factor authentication, is fully containerized, and has an automated deployment pipeline.",
    approach:
      "Node.js/Express backend with MFA using TOTP (time-based one-time passwords). Dockerized the entire application with multi-stage builds for production optimization.",
    execution:
      "Implemented session management, password hashing with bcrypt, TOTP-based MFA, and rate limiting. Set up GitHub Actions CI/CD pipeline with Docker Compose for orchestration.",
    metrics: [
      { number: "MFA", label: "Multi-factor auth" },
      { number: "0", label: "Known vulnerabilities" },
      { number: "Auto", label: "CI/CD deployment" },
    ],
    learnings:
      "Deep understanding of authentication security patterns. Learned Docker multi-stage builds for image size optimization and the value of secrets management in containerized environments.",
    github: "https://github.com/arshdeepsingh11",
  },
  {
    slug: "hl7-emr-integration",
    title: "HL7 EMR Integration",
    label: "Healthcare · QA",
    shortDesc:
      "Healthcare data pipeline validating HL7 v2.x messages for BioAro's EMR system. Reduced interface errors and ensured data accuracy.",
    stack: ["HL7 v2.x", "Python", "JavaScript", "Postman", "Jira", "Agile", "CI/CD"],
    context: "Professional work at BioAro Healthcare EMR, Calgary. Current role since Sep 2025.",
    problem:
      "Healthcare data integration between EMR systems is error-prone and high-stakes. Manual testing of HL7 v2.x messages was slow, inconsistent, and leaving interface errors undetected until production.",
    goal: "Reduce production defects and manual testing overhead while ensuring 100% data accuracy in HL7 healthcare message processing.",
    approach:
      "Designed automation scripts in JavaScript and Python to validate HL7 v2.x message structures, field mappings, and data transformations. Integrated into the CI pipeline for continuous validation.",
    execution:
      "Built a test suite covering functional, integration, and regression testing. Created HL7 message parsers, validation rules, and automated regression reports. Participated in Agile ceremonies.",
    metrics: [
      { number: "20%", label: "Defects reduced" },
      { number: "30%", label: "Manual effort saved" },
      { number: "100%", label: "Data accuracy target" },
    ],
    learnings:
      "Gained rare expertise in medical data standards. In healthcare software, the cost of a bug is measured in patient safety — which fundamentally changes your approach to quality engineering.",
    github: "https://github.com/arshdeepsingh11",
  },
  {
    slug: "bi-dashboard-platform",
    title: "BI Dashboard Platform",
    label: "BI · Frontend",
    shortDesc:
      "Business intelligence dashboards for multiple clients, significantly reducing reporting time. Cloud-integrated with PostgreSQL and MongoDB.",
    stack: ["React", "Next.js", "PostgreSQL", "MongoDB", "Cloud Services", "REST APIs"],
    context: "Professional work at Visionaries Tech Solutions, Amritsar, India. Mar 2024 – Feb 2025.",
    problem:
      "Multiple clients had slow, manual reporting processes using spreadsheets. Business stakeholders lacked real-time visibility into key metrics, causing delayed decisions.",
    goal: "Deliver interactive BI dashboards that reduce reporting time and provide self-service analytics to non-technical stakeholders.",
    approach:
      "Built React/Next.js frontend with data visualization components connected to PostgreSQL and MongoDB backends. Used cloud services for scalability and uptime guarantees.",
    execution:
      "Developed reusable chart components, implemented data aggregation pipelines, and deployed on cloud infrastructure. Translated business requirements directly into technical deliverables for each client.",
    metrics: [
      { number: "↓ Sig.", label: "Reporting time" },
      { number: "↑", label: "User engagement" },
      { number: "99%+", label: "Uptime target" },
    ],
    learnings:
      "Learned to bridge the gap between business stakeholders and technical teams. Translating vague business goals into concrete technical deliverables is a skill as valuable as writing code.",
    github: "https://github.com/arshdeepsingh11",
  },
  // ── NEW: YEG-YYC Mobile App ─────────────────────────────
  {
    slug: "yeg-yyc-mobile-app",
    title: "YEG-YYC Mobile App",
    label: "Mobile · React Native",
    shortDesc:
      "React Native (Expo) mobile app with regex-based authentication, JSON credential validation, tab navigation, and an interactive Calgary & Edmonton city guide.",
    stack: ["React Native", "Expo", "TypeScript", "JavaScript", "JSON"],
    context:
      "Mobile Development course project at SAIT, built collaboratively as part of a team of four (Arshdeep, Sneha, Shubham, Parth).",
    problem:
      "Course project needed to demonstrate authentication, input validation, navigation, and reusable component patterns in a single mobile experience — without leaning on a backend.",
    goal: "Ship a polished, multi-screen mobile app that handles user auth locally, validates input via regex, and presents an interactive city guide with reusable components.",
    approach:
      "Built with React Native + Expo. Stored credentials in a local credentials.json file, applied regex rules for username (>=5 chars) and password (uppercase, lowercase, digit, special char, >=8 chars). Modularised the city pages using props-driven components for links and info blocks.",
    execution:
      "Implemented sign-in with alert-based error handling, then routed authenticated users to a tabbed welcome screen. Calgary and Edmonton tabs each show a city image, official city link, and styled info — all rendered through shared, prop-driven components.",
    metrics: [
      { number: "2", label: "City guides" },
      { number: "Regex", label: "Auth validation" },
      { number: "Expo", label: "Cross-platform" },
    ],
    learnings:
      "Learned to think in terms of reusable, prop-driven mobile components and how navigation state interacts with auth flows. Reinforced regex fundamentals for production-quality input validation.",
    github: "https://github.com/arshdeepsingh11/YEG-YYC-MobileApp",
  },
  // ── NEW: Student Hub ────────────────────────────────────
  {
    slug: "student-hub",
    title: "Student Hub",
    label: "Web App · Next.js",
    shortDesc:
      "Next.js single-page student portal for New Generation High School — admins can view, add and manage student records with validation and a mock API layer.",
    stack: ["Next.js", "React", "JavaScript", "CSS", "Mock API"],
    context:
      "Team project (Gyanit, Sahilpreet, Arshdeep, Sneha) building a school administration tool as a single-page Next.js application.",
    problem:
      "The school needed a clean, single-page interface for administrators to view and modify student records — without the friction of a heavy CMS or hand-coded HTML.",
    goal: "Deliver a Next.js SPA with a navbar, student list, add-student form with validation, and a school-info footer — all backed by a mock API.",
    approach:
      "Used Next.js App Router with reusable components for the navbar, student list rows, the add-student form, and the footer. Wired forms to a mock API route to simulate persistence and validate data shape end-to-end.",
    execution:
      "Implemented client-side validation on the add-student form, dynamic rendering of the student list from API data, and a responsive layout that works on both classroom desktops and admin tablets.",
    metrics: [
      { number: "1-page", label: "SPA architecture" },
      { number: "API", label: "Mock route layer" },
      { number: "4", label: "Team contributors" },
    ],
    learnings:
      "Gained practical experience with Next.js routing and API routes, plus the team-coordination side of shipping a small product — splitting components, agreeing on data contracts, and merging cleanly.",
    github: "https://github.com/arshdeepsingh11/Student-Hub",
  },
  // ── NEW: Secure Auth App (Supabase + Expo) ──────────────
  {
    slug: "secure-auth-app",
    title: "Secure Auth App (Supabase + Expo)",
    label: "Mobile · Auth · Cloud",
    shortDesc:
      "Mobile authentication app using Supabase for backend and Expo (React Native) for the frontend — sign-up, login, logout, profile CRUD, and Row Level Security.",
    stack: ["React Native", "Expo", "Supabase", "PostgreSQL", "TypeScript", "Auth"],
    context:
      "Team project (Parth, Arshdeep, Shubh) demonstrating production-style authentication and access control on mobile using a managed cloud backend.",
    problem:
      "Needed a mobile auth app that doesn't just check credentials, but enforces real data privacy at the database layer — so a logged-in user can only ever see and modify their own records.",
    goal: "Ship a working Expo app with email/password auth, profile CRUD, persistent sessions, and Row Level Security (RLS) policies in Supabase that prevent cross-user data leaks.",
    approach:
      "Used Supabase Auth for email/password flows and PostgreSQL with RLS policies on the user_details table (UUID, name, email). Wired the Expo client to react to auth state changes for auto-redirect on login and logout.",
    execution:
      "Implemented sign-up, login, logout, and full CRUD on user details. Configured RLS so each row is only readable/writable by its owning UUID. Handled session persistence and conditional navigation based on auth state.",
    metrics: [
      { number: "RLS", label: "Row-level security" },
      { number: "CRUD", label: "Full profile ops" },
      { number: "Cloud", label: "Supabase backend" },
    ],
    learnings:
      "Real understanding that authentication and authorization are different problems — auth gets the user in, RLS decides what they can touch. Also a first taste of treating a managed backend (Supabase) as critical infrastructure rather than a black box.",
    github: "https://github.com/arshdeepsingh11/Secure-Auth-App",
  },
];

// ── CLIENT WEBSITES (BioAro) ──────────────────────────────
// Live websites designed and developed for BioAro's clients
export const clientSites = [
  {
    name: "Precision Health & Longevity Summit",
    url: "https://precisionlongevitysummit.com/",
    domain: "precisionlongevitysummit.com",
    role: "Web Designer & Developer",
    year: "2025–2026",
    accent: "violet",
    description:
      "Event website for the Precision Health & Longevity Summit 2026 (Calgary, April 25–26), presented in collaboration with the DIL Walk Foundation. Brings together global leaders in science, AI, biotech, and health systems to shape the future of healthy aging.",
    features: [
      "Speaker profiles & dynamic agenda viewer",
      "Sponsorship, registration & Stripe-based donations",
      "Innovation tracks (AI & predictive health, longevity science, biotech, global health, healthspan)",
      "Responsive WordPress + Elementor build with custom branding",
    ],
    tags: ["WordPress", "Elementor", "Events", "Healthcare"],
  },
  {
    name: "Kapoor Wealth Partners",
    url: "https://kapoorwealth.com/",
    domain: "kapoorwealth.com",
    role: "Web Designer & Developer",
    year: "2025",
    accent: "blue",
    description:
      "Multi-jurisdictional private advisory and investment platform website covering wealth management, legal structuring, and regulated co-investment vehicles across Abu Dhabi, Canada, Dubai and Mumbai. Positions KWP for family offices, institutional allocators, and sovereign clients.",
    features: [
      "Premium, finance-grade visual identity and typography",
      "Service, team, investment, and whitepaper sections",
      "Multi-office presence and contact flows",
      "Editorial blog with categorised content",
    ],
    tags: ["WordPress", "Elementor", "Finance", "Branding"],
  },
  {
    name: "NEA Medical Aesthetics",
    url: "https://neamedaesthetics.com/",
    domain: "neamedaesthetics.com",
    role: "Web Designer & Developer",
    year: "2025",
    accent: "cyan",
    description:
      "Website for NEA Medical Aesthetic Clinic — a physician-managed skincare and laser treatment clinic in Calgary's NE. Showcases minimally invasive treatments, Fotona Laser services, and an online product shop while reinforcing the clinic's clinical, science-led brand.",
    features: [
      "Treatment catalogue (Fotona Laser, men's services, etc.)",
      "Appointment booking pop-up integration",
      "E-commerce shop for skincare products",
      "Hero slider, blog and contact module",
    ],
    tags: ["WordPress", "E-Commerce", "Healthcare", "Booking"],
  },
  {
    name: "Advanced Cardiology & Diagnostics",
    url: "https://advancedcardiology.ca/",
    domain: "advancedcardiology.ca",
    role: "Web Designer & Developer",
    year: "2025",
    accent: "violet",
    description:
      "Patient-facing website for Advanced Cardiology & Diagnostics, a Calgary cardiology practice offering cardiac consultations, internal medicine, endocrinology, heart-failure clinics, and clinical trials. Designed to be accessible to patients while supporting referral workflows for physicians.",
    features: [
      "Services, physician profiles & clinical trial information",
      "Patient education hub (cardiac symptoms, procedures, FAQ)",
      "Online appointment booking and physician referral form",
      "Careers portal for clinical and allied health roles",
    ],
    tags: ["WordPress", "Healthcare", "Patient Portal", "Referrals"],
  },
];

// ── ABOUT ─────────────────────────────────────────────────
export const about = {
  paragraphs: [
    "I'm Arshdeep Singh — a Software Developer, QA Automation Engineer and Web Designer based in Calgary, AB. I graduated from SAIT's Software Development program in August 2025 and currently work at BioAro, where I split my time between healthcare EMR testing, automation, and shipping live client websites.",
    "My work sits at a rare intersection: I write production code, design and build the websites that represent real businesses, AND engineer the systems that validate it all. This three-way perspective — developer, designer, tester — makes me a stronger engineer overall.",
    "On the healthcare side, I've operated in HL7 v2.x EMR integrations — one of software's most demanding domains, where data accuracy isn't a nice-to-have, it's critical infrastructure. On the design side, I've shipped 4+ live websites for BioAro's clients across cardiology, longevity science, medical aesthetics, and private wealth.",
    "I'm actively seeking roles in QA Automation, Junior / Full-Stack Development, or Web Design & Development where I can keep building impactful, well-tested, beautifully delivered systems.",
  ],
  focusAreas: [
    "Full-Stack Web Development (React / Next.js)",
    "Web Design & Client Site Delivery (WordPress / Elementor)",
    "QA Automation & Test Engineering",
    "Healthcare EMR & HL7 Integrations",
    "Mobile App Development (React Native / Expo)",
    "API Design, Cloud & CI/CD Pipelines",
  ],
  futureGoals: [
    "AI-Augmented Full-Stack Engineer",
    "Cloud Architect (AWS / Azure / GCP)",
    "AI / ML Integration in Healthcare Systems",
    "Building Agentic & LLM-Powered Web Apps",
    "Senior QA Automation Engineer",
    "Contributing to Open Source & Web3 / Future-Web",
  ],
};
