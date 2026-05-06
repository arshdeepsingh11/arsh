"use client";

// ============================================================
//  CONTACT PAGE — Links + optional message form (mailto)
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Form submit opens user's email client pre-filled (no backend needed)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-12 pb-16">
      <SectionHeader
        label="// contact"
        title="Let's Build Something"
        subtitle="Open to QA Automation, Junior Developer roles, and freelance opportunities"
      />

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ContactLink
          icon="📧"
          label="Email"
          sub={siteConfig.email}
          href={`mailto:${siteConfig.email}`}
          color="blue"
        />
        <ContactLink
          icon="⌨"
          label="GitHub"
          sub={`github.com/${siteConfig.githubHandle}`}
          href={siteConfig.github}
          color="violet"
          external
        />
        <ContactLink
          icon="💼"
          label="LinkedIn"
          sub={siteConfig.linkedinHandle}
          href={siteConfig.linkedin}
          color="cyan"
          external
        />
        <ContactLink
          icon="📍"
          label="Location"
          sub={siteConfig.location}
          color="cyan"
        />
      </div>

      {/* MESSAGE FORM */}
      <div className="bg-glass border border-glass-border rounded-xl p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-1">Send a quick message</h3>
        <p className="text-sm text-muted mb-6">
          Form opens your email client pre-filled — no backend needed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-glass-border rounded-lg text-sm placeholder:text-muted focus:outline-none focus:border-blue-400 transition"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-glass-border rounded-lg text-sm placeholder:text-muted focus:outline-none focus:border-blue-400 transition"
            />
          </div>
          <textarea
            required
            rows={5}
            placeholder="What would you like to discuss?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-glass-border rounded-lg text-sm placeholder:text-muted focus:outline-none focus:border-blue-400 transition resize-none"
          />
          <button
            type="submit"
            className="px-7 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium hover:-translate-y-0.5 transition-transform"
          >
            Send Message →
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Reusable contact link card ──
function ContactLink({
  icon,
  label,
  sub,
  href,
  color,
  external = false,
}: {
  icon: string;
  label: string;
  sub: string;
  href?: string;
  color: "blue" | "violet" | "cyan";
  external?: boolean;
}) {
  const bgMap = {
    blue: "bg-blue-500/10",
    violet: "bg-violet-500/10",
    cyan: "bg-cyan-500/10",
  };

  const inner = (
    <div className="flex items-center gap-3 p-5 bg-glass border border-glass-border rounded-xl hover:bg-white/5 hover:border-blue-400/30 transition-all h-full">
      <div
        className={`w-10 h-10 ${bgMap[color]} rounded-lg flex items-center justify-center text-lg shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted truncate">{sub}</div>
      </div>
    </div>
  );

  if (!href) return <div>{inner}</div>;
  return (
    <Link href={href} {...(external && { target: "_blank", rel: "noopener" })}>
      {inner}
    </Link>
  );
}
