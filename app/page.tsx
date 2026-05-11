// ============================================================
//  HOME PAGE — Hero (typing + spotlight), animated stats,
//  marquee, tilt cards, reveal-on-scroll throughout
// ============================================================

import Link from "next/link";
import { siteConfig, stats, skills, projects, clientSites } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import TypingText from "@/components/TypingText";
import TechMarquee from "@/components/TechMarquee";
import TiltCard from "@/components/TiltCard";
import HeroSpotlight from "@/components/HeroSpotlight";
import { accentMap } from "@/lib/helpers";

const systemsShown = [
  { icon: "🏥", name: "Healthcare EMR", tech: "HL7 v2.x · BioAro · Calgary" },
  { icon: "🌐", name: "Client Websites", tech: "WordPress · Elementor · 4+ live sites" },
  { icon: "📊", name: "BI Dashboards", tech: "React · Next.js · PostgreSQL" },
  { icon: "📱", name: "Mobile Apps", tech: "React Native · Expo · Supabase" },
  { icon: "🔐", name: "Auth Systems", tech: "Node.js · MFA · Docker · RLS" },
  { icon: "⚡", name: "Automation Scripts", tech: "Python · JavaScript · CI" },
];

const heroRoles = [
  "Software Developer.",
  "Web Designer.",
  "QA Automation Engineer.",
];

const marqueeTech = [
  "React", "Next.js", "TypeScript", "React Native", "Expo", "Node.js",
  "Supabase", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "CI/CD",
  "HL7 v2.x", "WordPress", "Elementor", "Tailwind CSS", "Python",
  "Java", "AWS", "Git/GitHub", "Postman", "Jira",
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10">
      {/* HERO */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <HeroSpotlight />

        <div className="relative z-10">
          {siteConfig.available && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/[0.08] border border-cyan-500/20 rounded-full text-xs font-mono text-cyan-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {siteConfig.availableText}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            <span className="block bg-gradient-to-br from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
            <span className="block text-text text-2xl md:text-3xl font-normal mt-3 min-h-[1.2em]">
              <TypingText phrases={heroRoles} className="text-blue-400" />
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted max-w-2xl leading-relaxed mb-10">
            {siteConfig.heroDescription}
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            <Link
              href="/work"
              className="px-7 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium tracking-wide hover:shadow-[0_8px_30px_rgba(79,142,247,0.3)] hover:-translate-y-0.5 transition-all"
            >
              View My Work
            </Link>
            <Link
              href="/websites"
              className="px-7 py-3 rounded-lg bg-glass border border-glass-border text-sm font-medium tracking-wide hover:bg-white/5 hover:border-white/15 transition-all"
            >
              See Live Websites
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-lg bg-glass border border-glass-border text-sm font-medium tracking-wide hover:bg-white/5 hover:border-white/15 transition-all"
            >
              Get In Touch
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-glass-border border border-glass-border rounded-xl overflow-hidden">
            {stats.map((s) => (
              <StatCard key={s.label} number={s.number} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-4">
        <TechMarquee items={marqueeTech} />
      </section>

      <RevealOnScroll as="section" className="py-12">
        <SectionHeader
          label="// systems"
          title="Systems I've Worked On"
          subtitle="Domains and platforms where I've shipped production-grade software"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {systemsShown.map((s) => (
            <TiltCard
              key={s.name}
              className="bg-glass border border-glass-border rounded-xl p-5 hover:bg-white/5 hover:border-blue-400/30"
            >
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="text-sm font-semibold mb-1">{s.name}</div>
              <div className="text-xs font-mono text-muted">{s.tech}</div>
            </TiltCard>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="py-12">
        <SectionHeader
          label="// tech stack"
          title="Technical Arsenal"
          subtitle="Languages, frameworks, and tools I use daily"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((group) => {
            const a = accentMap[group.accent as keyof typeof accentMap];
            return (
              <div
                key={group.category}
                className="bg-glass border border-glass-border rounded-xl p-5"
              >
                <div className={`font-mono text-xs tracking-[0.2em] uppercase mb-4 ${a.text}`}>
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className={`px-2.5 py-1 text-xs font-mono rounded ${a.bg} ${a.text} border ${a.border}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="py-12">
        <SectionHeader
          label="// featured"
          title="Recent Projects"
          subtitle="A look at what I've been building"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.slice(0, 2).map((p) => (
            <TiltCard
              key={p.slug}
              className="bg-glass border border-glass-border rounded-xl overflow-hidden hover:bg-white/5 hover:border-blue-400/30"
            >
              <Link href={`/case-studies/${p.slug}`} className="group relative block p-6">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-violet-400 mb-3">
                  {p.label}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">{p.shortDesc}</p>
                <div className="text-xs text-blue-400 group-hover:translate-x-1 transition-transform">
                  Read case study →
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="py-12">
        <SectionHeader
          label="// live client work"
          title="Websites I've Shipped"
          subtitle="Live production websites — viewable inside an interactive iPad on the Websites page"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clientSites.slice(0, 4).map((site) => (
            <TiltCard
              key={site.url}
              className="bg-glass border border-glass-border rounded-xl overflow-hidden hover:bg-white/5 hover:border-blue-400/30"
            >
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block p-6"
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-violet-400">
                    {site.role}
                  </div>
                  <span className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
                    ↗
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                  {site.name}
                </h3>
                <div className="text-xs font-mono text-muted mb-3">{site.domain}</div>
                <p className="text-sm text-muted leading-relaxed line-clamp-3">
                  {site.description}
                </p>
              </a>
            </TiltCard>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link
            href="/websites"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all sites inside an iPad →
          </Link>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="py-16">
        <div className="bg-gradient-to-br from-blue-500/[0.08] to-violet-500/[0.08] border border-glass-border rounded-2xl p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Have a system worth building?
          </h2>
          <p className="text-muted max-w-xl mx-auto mb-6">
            I&apos;m available for QA automation roles, junior dev positions,
            web design and freelance engineering work. Let&apos;s build something solid.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium hover:-translate-y-0.5 transition-transform"
          >
            Let&apos;s Work Together
          </Link>
        </div>
      </RevealOnScroll>
    </div>
  );
}