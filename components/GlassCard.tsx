// ============================================================
//  GlassCard — reusable glassmorphism card surface
// ============================================================

import { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  accent?: boolean;
}

export default function GlassCard({
  children,
  hoverable = false,
  accent = false,
  className = "",
  ...rest
}: Props) {
  return (
    <div
      className={`
        relative bg-glass border border-glass-border rounded-xl p-5 sm:p-6
        ${hoverable ? "transition-all duration-200 hover:bg-white/5 hover:border-white/15 hover:-translate-y-0.5" : ""}
        ${accent ? "bg-gradient-to-br from-blue-500/[0.08] to-violet-500/[0.08]" : ""}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
