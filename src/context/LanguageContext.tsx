"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
  lang: Language;
  isChanging: boolean;
  toggleLang: () => void;
  t: (ko: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const FADE_MS = 110; // fade-out 시간 (ms) — 이 시간 뒤에 언어 교체

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("ko");
  const [isChanging, setIsChanging] = useState(false);

  const toggleLang = useCallback(() => {
    if (isChanging) return; // 연속 클릭 방지
    setIsChanging(true);
    setTimeout(() => {
      setLang((prev) => (prev === "ko" ? "en" : "ko"));
      setIsChanging(false);
    }, FADE_MS);
  }, [isChanging]);

  const t = (ko: string, en: string) => (lang === "ko" ? ko : en);

  return (
    <LanguageContext.Provider value={{ lang, isChanging, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
