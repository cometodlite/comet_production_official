"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const socialLinks = [
  {
    label: "X (Twitter)",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* 브랜드 */}
          <div>
            <p className="text-white font-bold tracking-widest text-sm mb-1">COMET PRODUCTION</p>
            <p className="text-white/40 text-xs mb-3">
              {t("산하: COMET ENTERTAINERS · COMET DEVELOPS", "Subsidiaries: COMET ENTERTAINERS · COMET DEVELOPS")}
            </p>
            <p className="text-white/25 text-xs italic">Under KE NETWORK</p>
          </div>

          {/* 링크 */}
          <div className="flex flex-col sm:flex-row gap-6 text-xs text-white/40">
            <div className="flex flex-col gap-2">
              <p className="text-white/20 uppercase tracking-widest text-[10px] mb-1">{t("바로가기", "Quick Links")}</p>
              <Link href="/about" className="hover:text-white transition-colors">{t("회사 소개", "About")}</Link>
              <Link href="/entertainers" className="hover:text-white transition-colors">ENTERTAINERS</Link>
              <Link href="/develops" className="hover:text-white transition-colors">DEVELOPS</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-white/20 uppercase tracking-widest text-[10px] mb-1">{t("기타", "More")}</p>
              <Link href="/news" className="hover:text-white transition-colors">{t("뉴스", "News")}</Link>
              <Link href="/careers" className="hover:text-white transition-colors">{t("채용", "Careers")}</Link>
              <Link href="/contact" className="hover:text-white transition-colors">{t("문의", "Contact")}</Link>
            </div>
          </div>

          {/* 소셜 링크 */}
          <div className="flex flex-col gap-3">
            <p className="text-white/20 uppercase tracking-widest text-[10px]">{t("소셜 미디어", "Social")}</p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-indigo-400 hover:text-indigo-300 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} COMET PRODUCTION. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
