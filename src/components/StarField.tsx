"use client";

import { useEffect, useRef } from "react";

export default function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shootingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ── 고정 별 ── */
    const count = 120;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 2.5 + 0.5;
      star.className = "star";
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.1};
        animation-duration: ${Math.random() * 4 + 2}s;
        animation-delay: ${Math.random() * 4}s;
      `;
      fragment.appendChild(star);
    }
    container.appendChild(fragment);

    /* ── 유성 ── */
    const spawnShootingStar = () => {
      const s = document.createElement("div");
      const length   = Math.random() * 100 + 80;   // 80–180 px
      const duration = Math.random() * 600 + 500;  // 500–1100 ms
      s.className = "shooting-star";
      s.style.cssText = `
        width: ${length}px;
        left: ${Math.random() * 65 + 20}%;
        top: ${Math.random() * 50}%;
        animation-duration: ${duration}ms;
      `;
      container.appendChild(s);
      setTimeout(() => s.remove(), duration + 100);
    };

    const schedule = () => {
      const delay = Math.random() * 5000 + 2000; // 2–7 s
      shootingTimerRef.current = setTimeout(() => {
        spawnShootingStar();
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      container.innerHTML = "";
      if (shootingTimerRef.current) clearTimeout(shootingTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 nebula-bg"
    />
  );
}
