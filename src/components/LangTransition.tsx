"use client";

import { useLang } from "@/context/LanguageContext";

/**
 * 언어 전환 시 콘텐츠 fade-out → 언어 교체 → fade-in
 * opacity CSS transition만 사용하므로 스크롤 상태·레이아웃 변화 없음
 */
export default function LangTransition({ children }: { children: React.ReactNode }) {
  const { isChanging } = useLang();
  return (
    <div
      style={{
        opacity: isChanging ? 0 : 1,
        transition: isChanging
          ? "opacity 0.11s ease-out"   // fade-out : 빠르게
          : "opacity 0.18s ease-in",   // fade-in  : 살짝 느리게 (Apple 느낌)
      }}
    >
      {children}
    </div>
  );
}
