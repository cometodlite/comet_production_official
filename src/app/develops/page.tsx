"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";

// ── Kinetic Typography ────────────────────────────

const TECH_WORDS = [
  "GAME DEVELOPMENT",
  "WEB SYSTEMS",
  "TECH SUPPORT",
  "SERVICES",
  "IDEAS → STRUCTURE",
];

/** COMET 타이틀 글리치 효과 (RGB split, 7s 주기) */
function GlitchText({ text, baseClassName }: { text: string; baseClassName?: string }) {
  return (
    <span className="relative inline-block">
      <span className={baseClassName}>{text}</span>
      {/* 레이어 1: red */}
      <span
        aria-hidden
        className="absolute inset-0 select-none pointer-events-none"
        style={{ WebkitTextFillColor: "#f87171", animation: "glitch-shift-1 7s steps(1) infinite" }}
      >
        {text}
      </span>
      {/* 레이어 2: cyan */}
      <span
        aria-hidden
        className="absolute inset-0 select-none pointer-events-none"
        style={{ WebkitTextFillColor: "#22d3ee", animation: "glitch-shift-2 7s steps(1) infinite 0.12s" }}
      >
        {text}
      </span>
    </span>
  );
}

/** 기술 키워드 타이프라이터 순환 */
function TypewriterCycle() {
  const [wordIdx, setWordIdx]   = useState(0);
  const [text, setText]         = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = TECH_WORDS[wordIdx];
    const delay  = deleting ? 40 : text.length === target.length ? 1700 : 72;
    const timer  = setTimeout(() => {
      if (!deleting && text.length < target.length) {
        setText(target.slice(0, text.length + 1));
      } else if (!deleting) {
        setDeleting(true);
      } else if (text.length > 0) {
        setText(text.slice(0, -1));
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % TECH_WORDS.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, wordIdx]);

  return (
    <p className="font-mono text-sm tracking-[0.18em] mt-5 h-5" style={{ color: "rgba(108,124,255,0.6)" }}>
      <span style={{ color: "rgba(108,124,255,0.35)" }}>&gt; </span>
      {text}
      <span
        className="animate-cursor inline-block w-0.5 h-3.5 ml-px align-middle"
        style={{ backgroundColor: "rgba(108,124,255,0.6)" }}
      />
    </p>
  );
}

export default function DevelopsPage() {
  const { t } = useLang();

  const services = [
    {
      icon: "🎮",
      title: t("게임 개발", "Game Development"),
      desc: t(
        "독창적인 게임 콘텐츠를 기획하고 개발합니다. 플레이어에게 새로운 경험을 선사합니다.",
        "We plan and develop original game content, delivering new experiences to players."
      ),
    },
    {
      icon: "📦",
      title: t("게임 관리 및 배급", "Game Management & Publishing"),
      desc: t(
        "개발된 게임의 서비스 운영, 업데이트 관리, 배급을 전담합니다.",
        "We are dedicated to service operations, update management, and publishing of developed games."
      ),
    },
    {
      icon: "🔧",
      title: t("KE 그룹 추가 지원", "KE Group Extended Support"),
      desc: t(
        "모기업 KE 네트워크 및 계열사에 대한 기술적 개발 지원을 수행합니다.",
        "We provide technical development support for the parent KE Network and affiliated companies."
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="relative text-center mb-20">
        {/* 히어로 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(108,124,255,0.14) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: "scale(1.4)",
          }}
        />

        {/* ── 스캔라인 ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="scanline" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-[#6C7CFF] text-sm tracking-[0.5em] uppercase mb-4">
            COMET PRODUCTION {t("산하", "Subsidiary")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-3">
            <GlitchText text="COMET" baseClassName="gradient-text" />
          </h1>
          <h2 className="text-2xl md:text-3xl font-light tracking-[0.45em] text-[#6C7CFF]/80 mb-10">
            DEVELOPS
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            {t(
              "게임이라는 새로운 우주를 개척하고, COMET PRODUCTION의 기술적 가능성을 확장합니다.",
              "We pioneer a new universe called games, expanding the technological possibilities of COMET PRODUCTION."
            )}
          </p>
          <TypewriterCycle />
        </motion.div>
      </div>

      {/* Origin Banner */}
      <FadeUp className="glass-card p-6 border border-[#6C7CFF]/30 bg-gradient-to-r from-[#080E24]/60 to-transparent mb-16 flex items-start gap-4">
        <span className="text-2xl mt-0.5">🛰️</span>
        <div>
          <p className="text-[#6C7CFF] text-xs tracking-widest uppercase font-semibold mb-1">
            {t("설립 배경", "Background")}
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            {t(
              "COMET DEVELOPS는 COMET PRODUCTION의 새로운 시도 중 '개발'을 목적으로 설립된 자회사입니다. 게임 개발·관리·배급을 주요 사업으로 하며, 모기업인 KE 네트워크에 대한 추가적인 기술 지원도 수행합니다.",
              "COMET DEVELOPS is a subsidiary established for 'development' as one of COMET PRODUCTION's new ventures. Its main businesses are game development, management, and publishing, while also providing additional technical support for the parent KE Network."
            )}
          </p>
        </div>
      </FadeUp>

      {/* Services */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-[#6C7CFF] text-xs tracking-[0.5em] uppercase mb-3">
            {t("주요 사업", "SERVICES")}
          </p>
          <h3 className="text-3xl font-bold text-white">
            {t("우리가 하는 일", "What We Do")}
          </h3>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <StaggerItem key={i}>
              <motion.div
                className="glass-card p-7 border border-[#6C7CFF]/20 bg-gradient-to-b from-[#080E24]/30 to-transparent text-center h-full"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h4 className="text-lg font-bold text-white mb-3">{s.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* 프로젝트 */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-[#6C7CFF] text-xs tracking-[0.5em] uppercase mb-3">
            {t("프로젝트", "PROJECTS")}
          </p>
          <h3 className="text-3xl font-bold text-white">
            {t("개발 작품", "Our Works")}
          </h3>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* HCSiG */}
          <StaggerItem>
            <motion.a
              href="https://cometodlite.github.io/hacking-code-simulation-game/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="glass-card border border-[#6C7CFF]/30 bg-gradient-to-b from-[#080E24]/40 to-transparent p-6 h-full hover:border-[#6C7CFF]/60 transition-all">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-green-300 border-green-500/30 bg-green-500/10">
                    {t("운영 중", "Live")}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-[#9ba8ff] border-[#6C7CFF]/30 bg-[#6C7CFF]/10">
                    {t("웹게임", "Web Game")}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-cyan-300 border-cyan-500/30 bg-cyan-500/10">
                    {t("인크리멘탈 / 아이들", "Incremental / Idle")}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-[#9ba8ff] transition-colors">HCSiG</h4>
                <p className="text-[#6C7CFF]/70 text-xs mb-3">{t("해킹코드 시뮬레이션", "Hacking Code Simulation")}</p>
                <p className="text-white/40 text-xs leading-relaxed mb-5">
                  {t("COMET DEVELOPS의 첫 번째 개발 작품. 브라우저에서 즐기는 해킹코드 시뮬레이션 웹게임.", "COMET DEVELOPS' first title. A hacking code simulation web game playable in your browser.")}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6C7CFF] group-hover:gap-2.5 transition-all">
                  {t("플레이하기", "Play Now")} →
                </div>
              </div>
            </motion.a>
          </StaggerItem>

          {/* PROJECT: HW */}
          <StaggerItem>
            <motion.div
              className="glass-card border border-[#6C7CFF]/20 bg-gradient-to-b from-[#080E24]/20 to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">
                  {t("기획 중", "Planning")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">PROJECT: HW</h4>
              <p className="text-[#6C7CFF]/70 text-xs mb-3">&nbsp;</p>
              <p className="text-white/40 text-xs leading-relaxed">
                {t("편안한 힐링을 위한.", "For comfortable healing.")}
              </p>
            </motion.div>
          </StaggerItem>

          {/* WORLDWIDE_LUNATIC FAMILY */}
          <StaggerItem>
            <motion.div
              className="glass-card border border-[#6C7CFF]/20 bg-gradient-to-b from-[#080E24]/20 to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">
                  {t("기획 중", "Planning")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">WORLDWIDE_LUNATIC FAMILY</h4>
              <p className="text-[#6C7CFF]/70 text-xs mb-3">
                {t("LUNATIC 세계관 기반 캐릭터 웹게임", "LUNATIC Universe-based Character Web Game")}
              </p>
              <p className="text-white/25 text-xs italic">
                {t("공개 예정", "Details coming soon")}
              </p>
            </motion.div>
          </StaggerItem>

          {/* UTOPIA SYNDROME */}
          <StaggerItem>
            <motion.div
              className="glass-card border border-white/8 bg-gradient-to-b from-white/[0.02] to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-white/30 border-white/10 bg-white/5">
                  {t("미공개", "Unrevealed")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white/70 mb-1">UTOPIA SYNDROME</h4>
              <p className="text-white/35 text-xs mb-3">
                {t("2D 픽셀 SCP풍 생존 웹게임", "2D Pixel SCP-style Survival Web Game")}
              </p>
              <p className="text-white/25 text-xs mt-auto italic">
                {t("공개 예정", "Details coming soon")}
              </p>
            </motion.div>
          </StaggerItem>

          {/* DREAM ON */}
          <StaggerItem>
            <motion.div
              className="glass-card border border-white/8 bg-gradient-to-b from-white/[0.02] to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-white/30 border-white/10 bg-white/5">
                  {t("미공개", "Unrevealed")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white/70 mb-1">DREAM ON</h4>
              <p className="text-white/25 text-xs mt-auto italic">
                {t("공개 예정", "Details coming soon")}
              </p>
            </motion.div>
          </StaggerItem>

        </StaggerContainer>
      </div>

      {/* 비전 */}
      <FadeUp className="mb-12">
        <div className="glass-card border border-[#6C7CFF]/20 overflow-hidden">

          {/* Brand Line */}
          <div className="p-10 text-center border-b border-white/5">
            <p className="text-[#6C7CFF] text-xs tracking-[0.5em] uppercase mb-6">
              {t("비전", "VISION")}
            </p>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              {t(
                "아이디어를 구조로 만들고, 구조를 경험으로 완성하는 개발 조직이 된다.",
                "To become a development organization that turns ideas into structure, and structure into experience."
              )}
            </p>
            <p className="text-2xl md:text-3xl font-black gradient-text mb-2 tracking-tight">
              We build the unseen.
            </p>
            <p className="text-white/25 text-sm tracking-[0.2em]">
              {t("보이지 않던 가능성을 구축합니다.", "We build the unseen.")}
            </p>
          </div>

          {/* Description */}
          <div className="px-10 py-8 text-center">
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl mx-auto">
              {t(
                "COMET DEVELOPS는 창작과 기술을 연결하여, 아이디어가 실제 서비스와 게임, 시스템으로 완성되는 개발 생태계를 만듭니다.",
                "COMET DEVELOPS connects creativity and technology, building a development ecosystem where ideas are realized as services, games, and systems."
              )}
            </p>
          </div>

        </div>
      </FadeUp>

      {/* CTA */}
      <FadeUp>
        <div className="glass-card p-10 text-center border border-[#6C7CFF]/20 bg-gradient-to-br from-[#080E24]/60 to-transparent">
          <h3 className="text-2xl font-bold text-white mb-4">
            {t("협업 또는 지원 문의", "Collaboration or Support Inquiry")}
          </h3>
          <p className="text-white/50 mb-6 text-sm">
            {t(
              "게임 개발 협업, 배급 파트너십, 기술 지원 등 다양한 문의를 받고 있습니다.",
              "We accept various inquiries including game development collaboration, publishing partnerships, and technical support."
            )}
          </p>
          <motion.a
            href="/contact"
            className="inline-block px-8 py-3 rounded-full bg-[#6C7CFF] hover:bg-[#5a6af0] text-white font-semibold transition-all hover:shadow-lg hover:shadow-[#6C7CFF]/30"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t("문의하기", "Contact Us")}
          </motion.a>
        </div>
      </FadeUp>
    </div>
  );
}
