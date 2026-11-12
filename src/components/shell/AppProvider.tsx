"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AgentReply } from "@/lib/agents/conversation";
import type { AgentId } from "@/lib/content/agents";
import { stopSpeaking } from "@/lib/voice";

export type ReplyMeta = Omit<AgentReply, "text" | "agent">;
/** One shared conversation. `agent` is who said an assistant line; `note` turns are hand-off lines shown in the chat and never sent to the model. */
export type Turn = { role: "user" | "assistant" | "note"; content: string; agent?: AgentId; meta?: ReplyMeta };
export type AiStatus = { mode: "checking" } | { mode: "live" } | { mode: "demo"; reason: string };

type Ctx = {
  reduced: boolean; setReduced: (v: boolean) => void;
  sound: boolean; setSound: (v: boolean) => void;
  voice: boolean; setVoice: (v: boolean) => void;
  blip: (freq?: number, dur?: number) => void;
  status: AiStatus;
  portraits: Partial<Record<AgentId, string>>;
  drawer: AgentId | null; openAgent: (id: AgentId, question?: string) => void; closeAgent: () => void;
  takePending: (id: AgentId) => string | null;
  thread: Turn[]; setThread: (turns: Turn[]) => void; clearThread: () => void;
  intent: string | null; setIntent: (v: string | null) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside <AppProvider>");
  return c;
}

function stored(key: string): boolean | null {
  try {
    const v = localStorage.getItem(key);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}
function store(key: string, v: boolean) {
  try { localStorage.setItem(key, v ? "1" : "0"); } catch {}
}

/**
 * App-wide state. Conversations live only in memory: closing the tab clears them, and nothing is sent to a database.
 * Only two display preferences (reduced motion, sound) are remembered in this browser.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [reduced, setReducedS] = useState(false);
  const [sound, setSoundS] = useState(false);
  const [voice, setVoice] = useState(false);
  const [status, setStatus] = useState<AiStatus>({ mode: "checking" });
  const [portraits, setPortraits] = useState<Partial<Record<AgentId, string>>>({});
  const [drawer, setDrawer] = useState<AgentId | null>(null);
  const pending = useRef<{ id: AgentId; q: string } | null>(null);
  const [thread, setThread] = useState<Turn[]>([]);
  const [intent, setIntent] = useState<string | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    const r = stored("arsh.reduced");
    setReducedS(r ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setSoundS(stored("arsh.sound") ?? false);
    fetch("/api/agents/status")
      .then((r) => r.json())
      .then((s: AiStatus) => setStatus(s))
      .catch(() => setStatus({ mode: "demo", reason: "The agent service could not be reached." }));
    // Agent portraits are rendered once, off the critical path, from the same 3D models as the characters.
    const t = setTimeout(() => {
      import("@/lib/characters/stage")
        .then((m) => { if (m.webglOK()) setPortraits(m.portraits(144)); })
        .catch(() => {});
    }, 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { document.documentElement.classList.toggle("reduced", reduced); }, [reduced]);

  const setReduced = useCallback((v: boolean) => { setReducedS(v); store("arsh.reduced", v); }, []);
  const setSound = useCallback((v: boolean) => { setSoundS(v); store("arsh.sound", v); }, []);

  const blip = useCallback((freq = 660, dur = 0.07) => {
    if (!sound) return;
    try {
      const ac = (audio.current ??= new AudioContext());
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.05, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + dur);
    } catch {}
  }, [sound]);

  const openAgent = useCallback((id: AgentId, q?: string) => { pending.current = q ? { id, q } : null; setDrawer(id); }, []);
  const closeAgent = useCallback(() => { stopSpeaking(); setDrawer(null); }, []);
  const takePending = useCallback((id: AgentId) => {
    const p = pending.current;
    if (!p || p.id !== id) return null;
    pending.current = null;
    return p.q;
  }, []);
  const clearThread = useCallback(() => setThread([]), []);

  const value = useMemo<Ctx>(
    () => ({ reduced, setReduced, sound, setSound, voice, setVoice, blip, status, portraits, drawer, openAgent, closeAgent, takePending, thread, setThread, clearThread, intent, setIntent }),
    [reduced, setReduced, sound, setSound, voice, blip, status, portraits, drawer, openAgent, closeAgent, takePending, thread, clearThread, intent],
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
