// ============================================================
//  StatCard — single stat cell used in stats grids
// ============================================================

interface Props {
  number: string;
  label: string;
}

export default function StatCard({ number, label }: Props) {
  return (
    <div className="bg-surface p-6 text-center">
      <div className="font-mono text-3xl font-bold text-blue-400">{number}</div>
      <div className="text-[11px] uppercase tracking-widest text-muted mt-1">
        {label}
      </div>
    </div>
  );
}
