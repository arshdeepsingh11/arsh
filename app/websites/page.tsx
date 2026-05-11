// ============================================================
//  WEBSITES PAGE — Live client websites inside an iPad frame
// ============================================================

import { clientSites } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import WebsitesShowcase from "@/components/WebsitesShowcase";
import RevealOnScroll from "@/components/RevealOnScroll";

export const metadata = {
  title: "Websites",
  description:
    "Live client websites designed and developed for BioAro's healthcare and partner clients — viewable inside an interactive iPad frame.",
};

export default function WebsitesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <RevealOnScroll>
        <SectionHeader
          label="// live client work"
          title="Websites I've Shipped"
          subtitle="Tap any tab below to view a live client website inside an iPad — fully interactive."
        />
      </RevealOnScroll>

      <RevealOnScroll delay={100}>
        <div className="bg-gradient-to-br from-blue-500/[0.06] to-violet-500/[0.06] border border-glass-border rounded-2xl p-6 md:p-8 mb-10">
          <p className="text-sm md:text-base text-muted leading-relaxed">
            As part of my role at BioAro, I work directly with client briefs to
            design and ship full websites — branding, layout, content structure,
            booking flows, and WordPress / Elementor delivery. Each of the four
            sites below is live in production and serves real users every day.
            Use the iPad to browse them right here.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={200}>
        <WebsitesShowcase sites={clientSites} />
      </RevealOnScroll>

      <RevealOnScroll delay={100}>
        <div className="mt-12 bg-glass border border-glass-border rounded-xl p-5 sm:p-6 text-center">
          <p className="text-sm text-muted leading-relaxed">
            Want a website like these for your business or clinic? I&apos;m
            available for freelance web design and development work alongside my
            full-time role.
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}