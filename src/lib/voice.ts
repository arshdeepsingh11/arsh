"use client";

import { AGENTS, type AgentId } from "@/lib/content/agents";

/* Voice: browser speech synthesis with a distinct voice per agent, and dictation through the Web Speech API.
   Both are opt-in. The microphone is only requested after the visitor presses the dictation button. */

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

function pickVoice(prefer: string[]): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  for (const p of prefer) {
    const v = voices.find((x) => x.name.toLowerCase().includes(p.toLowerCase()));
    if (v) return v;
  }
  return voices[0];
}

export function speak(agent: AgentId, text: string): Promise<void> {
  if (!canSpeak()) return Promise.resolve();
  const synth = window.speechSynthesis;
  synth.cancel();
  const cfg = AGENTS[agent].voice;
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text.slice(0, 1800));
    const v = pickVoice(cfg.prefer);
    if (v) u.voice = v;
    u.pitch = cfg.pitch;
    u.rate = cfg.rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

export const stopSpeaking = () => { if (canSpeak()) window.speechSynthesis.cancel(); };

type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> ; resultIndex: number }) => void) | null;
  onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null;
  start(): void; stop(): void;
};
type RecognitionCtor = new () => Recognition;

export function dictationSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Starts one dictation session. Returns a stop function. */
export function dictate(onText: (text: string, final: boolean) => void, onEnd: (error?: string) => void): () => void {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) { onEnd("unsupported"); return () => {}; }
  const r = new Ctor();
  r.lang = "en-US";
  r.interimResults = true;
  r.continuous = false;
  r.onresult = (e) => {
    let text = "", final = false;
    for (let i = e.resultIndex; i < e.results.length; i++) { text += e.results[i][0].transcript; final = final || e.results[i].isFinal; }
    onText(text, final);
  };
  r.onerror = (e) => onEnd(e.error);
  r.onend = () => onEnd();
  r.start();
  return () => r.stop();
}
