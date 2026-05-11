"use client";

import { useEffect, useState } from "react";

type Props = {
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseEnd?: number;
  pauseStart?: number;
  className?: string;
};

export default function TypingText({
  phrases,
  typeSpeed = 80,
  deleteSpeed = 45,
  pauseEnd = 1600,
  pauseStart = 350,
  className = "",
}: Props) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[phraseIdx];
    let timeout: number;

    if (!deleting && text === current) {
      timeout = window.setTimeout(() => setDeleting(true), pauseEnd);
    } else if (deleting && text === "") {
      timeout = window.setTimeout(() => {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }, pauseStart);
    } else if (!deleting) {
      timeout = window.setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, typeSpeed);
    } else {
      timeout = window.setTimeout(() => {
        setText(current.slice(0, text.length - 1));
      }, deleteSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIdx, phrases, typeSpeed, deleteSpeed, pauseEnd, pauseStart]);

  return (
    <span className={className}>
      {text}
      <span className="typing-cursor" aria-hidden="true" />
    </span>
  );
}