"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (ko: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("ko");

  const toggleLang = () => setLang((prev) => (prev === "ko" ? "en" : "ko"));

  const t = (ko: string, en: string) => (lang === "ko" ? ko : en);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
