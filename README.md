# Arshdeep Singh — Developer Portfolio

A premium, futuristic developer portfolio built with **Next.js 14 (App Router)**, **React**, and **Tailwind CSS**. Features a dashboard-style glassmorphism UI with full case study deep dives.

## ✨ Features

- 🎨 **Glassmorphism design** — floating glass panels, soft blue/violet gradients
- 📱 **Fully responsive** — mobile-first, works on every device
- 🔍 **SEO optimized** — per-page metadata, OpenGraph tags
- 🧩 **Reusable components** — clean, scalable architecture
- 📝 **Single-file content editing** — edit everything from `data/portfolio.ts`
- 🚀 **Static generation** — case studies pre-rendered at build time
- ♿ **Accessible navigation** — active state highlighting, mobile drawer

## 📁 Project Structure

```
arshdeep-portfolio/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (navbar + footer + metadata)
│   ├── page.tsx                  # Home page (hero + stats + skills)
│   ├── work/page.tsx             # Project grid
│   ├── websites/page.tsx         # Live BioAro client websites
│   ├── case-studies/
│   │   ├── page.tsx              # All case studies index
│   │   └── [slug]/page.tsx       # Dynamic case study detail
│   ├── experience/page.tsx       # Career timeline
│   ├── about/page.tsx            # Bio + focus areas
│   └── contact/page.tsx          # Contact links + message form
├── components/                   # Reusable UI components
│   ├── Navbar.tsx                # Top navigation
│   ├── Footer.tsx                # Site footer
│   ├── GlassCard.tsx             # Glassmorphism card surface
│   ├── SectionHeader.tsx         # Section heading
│   ├── ProjectCard.tsx           # Project tile
│   └── StatCard.tsx              # Stat number cell
├── data/
│   └── portfolio.ts              # 👉 ALL CONTENT LIVES HERE
├── lib/
│   ├── types.ts                  # TypeScript types
│   └── helpers.ts                # Utility functions
├── styles/
│   └── globals.css               # Global Tailwind + custom CSS
├── tailwind.config.ts            # Tailwind tokens
├── tsconfig.json
├── next.config.js
└── package.json
```

## 🚀 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# → http://localhost:3000
```

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

## 🌐 Deploy to Vercel

The fastest way to deploy:

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Click **Deploy** (no environment variables needed)

That's it — your portfolio will be live in ~60 seconds at `your-name.vercel.app`.

### Or deploy via CLI:

```bash
npm install -g vercel
vercel
```

## ✏️ Editing Content

**All content** is in **one file**: `data/portfolio.ts`.

| What you want to change           | Section to edit         |
| --------------------------------- | ----------------------- |
| Name, tagline, bio, links         | `siteConfig`            |
| Hero stats                        | `stats`                 |
| Tech skills                       | `skills`                |
| Job history                       | `experience`            |
| Education / school                | `education`             |
| Certifications                    | `certifications`        |
| Projects + full case studies      | `projects`              |
| About paragraphs / goals          | `about`                 |

To **add a new case study**, simply add a new object to the `projects` array — the dynamic route `/case-studies/[slug]` will automatically pick it up. No JSX changes needed.

## 🎨 Design System

- **Background**: deep navy (`#060810`) with subtle radial blue/violet glow
- **Glass panels**: `rgba(255,255,255,0.04)` with 8% white border
- **Accents**: electric blue (`#4f8ef7`), violet (`#8b5cf6`), cyan (`#22d3ee`)
- **Fonts**: Space Grotesk (display) + JetBrains Mono (code/labels)
- **Hover states**: subtle lift (`-translate-y-0.5`) + border accent

## 📬 Contact Form

The contact form on `/contact` uses a **mailto** flow — when submitted, it opens the visitor's email client pre-filled with their message. No backend, no API keys, no spam concerns. To swap in a real service (Formspree, Resend, etc.), edit `app/contact/page.tsx`.

## 📄 License

Personal portfolio — feel free to use as inspiration for your own.

---

Built by **Arshdeep Singh** · [GitHub](https://github.com/arshdeepsingh11) · [LinkedIn](https://linkedin.com/in/arshdeep-singh-software)
