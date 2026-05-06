// ============================================================
//  Footer — minimal, shared across all pages
// ============================================================

import Link from "next/link";
import { siteConfig } from "@/data/portfolio";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-glass-border mt-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted">
          © {year} {siteConfig.name} · Built with Next.js + Tailwind
        </p>
        <div className="flex items-center gap-5 text-xs text-muted">
          <Link href={siteConfig.github} target="_blank" className="hover:text-text">
            GitHub
          </Link>
          <Link href={siteConfig.linkedin} target="_blank" className="hover:text-text">
            LinkedIn
          </Link>
          <Link href={`mailto:${siteConfig.email}`} className="hover:text-text">
            Email
          </Link>
        </div>
      </div>
    </footer>
  );
}
