"use client";

// ============================================================
//  Navbar — sticky top navigation, used on every page
//  Active state highlighting based on current route
//  Mobile: full-screen drawer with solid background + backdrop
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  // Close drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* TOP NAV BAR */}
      <nav className="fixed top-0 inset-x-0 z-50 h-[60px] flex items-center justify-between px-6 md:px-10 bg-bg/90 backdrop-blur-xl border-b border-glass-border">
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

        {/* CTA + Burger */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden sm:inline-flex px-4 py-2 text-[13px] tracking-wide rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 transition"
          >
            Let&apos;s Work Together
          </Link>

          {/* Mobile burger / close toggle */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-md border border-glass-border bg-glass z-[70]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <>
                <span className="absolute block w-4 h-px bg-text rotate-45" />
                <span className="absolute block w-4 h-px bg-text -rotate-45" />
              </>
            ) : (
              <>
                <span className="block w-4 h-px bg-text" />
                <span className="block w-4 h-px bg-text" />
                <span className="block w-4 h-px bg-text" />
              </>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER — rendered OUTSIDE <nav> for clean stacking */}
      {mobileOpen && (
        <>
          {/* Backdrop — tap to close */}
          <div
            aria-hidden
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-[55] bg-black/60"
          />

          {/* Drawer panel — SOLID background, full width below navbar */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="md:hidden fixed top-[60px] left-0 right-0 z-[60] flex flex-col py-2 border-b border-glass-border shadow-2xl"
            style={{ backgroundColor: "var(--bg)" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-6 py-4 text-base font-medium border-b border-glass-border/50 last:border-b-0 transition-colors ${
                  isActive(link.href)
                    ? "text-blue-400 bg-blue-500/[0.06]"
                    : "text-text hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mx-6 mt-3 mb-2 px-4 py-3 text-center text-sm font-medium rounded-md bg-gradient-to-r from-blue-500 to-violet-500 text-white"
            >
              Let&apos;s Work Together
            </Link>
          </div>
        </>
      )}
    </>
  );
}