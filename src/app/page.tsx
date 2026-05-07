"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { motion, StaggerContainer, StaggerItem } from "@/components/Motion";

export default function HomePage() {
  const { t } = useLang();

  const subsidiaries = [
    {
      name: "COMET ENTERTAINERS",
      href: "/entertainers",
      icon: "✦",
      color: "from-violet-600/20 to-purple-900/20",
      border: "border-violet-500/30",
      accent: "text-violet-400",
      tagline: t("엔터테인먼트 · 아티스트 관리 · 지원", "Entertainment · Artist Management · Support"),
      desc: t(
        "KE ENTERTAINMENT의 계보를 이어받아, 아티스트와 함께 새로운 별을 만들어갑니다.",
        "Carrying on the legacy of KE ENTERTAINMENT, creating new stars alongside our artists."
      ),
    },
    {
      name: "COMET DEVELOPS",
      href: "/develops",
      icon: "◈",
      color: "from-blue-600/20 to-indigo-900/20",
      border: "border-blue-500/30",
      accent: "text-blue-400",
      tagline: t("게임 개발 · 관리 및 배급 · 추가 지원", "Game Dev · Publishing · Extended Support"),
      desc: t(
        "게임 개발과 배급을 통해 COMET PRODUCTION의 새로운 지평을 엽니다.",
        "Opening new horizons for COMET PRODUCTION through game development and publishing."
      ),
    },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20 relative">
        {/* 히어로 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(99,102,241,0.13) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-indigo-400 text-sm tracking-[0.5em] uppercase mb-4">
            {t("KE NETWORK 산하", "Under KE NETWORK")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-3">
            <span className="gradient-text">COMET</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-light tracking-[0.45em] text-white/60 mb-10">
            PRODUCTION
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-4">
            {t(
              "엔터테인먼트와 개발, 두 개의 날개로 더 넓은 우주를 향해 나아갑니다.",
              "With two wings — entertainment and development — we reach for a wider universe."
            )}
          </p>
          <p className="text-amber-500/60 text-sm tracking-[0.15em] mb-12 italic">
            _Talent. Care. Knowledge. Connection
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 animate-glow"
            >
              {t("회사 소개", "About Us")}
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 rounded-full border border-white/20 hover:border-indigo-400 text-white/70 hover:text-white font-medium transition-all"
            >
              {t("문의하기", "Contact")}
            </Link>
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-float">
          <span className="text-xs tracking-widest">{t("스크롤", "SCROLL")}</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="7" r="2" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Subsidiaries Section */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-3">
            {t("산하 브랜드", "SUBSIDIARIES")}
          </p>
          <h3 className="text-3xl md:text-4xl font-bold text-white">
            {t("두 개의 날개", "Two Wings")}
          </h3>
        </motion.div>

        <StaggerContainer className="grid md:grid-cols-2 gap-8">
          {subsidiaries.map((sub) => (
            <StaggerItem key={sub.name}>
              <Link href={sub.href} className="group block h-full">
                <motion.div
                  className={`glass-card p-8 bg-gradient-to-br ${sub.color} border ${sub.border} h-full`}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className={`text-4xl mb-5 ${sub.accent} group-hover:scale-110 transition-transform inline-block`}>
                    {sub.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{sub.name}</h4>
                  <p className={`text-xs tracking-widest uppercase mb-4 ${sub.accent}`}>
                    {sub.tagline}
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed">{sub.desc}</p>
                  <div className={`mt-6 flex items-center gap-2 text-sm font-semibold ${sub.accent} group-hover:gap-3 transition-all`}>
                    {t("자세히 보기", "Learn more")} <span>→</span>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </div>
  );
}
