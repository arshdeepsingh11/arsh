"use client";

import { useEffect, useRef } from "react";

export default function HeroSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    function handleMove(e: MouseEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (!el || !parent) return;
        const rect = parent.getBoundingClientRect();
        el.style.left = `${lastX - rect.left}px`;
        el.style.top = `${lastY - rect.top}px`;
        raf = 0;
      });
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) {
      el.style.display = "none";
      return;
    }

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseleave", () => {
      if (el) el.style.opacity = "0";
    });
    parent.addEventListener("mouseenter", () => {
      if (el) el.style.opacity = "1";
    });

    return () => {
      parent.removeEventListener("mousemove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{
        width: "520px",
        height: "520px",
        transform: "translate(-50%, -50%)",
        background:
          "radial-gradient(circle, rgba(79,142,247,0.10) 0%, rgba(139,92,246,0.04) 35%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease",
        left: 0,
        top: 0,
        zIndex: 0,
      }}
    />
  );
}