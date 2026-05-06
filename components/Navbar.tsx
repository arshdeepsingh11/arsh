"use client";

// ============================================================
//  Navbar — sticky top navigation, used on every page
//  Active state highlighting based on current route
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/data/portfolio";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/websites", label: "Websites" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Match exact path for home, prefix-match for nested routes
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-[60px] flex items-center justify-between px-6 md:px-10 bg-bg/80 backdrop-blur-xl border-b border-glass-border">
      {/* LOGO */}
      <Link
        href="/"
        className="font-mono text-sm tracking-[0.2em] uppercase text-blue-400"
      >
        {siteConfig.brandName}
        <span className="text-violet-400">{siteConfig.brandAccent}</span>
        <span className="text-text/60">.dev</span>
      </Link>

      {/* DESKTOP LINKS */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3.5 py-2 text-[13px] tracking-wide transition-colors ${
              isActive(link.href)
                ? "text-blue-400"
                : "text-muted hover:text-text"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/contact"
          className="hidden sm:inline-flex px-4 py-2 text-[13px] tracking-wide rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 transition"
        >
          Let&apos;s Work Together
        </Link>

        {/* Mobile burger */}
        <button
          aria-label="Toggle menu"
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md border border-glass-border"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="block w-4 h-px bg-text" />
          <span className="block w-4 h-px bg-text" />
          <span className="block w-4 h-px bg-text" />
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-glass-border flex flex-col py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-6 py-3 text-sm ${
                isActive(link.href) ? "text-blue-400" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="mx-6 mt-2 px-4 py-2 text-center text-sm rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400"
          >
            Let&apos;s Work Together
          </Link>
        </div>
      )}
    </nav>
  );
}
