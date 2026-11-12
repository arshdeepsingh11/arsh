"use client";

import type { CSSProperties } from "react";
import { AGENTS, type AgentId } from "@/lib/content/agents";
import { useApp } from "@/components/shell/AppProvider";

/** Round portrait rendered from the agent's 3D model; falls back to its initial before the portrait exists. */
export function Avatar({ id, size }: { id: AgentId; size?: "lg" | "big" }) {
  const { portraits } = useApp();
  const a = AGENTS[id];
  const src = portraits[id];
  const style = { "--c": a.color, "--s": a.soft, backgroundImage: src ? `url(${src})` : undefined } as CSSProperties;
  return (
    <span className={`av ${size ?? ""}`} style={style} aria-hidden="true">
      {!src && <b>{a.name[0]}</b>}
    </span>
  );
}

/** Helper for CSS custom properties in style props. */
export const vars = (v: Record<string, string | number>) => Object.fromEntries(Object.entries(v).map(([k, x]) => [`--${k}`, x])) as CSSProperties;
