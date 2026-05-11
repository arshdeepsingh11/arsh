"use client";

const steps = [
  { year: "2023", label: "Technical Analyst", done: true, color: "violet" },
  { year: "2024", label: "BI / Web Dev", done: true, color: "blue" },
  { year: "2025", label: "SAIT Grad · BioAro", done: true, color: "cyan" },
  { year: "2026", label: "Sr Dev · AI Integration", done: false, color: "violet", highlight: true },
  { year: "2027", label: "Cloud Architect", done: false, color: "blue" },
  { year: "2028+", label: "AI SaaS Founder", done: false, color: "cyan" },
];

const dotColor: Record<string, string> = {
  blue: "bg-blue-400",
  violet: "bg-violet-400",
  cyan: "bg-cyan-400",
};

const ringColor: Record<string, string> = {
  blue: "border-blue-400/60",
  violet: "border-violet-400/60",
  cyan: "border-cyan-400/60",
};

export default function FutureRoadmap() {
  return (
    <div className="bg-glass border border-glass-border rounded-xl p-5 sm:p-6 mt-6">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-cyan-400 mb-5">
        // future roadmap
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[14px] h-px bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 opacity-40"
        />

        <div className="relative grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-2">
          {steps.map((s) => (
            <div key={s.year} className="flex flex-col items-center text-center">
              {s.done ? (
                <div
                  className={`w-3.5 h-3.5 rounded-full ${dotColor[s.color]} ring-2 ring-bg`}
                  style={{
                    boxShadow:
                      s.color === "cyan"
                        ? "0 0 10px rgba(34,211,238,0.6)"
                        : s.color === "violet"
                        ? "0 0 10px rgba(139,92,246,0.6)"
                        : "0 0 10px rgba(79,142,247,0.6)",
                  }}
                />
              ) : (
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 ${ringColor[s.color]} bg-bg ${
                    s.highlight ? "roadmap-glow" : ""
                  }`}
                />
              )}

              <div className="font-mono text-[10px] text-muted mt-2 tracking-wider">
                {s.year}
              </div>

              <div className={`text-[11px] sm:text-xs mt-1 leading-tight ${s.done ? "text-text" : "text-muted"}`}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 text-xs text-muted text-center font-mono">
        ← past · future →
      </div>
    </div>
  );
}