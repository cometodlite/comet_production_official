"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { CometProductionLogo } from "@/components/logos/CometLogo";

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("홈", "Home") },
    { href: "/about", label: t("회사 소개", "About") },
    { href: "/entertainers", label: "ENTERTAINERS" },
    { href: "/develops", label: "DEVELOPS" },
    { href: "/news", label: t("뉴스", "News") },
    { href: "/careers", label: t("채용", "Careers") },
    { href: "/contact", label: t("문의", "Contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
          <CometProductionLogo size={28} className="group-hover:opacity-80 transition-opacity" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-[0.25em] text-white group-hover:text-amber-300 transition-colors">
              C O M E T
            </span>
            <span className="text-[9px] font-light tracking-[0.35em] text-amber-500/80 uppercase">
              PRODUCTION
            </span>
          </div>
        </Link>

        {/* 데스크톱 메뉴 */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm tracking-wide transition-colors ${
                  pathname === href
                    ? "text-indigo-300 font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* 언어 토글 */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs border border-white/20 rounded-full px-3 py-1.5 text-white/70 hover:border-indigo-400 hover:text-indigo-300 transition-all"
          >
            <span className={lang === "ko" ? "text-white font-semibold" : ""}>KO</span>
            <span className="text-white/30">/</span>
            <span className={lang === "en" ? "text-white font-semibold" : ""}>EN</span>
          </button>

          {/* 햄버거 버튼 (모바일) */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* 모바일 드롭다운 메뉴 */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 border-t border-white/10" : "max-h-0"}`}>
        <ul className="bg-black/80 backdrop-blur-md px-6 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 text-sm tracking-wide transition-colors border-b border-white/5 last:border-0 ${
                  pathname === href
                    ? "text-indigo-300 font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
