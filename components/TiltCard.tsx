"use client";

import { ReactNode, useRef, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  max?: number;
};

export default function TiltCard({ children, className = "", max = 8 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!reduced && !coarse);
  }, []);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const ry = x * max * 2;
    const rx = -y * max * 2;
    ref.current.style.transform = `perspective(700px) rotateY(${ry}deg) rotateX(${rx}deg) translateY(-3px)`;
  }

  function handleLeave() {
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(700px) rotateY(0deg) rotateX(0deg) translateY(0)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}
    >
      {children}
    </div>
  );
}