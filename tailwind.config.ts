// ============================================================
//  Tailwind config — design tokens for portfolio
// ============================================================

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        glass: "var(--glass)",
        "glass-border": "var(--glass-border)",
        text: "var(--text)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
