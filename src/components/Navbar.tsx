"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { CometProductionLogo } from "@/components/logos/CometLogo";

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/",              label: t("홈", "Home") },
    { href: "/about",         label: t("회사 소개", "About") },
    { href: "/entertainers",  label: "ENTERTAINERS" },
    { href: "/develops",      label: "DEVELOPS" },
    { href: "/news",          label: t("뉴스", "News") },
    { href: "/careers",       label: t("채용", "Careers") },
    { href: "/contact",       label: t("문의", "Contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── 메인 바 ── */}
      <div className="bg-black/65 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMenuOpen(false)}
          >
            <CometProductionLogo size={26} className="group-hover:opacity-80 transition-opacity" />
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
          <ul className="hidden md:flex items-center gap-7">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative text-sm tracking-wide transition-colors pb-1 ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-indigo-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 우측: 언어 토글 + MENU 버튼 */}
          <div className="flex items-center gap-4">
            {/* 언어 토글 */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-xs border border-white/20 rounded-full px-3 py-1.5 text-white/70 hover:border-indigo-400 hover:text-indigo-300 transition-all"
            >
              <span className={lang === "ko" ? "text-white font-semibold" : ""}>KO</span>
              <span className="text-white/25">/</span>
              <span className={lang === "en" ? "text-white font-semibold" : ""}>EN</span>
            </button>

            {/* 모바일 MENU 버튼 */}
            <button
              className="md:hidden flex items-center gap-2.5 text-white/75 hover:text-white transition-colors py-1"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="메뉴 열기/닫기"
            >
              {/* 아이콘 */}
              <div className="w-[18px] h-[13px] flex flex-col justify-between">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="block w-full h-[1.5px] bg-current origin-center rounded-full"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.18 }}
                  className="block w-full h-[1.5px] bg-current rounded-full"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="block w-full h-[1.5px] bg-current origin-center rounded-full"
                />
              </div>
              {/* MENU / CLOSE 레이블 */}
              <span className="text-[9px] tracking-[0.35em] uppercase font-semibold min-w-[32px]">
                {menuOpen ? "CLOSE" : "MENU"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 모바일 드롭다운 ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden bg-[#06050f]/96 backdrop-blur-xl border-b border-white/10"
          >
            <ul className="px-6 py-2 flex flex-col">
              {navLinks.map(({ href, label }, i) => {
                const isActive = pathname === href;
                return (
                  <motion.li
                    key={href}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 + 0.04, duration: 0.22 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between py-4 text-[15px] tracking-wide border-b border-white/5 last:border-0 transition-colors ${
                        isActive
                          ? "text-white font-bold"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      <span>{label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
