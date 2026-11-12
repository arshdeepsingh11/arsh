"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/content";

/** Interactive architecture walkthrough reconstructed from the repository's documentation and folder structure. */
export function ArchitectureMap({ project }: { project: Project }) {
  const a = project.arch;
  const [sel, setSel] = useState<string | null>(null);
  const [hot, setHot] = useState<number>(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const cols = Math.max(...a.nodes.map((n) => n[2])) + 1;
  const rows = Math.max(...a.nodes.map((n) => n[3])) + 1;
  const W = cols * 170 + 20, H = rows * 84 + 20;
  const pos = Object.fromEntries(a.nodes.map((n) => [n[0], [95 + n[2] * 170, 52 + n[3] * 84] as const]));
  const label = (id: string) => a.nodes.find((n) => n[0] === id)?.[1] ?? id;

  const trace = () => {
    if (timer.current) clearInterval(timer.current);
    let i = 0;
    setHot(-1);
    setSel(a.edges[0]?.[0] ?? null);
    timer.current = setInterval(() => {
      if (i >= a.edges.length) { if (timer.current) clearInterval(timer.current); return; }
      setHot(i);
      setSel(a.edges[i][1]);
      i++;
    }, 700);
  };

  const note = sel
    ? a.notes[sel] ?? `Connected to: ${a.edges.filter((e) => e.includes(sel)).map((e) => label(e[0] === sel ? e[1] : e[0])).join(", ")}.`
    : "Select a component to see what it does. Diagram reconstructed from the repository's documentation and folder structure.";

  return (
    <div className="panel">
      <div className="arch-scroll">
        <svg className="arch-svg static" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 560) }} role="group" aria-label={`${project.name} architecture`}>
          {a.edges.map(([x, y], i) => (
            <line key={i} x1={pos[x][0]} y1={pos[x][1]} x2={pos[y][0]} y2={pos[y][1]} className={`arch-e ${i <= hot ? "hot" : ""}`} />
          ))}
          {a.nodes.map(([id, text]) => (
            <g
              key={id}
              className={`arch-n ${sel === id ? "on" : ""}`}
              transform={`translate(${pos[id][0]},${pos[id][1]})`}
              tabIndex={0}
              role="button"
              aria-pressed={sel === id}
              aria-label={text}
              onClick={() => setSel(id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(id); } }}
            >
              <rect x={-76} y={-24} width={152} height={48} rx={14} style={{ ["--c" as string]: `hsl(${project.hue} 60% 45%)` }} />
              <foreignObject x={-72} y={-22} width={144} height={44}><div className="arch-l">{text}</div></foreignObject>
            </g>
          ))}
        </svg>
      </div>
      <div className="ctl">
        <button className="btn sm" onClick={trace}>Trace a request</button>
        <p className="arch-note" aria-live="polite">{sel ? <><b>{label(sel)}</b> — {note}</> : note}</p>
      </div>
    </div>
  );
}
