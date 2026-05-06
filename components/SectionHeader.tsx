// ============================================================
//  SectionHeader — consistent section heading style
// ============================================================

interface Props {
  label: string; // small monospace label e.g. "// systems"
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ label, title, subtitle }: Props) {
  return (
    <div className="mb-8">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet-400 mb-2">
        {label}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted text-sm md:text-base">{subtitle}</p>
      )}
    </div>
  );
}
