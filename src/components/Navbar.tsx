"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/app/actions/auth";
import { useLang } from "@/context/LanguageContext";
import { CometProductionLogo } from "@/components/logos/CometLogo";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "public" | "staff" | "evaluation";
};

export default function Navbar() {
  const { lang, isChanging, toggleLang, t } = useLang();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user: AuthUser | null }) => {
        if (!ignore) setUser(data.user);
      })
      .catch(() => {
        if (!ignore) setUser(null);
      });
    return () => {
      ignore = true;
    };
  }, [pathname]);

  const navLinks = [
    { href: "/",              label: t("홈", "Home") },
    { href: "/about",         label: t("회사 소개", "About") },
    { href: "/entertainers",  label: "ENTERTAINERS" },
    { href: "/develops",      label: "DEVELOPS" },
    { href: "/news",          label: t("뉴스", "News") },
    { href: "/careers",       label: t("채용", "Careers") },
    { href: "/results",       label: t("결과 조회", "Results") },
    { href: "/contact",       label: t("문의", "Contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── 메인 바 ── */}
      <div className="bg-[#000]/80 backdrop-blur-2xl border-b border-white/[0.08]">
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
                <li key={href} className="relative">
                  <Link
                    href={href}
                    className={`text-[13px] tracking-[-0.01em] transition-colors duration-300 ${
                      isActive ? "text-white" : "text-[#86868b] hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                      style={{ backgroundColor: "#6C7CFF" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* 우측: 계정 + 언어 토글 + MENU 버튼 */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {user.role === "evaluation" ? (
                    <>
                      <Link
                        href="/evaluation"
                        className={`text-xs transition-colors ${pathname === "/evaluation" ? "text-white" : "text-[#86868b] hover:text-white"}`}
                      >
                        {t("연습 문제", "Practice")}
                      </Link>
                      <Link
                        href="/evaluation/real"
                        className={`text-xs transition-colors ${pathname === "/evaluation/real" ? "text-white" : "text-[#86868b] hover:text-white"}`}
                      >
                        {t("실전 문제", "Real Exam")}
                      </Link>
                      <Link
                        href="/evaluation/history"
                        className={`text-xs transition-colors ${pathname === "/evaluation/history" ? "text-white" : "text-[#86868b] hover:text-white"}`}
                      >
                        {t("성적 확인", "My Scores")}
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={user.role === "staff" ? "/staff" : "/account"}
                      className={`text-xs transition-colors ${
                        (user.role === "staff" ? pathname === "/staff" : pathname === "/account")
                          ? "text-white"
                          : "text-[#86868b] hover:text-white"
                      }`}
                    >
                      {user.role === "staff" ? t("사원 페이지", "Staff") : t("내 계정", "Account")}
                    </Link>
                  )}
                  <form action={logout}>
                    <button className="text-xs text-[#86868b] transition-colors hover:text-white">
                      {t("로그아웃", "Logout")}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`text-xs transition-colors ${
                      pathname === "/login" || pathname === "/signup"
                        ? "text-white"
                        : "text-[#86868b] hover:text-white"
                    }`}
                  >
                    {t("일반 로그인", "Login")}
                  </Link>
                  <Link
                    href="/staff/login"
                    className={`text-xs transition-colors ${
                      pathname.startsWith("/staff") ? "text-white" : "text-[#86868b] hover:text-white"
                    }`}
                  >
                    {t("사원", "Staff")}
                  </Link>
                </>
              )}
            </div>

            {/* 언어 토글 */}
            <button
              onClick={toggleLang}
              disabled={isChanging}
              className="text-xs text-[#86868b] hover:text-white transition-all duration-200 tracking-wide disabled:opacity-50"
            >
              <span className={lang === "ko" ? "text-white" : ""}>{lang === "ko" ? "한국어" : "KO"}</span>
              <span className="mx-1.5 text-[#3a3a3c]">/</span>
              <span className={lang === "en" ? "text-white" : ""}>{lang === "en" ? "English" : "EN"}</span>
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
            className="md:hidden overflow-hidden bg-[#141414]/98 backdrop-blur-2xl border-b border-white/[0.08]"
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
              <motion.li
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.04 + 0.04, duration: 0.22 }}
              >
                {user ? (
                  <div className="py-4 space-y-2">
                    {user.role === "evaluation" ? (
                      <>
                        <Link
                          href="/evaluation"
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between py-3 text-[15px] tracking-wide border-b border-white/5 transition-colors ${pathname === "/evaluation" ? "text-white font-bold" : "text-white/55 hover:text-white"}`}
                        >
                          <span>{t("연습 문제", "Practice")}</span>
                          {pathname === "/evaluation" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                        </Link>
                        <Link
                          href="/evaluation/real"
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between py-3 text-[15px] tracking-wide border-b border-white/5 transition-colors ${pathname === "/evaluation/real" ? "text-white font-bold" : "text-white/55 hover:text-white"}`}
                        >
                          <span>{t("실전 문제", "Real Exam")}</span>
                          {pathname === "/evaluation/real" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                        </Link>
                        <Link
                          href="/evaluation/history"
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between py-3 text-[15px] tracking-wide border-b border-white/5 transition-colors ${pathname === "/evaluation/history" ? "text-white font-bold" : "text-white/55 hover:text-white"}`}
                        >
                          <span>{t("성적 확인", "My Scores")}</span>
                          {pathname === "/evaluation/history" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={user.role === "staff" ? "/staff" : "/account"}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between py-3 text-[15px] tracking-wide border-b border-white/5 transition-colors ${
                          (user.role === "staff" ? pathname === "/staff" : pathname === "/account") ? "text-white font-bold" : "text-white/55 hover:text-white"
                        }`}
                      >
                        <span>{user.role === "staff" ? t("사원 페이지", "Staff") : t("내 계정", "Account")}</span>
                        {((user.role === "staff" && pathname === "/staff") || (user.role !== "staff" && pathname === "/account")) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </Link>
                    )}
                    <form action={logout}>
                      <button className="w-full rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white/80 mt-1">
                        {t("로그아웃", "Logout")}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid gap-1">
                    {[
                      { href: "/login", label: t("일반 로그인", "Login") },
                      { href: "/staff/login", label: t("사원 로그인", "Staff Login") },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between py-4 text-[15px] tracking-wide border-b border-white/5 transition-colors text-white/55 hover:text-white"
                      >
                        <span>{item.label}</span>
                        {((item.href === "/login" && (pathname === "/login" || pathname === "/signup")) ||
                          (item.href === "/staff/login" && pathname.startsWith("/staff"))) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
