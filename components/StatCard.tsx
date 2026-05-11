// ============================================================
//  StatCard — single stat cell, animated counter on scroll
// ============================================================

import AnimatedCounter from "./AnimatedCounter";

interface Props {
  number: string;
  label: string;
}

export default function StatCard({ number, label }: Props) {
  return (
    <div className="bg-surface p-6 text-center">
      <div className="font-mono text-3xl font-bold text-blue-400 tabular-nums">
        <AnimatedCounter value={number} />
      </div>
      <div className="text-[11px] uppercase tracking-widest text-muted mt-1">
        {label}
      </div>
    </div>
  );
}