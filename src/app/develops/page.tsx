"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion, AnimatePresence } from "@/components/Motion";
import { IconGamepad, IconPackage, IconWrench, IconOrbit } from "@/components/icons/LineIcons";

// ── Kinetic Typography ────────────────────────────

const TECH_WORDS = [
  "GAME DEVELOPMENT",
  "WEB SYSTEMS",
  "TECH SUPPORT",
  "SERVICES",
  "IDEAS → STRUCTURE",
];

/** 기술 키워드 부드러운 순환 (blur 크로스페이드) */
function WordCycle() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TECH_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-sm tracking-[0.18em] mt-5 h-5 flex items-center"
      style={{ color: "rgba(108,124,255,0.65)" }}>
      <span style={{ color: "rgba(108,124,255,0.35)" }}>&gt;&nbsp;</span>
      <span className="relative inline-flex">
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="inline-block"
          >
            {TECH_WORDS[idx]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

// ── 상수 ──────────────────────────────────────────
const NAVBAR_H   = 64;
const NUM_SLIDES = 4;

export default function DevelopsPage() {
  const { t } = useLang();
  const outerRef = useRef<HTMLDivElement>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [pinFixed, setPinFixed] = useState(false);
  const [pinDone,  setPinDone]  = useState(false);

  /* ── 스크롤 → 슬라이드 인덱스 계산 ── */
  const calcState = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh   = window.innerHeight;
    const innerH        = vh - NAVBAR_H;
    const totalScrollable = el.offsetHeight - innerH;
    const inPin = rect.top <= NAVBAR_H && rect.bottom > vh;
    const past  = rect.bottom <= vh;
    setPinFixed(inPin);
    setPinDone(past);
    const scrolledInPin = Math.max(NAVBAR_H - rect.top, 0);
    const clamped  = Math.min(scrolledInPin, totalScrollable);
    const progress = totalScrollable > 0 ? clamped / totalScrollable : 0;
    const idx = Math.min(NUM_SLIDES - 1, Math.floor(progress * NUM_SLIDES));
    setSceneIdx(idx);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", calcState, { passive: true });
    window.addEventListener("resize", calcState);
    calcState();
    return () => {
      window.removeEventListener("scroll", calcState);
      window.removeEventListener("resize", calcState);
    };
  }, [calcState]);

  /* ── 5초 자동 슬라이드 ── */
  useEffect(() => {
    if (!pinFixed) return;
    const id = setInterval(() => {
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh   = window.innerHeight;
      const innerH = vh - NAVBAR_H;
      const totalScrollable = el.offsetHeight - innerH;
      const scrollPerSlide  = totalScrollable / NUM_SLIDES;
      const scrolledInPin   = Math.max(NAVBAR_H - rect.top, 0);
      if (scrolledInPin >= totalScrollable - scrollPerSlide * 0.3) return;
      window.scrollBy({ top: scrollPerSlide, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [pinFixed]);

  /* ── 점 클릭 → 슬라이드 이동 ── */
  const jumpToSlide = (idx: number) => {
    const el = outerRef.current;
    if (!el) return;
    const vh   = window.innerHeight;
    const innerH = vh - NAVBAR_H;
    const totalScrollable = el.offsetHeight - innerH;
    const scrollPerSlide  = totalScrollable / NUM_SLIDES;
    window.scrollTo({ top: el.offsetTop - NAVBAR_H + scrollPerSlide * idx + 1, behavior: "smooth" });
  };

  const posStyle: React.CSSProperties = pinFixed
    ? { position: "fixed",    top: NAVBAR_H, left: 0, right: 0 }
    : pinDone
    ? { position: "absolute", bottom: 0,     left: 0, right: 0 }
    : { position: "absolute", top: 0,        left: 0, right: 0 };

  const slideW = `${100 / NUM_SLIDES}%`;

  return (
    <div>

      {/* ══════════════════════════════════════════
          PINNED SCROLL  (4 slides × 100vh)
      ══════════════════════════════════════════ */}
      <div ref={outerRef} style={{ height: `${NUM_SLIDES * 100}vh`, position: "relative" }}>
        <div
          style={{
            ...posStyle,
            height: `calc(100vh - ${NAVBAR_H}px)`,
            overflow: "hidden",
            backgroundColor: "#050814",
          }}
        >
          {/* 슬라이드 트랙 */}
          <div
            className="flex h-full"
            style={{
              width: `${NUM_SLIDES * 100}%`,
              transform: `translateX(-${sceneIdx * (100 / NUM_SLIDES)}%)`,
              transition: "transform 0.7s cubic-bezier(0.45, 0, 0.2, 1)",
            }}
          >

            {/* ── 슬라이드 1 : 히어로 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0 }}
            >
              {/* 배경 */}
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(circle at 70% 28%, rgba(108,124,255,0.34) 0%, transparent 32%),
                  radial-gradient(circle at 18% 78%, rgba(0,212,255,0.13) 0%, transparent 28%),
                  linear-gradient(135deg, #050814 0%, #060f1f 100%)
                `,
              }} />
              {/* 그리드 텍스처 */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(108,124,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,124,255,0.05) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }} />
              {/* 스캔라인 */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                <div className="scanline" />
              </div>

              <div className="relative z-10">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-8"
                  style={{ color: "rgba(108,124,255,0.65)" }}>
                  COMET DEVELOPS
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                  className="font-black tracking-tight mb-3 gradient-text"
                  style={{ fontSize: "clamp(42px, 9.5vw, 128px)" }}
                >
                  COMET
                </motion.h1>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 0.61, 0.36, 1] }}
                  className="font-light tracking-[0.45em] mb-8"
                  style={{ fontSize: "clamp(18px, 2.5vw, 36px)", color: "rgba(108,124,255,0.75)" }}
                >
                  DEVELOPS
                </motion.h2>
                <p className="text-base md:text-lg leading-relaxed max-w-xl mb-2"
                  style={{ color: "rgba(244,247,255,0.5)" }}>
                  {t(
                    "게임이라는 새로운 우주를 개척하고, COMET PRODUCTION의 기술적 가능성을 확장합니다.",
                    "We pioneer a new universe called games, expanding the technological possibilities of COMET PRODUCTION."
                  )}
                </p>
                <WordCycle />
              </div>
            </div>

            {/* ── 슬라이드 2 : 우리가 하는 일 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0, background: "#060b18" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(circle at 80% 50%, rgba(108,124,255,0.09) 0%, transparent 45%)",
              }} />
              {/* 그리드 */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(108,124,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,124,255,0.04) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }} />
              <div className="relative z-10 max-w-5xl w-full">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6"
                  style={{ color: "rgba(108,124,255,0.5)" }}>
                  02 / WHAT WE DO
                </p>
                <h2 className="font-black tracking-tight leading-[0.9] mb-10"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: "#9ba8ff" }}>
                  {t("우리가 하는 일", "WHAT WE DO.")}
                </h2>
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    {
                      Icon: IconGamepad,
                      title: t("게임 개발", "Game Development"),
                      desc:  t("독창적인 게임 콘텐츠를 기획하고 개발합니다. 플레이어에게 새로운 경험을 선사합니다.",
                               "We plan and develop original game content, delivering new experiences to players."),
                    },
                    {
                      Icon: IconPackage,
                      title: t("게임 관리 및 배급", "Game Management & Publishing"),
                      desc:  t("개발된 게임의 서비스 운영, 업데이트 관리, 배급을 전담합니다.",
                               "We are dedicated to service operations, update management, and publishing of developed games."),
                    },
                    {
                      Icon: IconWrench,
                      title: t("KE 그룹 추가 지원", "KE Group Extended Support"),
                      desc:  t("모기업 KE 네트워크 및 계열사에 대한 기술적 개발 지원을 수행합니다.",
                               "We provide technical development support for the parent KE Network and affiliated companies."),
                    },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl p-7 border"
                      style={{ borderColor: "rgba(108,124,255,0.18)", background: "rgba(108,124,255,0.05)" }}>
                      <div
                        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
                        style={{ borderColor: "rgba(108,124,255,0.3)", background: "rgba(108,124,255,0.12)", color: "#9ba8ff" }}
                      >
                        <s.Icon size={22} />
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
                        {s.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 슬라이드 3 : 주요 프로젝트 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0, background: "#060b18" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(circle at 20% 30%, rgba(108,124,255,0.09) 0%, transparent 40%)",
              }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(108,124,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,124,255,0.04) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }} />
              <div className="relative z-10 max-w-5xl w-full">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6"
                  style={{ color: "rgba(108,124,255,0.5)" }}>
                  03 / PROJECTS
                </p>
                <h2 className="font-black tracking-tight leading-[0.9] mb-8"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: "#9ba8ff" }}>
                  {t("개발 작품", "OUR WORKS.")}
                </h2>
                <div className="grid md:grid-cols-3 gap-5 mb-8">
                  {/* HCSiG */}
                  <a href="https://cometodlite.github.io/hacking-code-simulation-game/"
                    target="_blank" rel="noopener noreferrer"
                    className="rounded-2xl p-6 border transition-all hover:border-[#6C7CFF]/50 hover:-translate-y-1 group"
                    style={{ borderColor: "rgba(108,124,255,0.25)", background: "rgba(108,124,255,0.06)" }}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border text-green-300 border-green-500/30 bg-green-500/10">
                        {t("운영 중", "Live")}
                      </span>
                      <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border text-[#9ba8ff] border-[#6C7CFF]/30 bg-[#6C7CFF]/10">
                        {t("웹게임", "Web Game")}
                      </span>
                    </div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-[#9ba8ff] transition-colors">HCSiG</h4>
                    <p className="text-xs mb-2" style={{ color: "rgba(108,124,255,0.6)" }}>
                      {t("해킹코드 시뮬레이션", "Hacking Code Simulation")}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {t("COMET DEVELOPS 첫 번째 작품. 브라우저 웹게임.",
                         "COMET DEVELOPS' first title. Browser web game.")}
                    </p>
                    <p className="text-xs font-semibold mt-3" style={{ color: "#6C7CFF" }}>
                      {t("플레이하기", "Play Now")} →
                    </p>
                  </a>
                  {/* PULSE BLOOM */}
                  <div className="rounded-2xl p-6 border transition-all"
                    style={{ borderColor: "rgba(139,92,246,0.28)", background: "rgba(139,92,246,0.05)" }}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border text-sky-300 border-sky-500/30 bg-sky-500/10">
                        {t("개발 중", "In Dev")}
                      </span>
                      <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">
                        {t("리듬 게임", "Rhythm")}
                      </span>
                    </div>
                    <h4 className="font-bold text-white mb-1">PULSE BLOOM</h4>
                    <p className="text-xs mb-2" style={{ color: "rgba(167,139,250,0.6)" }}>
                      {t("웹 리듬 게임", "Web Rhythm Game")}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {t("노트에 맞춰 꽃을 피우는 모바일 퍼스트 리듬 게임.",
                         "Mobile-first rhythm game where hits bloom flowers.")}
                    </p>
                  </div>
                  {/* PROJECT: HW */}
                  <div className="rounded-2xl p-6 border"
                    style={{ borderColor: "rgba(108,124,255,0.18)", background: "rgba(108,124,255,0.04)" }}>
                    <div className="mb-3">
                      <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">
                        {t("기획 중", "Planning")}
                      </span>
                    </div>
                    <h4 className="font-bold text-white mb-2">PROJECT: HW</h4>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {t("편안한 힐링을 위한.", "For comfortable healing.")}
                    </p>
                  </div>
                </div>
                <a href="#all-projects" className="btn-ghost btn-blue group">
                  {t("전체 프로젝트 보기", "View All Projects")}
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </div>

            {/* ── 슬라이드 4 : 비전 + CTA ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0 }}
            >
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(circle at 70% 35%, rgba(108,124,255,0.22) 0%, transparent 40%),
                  radial-gradient(circle at 20% 70%, rgba(0,212,255,0.10) 0%, transparent 35%),
                  linear-gradient(135deg, #050814 0%, #060f1f 100%)
                `,
              }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(108,124,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,124,255,0.05) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }} />
              <div className="relative z-10 max-w-3xl">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6"
                  style={{ color: "rgba(108,124,255,0.5)" }}>
                  04 / VISION
                </p>
                <h2 className="font-black tracking-tight leading-[0.88] whitespace-pre-line mb-8"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: "#9ba8ff" }}>
                  {"WE BUILD\nTHE UNSEEN."}
                </h2>
                <p className="text-base md:text-lg leading-relaxed max-w-xl mb-3"
                  style={{ color: "rgba(244,247,255,0.5)" }}>
                  {t(
                    "아이디어를 구조로 만들고, 구조를 경험으로 완성하는 개발 조직이 된다.",
                    "To become a development organization that turns ideas into structure, and structure into experience."
                  )}
                </p>
                <p className="text-sm font-mono mb-10" style={{ color: "rgba(108,124,255,0.4)" }}>
                  {"// ideas → structure → experience"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/contact" className="btn-primary">
                    {t("협업 문의하기", "Contact Us")}
                  </Link>
                  <a href="#all-projects" className="btn-ghost btn-blue">
                    {t("전체 프로젝트 보기", "View All Projects")}
                  </a>
                </div>
              </div>
            </div>

          </div>{/* /슬라이드 트랙 */}

          {/* ── 진행 표시 (점) ── */}
          <div className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center gap-2 z-20">
            {Array.from({ length: NUM_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => jumpToSlide(i)}
                className="h-px rounded-full transition-all duration-500 ease-out cursor-pointer"
                style={{
                  width: i === sceneIdx ? "2rem" : "0.5rem",
                  backgroundColor:
                    i === sceneIdx
                      ? "#6C7CFF"
                      : i < sceneIdx
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
            <span className="text-white/15 text-[9px] tracking-[0.4em] uppercase ml-2">
              0{sceneIdx + 1} / 0{NUM_SLIDES}
            </span>
          </div>

        </div>
      </div>
      {/* /PINNED SCROLL */}

      {/* ══════════════════════════════════════════
          전체 프로젝트 (핀 아래)
      ══════════════════════════════════════════ */}
      <section id="all-projects" className="max-w-5xl mx-auto px-6 py-20">

        {/* Origin Banner */}
        <FadeUp className="glass-card p-6 border border-[#6C7CFF]/30 bg-gradient-to-r from-[#080E24]/60 to-transparent mb-16 flex items-start gap-4">
          <span
            className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
            style={{ borderColor: "rgba(108,124,255,0.3)", background: "rgba(108,124,255,0.12)", color: "#9ba8ff" }}
          >
            <IconOrbit size={20} />
          </span>
          <div>
            <p className="text-[#6C7CFF] text-xs tracking-widest uppercase font-semibold mb-1">
              {t("설립 배경", "Background")}
            </p>
            <p className="text-[#86868b] text-sm leading-relaxed">
              {t(
                "COMET DEVELOPS는 COMET PRODUCTION의 새로운 시도 중 '개발'을 목적으로 설립된 자회사입니다. 게임 개발·관리·배급을 주요 사업으로 하며, 모기업인 KE 네트워크에 대한 추가적인 기술 지원도 수행합니다.",
                "COMET DEVELOPS is a subsidiary established for 'development' as one of COMET PRODUCTION's new ventures. Its main businesses are game development, management, and publishing, while also providing additional technical support for the parent KE Network."
              )}
            </p>
          </div>
        </FadeUp>

        {/* 전체 프로젝트 */}
        <FadeUp className="text-center mb-12">
          <p className="text-[#6C7CFF] text-xs tracking-[0.5em] uppercase mb-3">
            {t("전체 프로젝트", "ALL PROJECTS")}
          </p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {t("개발 작품", "Our Works")}
          </h3>
        </FadeUp>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">

          {/* HCSiG */}
          <StaggerItem>
            <motion.a href="https://cometodlite.github.io/hacking-code-simulation-game/"
              target="_blank" rel="noopener noreferrer"
              className="group block h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
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
                <p className="text-[#86868b]/80 text-xs leading-relaxed mb-5">
                  {t("COMET DEVELOPS의 첫 번째 개발 작품. 브라우저에서 즐기는 해킹코드 시뮬레이션 웹게임.",
                     "COMET DEVELOPS' first title. A hacking code simulation web game playable in your browser.")}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6C7CFF] group-hover:gap-2.5 transition-all">
                  {t("플레이하기", "Play Now")} →
                </div>
              </div>
            </motion.a>
          </StaggerItem>

          {/* PULSE BLOOM */}
          <StaggerItem>
            <motion.div className="glass-card border border-violet-500/25 bg-gradient-to-b from-violet-950/20 to-transparent p-6 h-full hover:border-violet-500/50 transition-all"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-sky-300 border-sky-500/30 bg-sky-500/10">
                  {t("개발 중", "In Development")}
                </span>
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">
                  {t("리듬 게임", "Rhythm Game")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">PULSE BLOOM</h4>
              <p className="text-violet-400/70 text-xs mb-3">{t("웹 리듬 게임", "Web Rhythm Game")}</p>
              <p className="text-[#86868b]/80 text-xs leading-relaxed">
                {t(
                  "노트에 맞춰 꽃을 피우는 모바일 퍼스트 웹 리듬 게임. 타점마다 꽃잎이 피어오르는 오리지널 브라우저 리듬 경험.",
                  "A mobile-first web rhythm game where hitting notes blooms flowers. An original browser rhythm experience — every tap blooms a petal."
                )}
              </p>
            </motion.div>
          </StaggerItem>

          {/* PROJECT: HW */}
          <StaggerItem>
            <motion.div className="glass-card border border-[#6C7CFF]/20 bg-gradient-to-b from-[#080E24]/20 to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
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

          {/* UTOPIA SYNDROME */}
          <StaggerItem>
            <motion.div className="glass-card border border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-white/30 border-white/10 bg-white/5">
                  {t("미공개", "Unrevealed")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white/70 mb-1">UTOPIA SYNDROME</h4>
              <p className="text-white/35 text-xs mb-3">
                {t("2D 픽셀 SCP풍 생존 웹게임", "2D Pixel SCP-style Survival Web Game")}
              </p>
              <p className="text-white/25 text-xs italic">
                {t("공개 예정", "Details coming soon")}
              </p>
            </motion.div>
          </StaggerItem>

          {/* DREAM ON */}
          <StaggerItem>
            <motion.div className="glass-card border border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent p-6 h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border text-white/30 border-white/10 bg-white/5">
                  {t("미공개", "Unrevealed")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white/70 mb-1">DREAM ON</h4>
              <p className="text-white/25 text-xs italic">
                {t("공개 예정", "Details coming soon")}
              </p>
            </motion.div>
          </StaggerItem>

        </StaggerContainer>
      </section>

      {/* ── EDU 브릿지 ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <FadeUp>
          <Link
            href="/edu"
            className="group flex items-center justify-between gap-6 rounded-2xl border px-8 py-7 transition-all duration-300"
            style={{
              borderColor: "rgba(0,184,150,0.22)",
              background: "rgba(0,184,150,0.04)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,184,150,0.48)";
              (e.currentTarget as HTMLAnchorElement).style.background  = "rgba(0,184,150,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,184,150,0.22)";
              (e.currentTarget as HTMLAnchorElement).style.background  = "rgba(0,184,150,0.04)";
            }}
          >
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase mb-1.5 font-semibold"
                style={{ color: "rgba(0,184,150,0.55)" }}>
                COMET EDU
              </p>
              <p className="text-white font-semibold text-base mb-1">
                {t("EDU로 이동할 수 있습니다.", "Go to COMET EDU.")}
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Learning Shapes Your Future Path.
              </p>
            </div>
            <span
              className="flex-shrink-0 text-2xl transition-all duration-300 group-hover:translate-x-1"
              style={{ color: "rgba(0,184,150,0.5)" }}
            >
              →
            </span>
          </Link>
        </FadeUp>
      </section>

    </div>
  );
}
