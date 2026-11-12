import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { AppProvider } from "@/components/shell/AppProvider";
import { Shell } from "@/components/shell/Shell";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["200", "300", "400", "500", "600"], variable: "--font-outfit", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://arshdeepsingh-portfolio.vercel.app"),
  title: { default: "Arshdeep Singh — ARSH/OS", template: "%s · ARSH/OS" },
  description: "Arshdeep Singh, software developer in Calgary building AI and intelligent systems. Six AI agents, project worlds from GitHub, and a working intelligence lab.",
  openGraph: { title: "Arshdeep Singh — ARSH/OS", description: "An AI-native portfolio: six agents, project worlds and a working intelligence lab.", type: "website" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#F8FAFD", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${plex.variable}`}>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
