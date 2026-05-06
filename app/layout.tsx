// ============================================================
//  Root layout — wraps every page with navbar + footer
//  Defines global SEO metadata
// ============================================================

import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/portfolio";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.summary,
  keywords: [
    "Arshdeep Singh",
    "Software Developer",
    "QA Automation Engineer",
    "Full Stack Developer",
    "HL7",
    "React",
    "Next.js",
    "Calgary",
    "SAIT",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.summary,
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.summary,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-bg text-text font-sans antialiased min-h-screen">
        {/* Atmospheric background gradient */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(79,142,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)",
          }}
        />

        <Navbar />
        <main className="pt-[60px] relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
