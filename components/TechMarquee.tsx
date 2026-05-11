"use client";

type Props = { items: string[] };

export default function TechMarquee({ items }: Props) {
  const doubled = [...items, ...items];

  return (
    <div
      className="marquee-wrap overflow-hidden relative py-3"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 60px, black calc(100% - 60px), transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 60px, black calc(100% - 60px), transparent 100%)",
      }}
      aria-hidden="true"
    >
      <div className="marquee-track gap-2.5">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="shrink-0 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-muted whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}