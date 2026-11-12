"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AGENTS, type AgentId, type CharacterState } from "@/lib/content/agents";
import type { Stage } from "@/lib/characters/stage";
import { useApp } from "@/components/shell/AppProvider";
import { vars } from "./Avatar";

type Props = {
  ids: AgentId[];
  states?: Partial<Record<AgentId, CharacterState>>;
  onPick?: (id: AgentId) => void;
  onHover?: (id: AgentId | null) => void;
  labels?: boolean;
  /** Shown when WebGL is unavailable. */
  fallback?: ReactNode;
  className?: string;
};

/**
 * Renders one or more characters in a single WebGL context. three.js is loaded on demand, only where a character
 * is on screen; rendering pauses when the canvas scrolls out of view or the tab is hidden.
 */
export function CharacterCanvas({ ids, states, onPick, onHover, labels, fallback, className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const labelRefs = useRef<Partial<Record<AgentId, HTMLSpanElement | null>>>({});
  const pickRef = useRef(onPick);
  const hoverRef = useRef(onHover);
  const [noGl, setNoGl] = useState(false);
  const [hovered, setHovered] = useState<AgentId | null>(null);
  const { reduced } = useApp();
  pickRef.current = onPick;
  hoverRef.current = onHover;
  const key = ids.join(",");

  useEffect(() => {
    let cancelled = false;
    let s: Stage | null = null;
    import("@/lib/characters/stage")
      .then((m) => {
        if (cancelled || !canvas.current) return;
        if (!m.webglOK()) { setNoGl(true); return; }
        try {
          s = new m.Stage(canvas.current, key.split(",") as AgentId[], {
            reduced,
            onPick: (id) => pickRef.current?.(id),
            onHover: (id) => { setHovered(id); hoverRef.current?.(id); },
            onFrame: labels
              ? (st) => {
                  for (const id of st.ids) {
                    const el = labelRefs.current[id];
                    if (!el) continue;
                    const p = st.project(id);
                    el.style.transform = `translate(${p.x * st.canvas.clientWidth}px,${p.y * st.canvas.clientHeight}px) translate(-50%,-100%)`;
                  }
                }
              : undefined,
          });
          stage.current = s;
        } catch {
          setNoGl(true);
        }
      })
      .catch(() => setNoGl(true));
    return () => {
      cancelled = true;
      s?.dispose();
      stage.current = null;
    };
    // The stage is rebuilt only when the set of characters changes; other props are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { if (stage.current) stage.current.reduced = reduced; }, [reduced]);
  useEffect(() => {
    const s = stage.current;
    if (!s || !states) return;
    for (const id of ids) {
      const st = states[id];
      if (st) s.setState(id, st);
      else if (s.chars[id] && s.hoverId !== id) s.setState(id, "idle");
    }
  });

  if (noGl) return <>{fallback ?? null}</>;
  return (
    <div className={className} style={{ position: "relative" }}>
      <canvas ref={canvas} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", touchAction: "pan-y" }} />
      {labels && (
        <div className="roster-labels" aria-hidden="true">
          {ids.map((id) => (
            <span key={id} ref={(el) => { labelRefs.current[id] = el; }} className={hovered === id ? "on" : ""} style={vars({ c: AGENTS[id].color })}>
              {AGENTS[id].name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
