"use client";

import { useEffect, useRef } from "react";

export default function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    return () => { container.innerHTML = ""; };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 nebula-bg"
    />
  );
}
