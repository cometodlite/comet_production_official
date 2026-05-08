"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";

// ── 씬 정의 ──────────────────────────────────────────
type Scene = {
  ko: { title: string; sub: string };
  en: { title: string; sub: string };
  gradient: boolean;
};

const scenes: Scene[] = [
  {
    ko: { title: "COMET\nPRODUCTION", sub: "우리는 가능성을 제작합니다." },
    en: { title: "COMET\nPRODUCTION", sub: "We produce possibility." },
    gradient: false,
  },
  {
    ko: {
      title: "WE PRODUCE\nPOSSIBILITY.",
      sub: "재능을 발견하고, 창작을 실현하며,\n사람과 가능성을 연결합니다.",
    },
    en: {
      title: "WE PRODUCE\nPOSSIBILITY.",
      sub: "Discover talent, realize creation —\nconnecting people and possibility.",
    },
    gradient: true,
  },
  {
    ko: {
      title: "TALENT.\nCARE.",
      sub: "사람의 가능성을 발견하고,\n오래 성장할 수 있는 환경을 만듭니다.",
    },
    en: {
      title: "TALENT.\nCARE.",
      sub: "We discover potential in people\nand build an environment for lasting growth.",
    },
    gradient: true,
  },
  {
    ko: {
      title: "KNOWLEDGE.\nCONNECTION.",
      sub: "지식과 연결을 통해 창작이\n실제 프로젝트가 되도록 돕습니다.",
    },
    en: {
      title: "KNOWLEDGE.\nCONNECTION.",
      sub: "Through knowledge and connection,\nwe help creation become real projects.",
    },
    gradient: true,
  },
];

const NAVBAR_H = 64; // px — navbar h-16

// ── 컴포넌트 ──────────────────────────────────────────
export default function PinnedHero() {
  const { lang, t } = useLang();
  const outerRef = useRef<HTMLDivElement>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  // CSS sticky 대신 position: fixed + JS 제어 (모든 브라우저 호환)
  const [pinFixed, setPinFixed] = useState(true);
  const [pinDone, setPinDone] = useState(false);

  const calcState = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const innerH = vh - NAVBAR_H; // 패널 높이
    const totalScrollable = el.offsetHeight - innerH;

    // 핀 구간: outer 상단이 navbar 기준선 이하이고, outer 하단이 뷰포트를 아직 넘지 않았을 때
    const inPin = rect.top <= NAVBAR_H && rect.bottom > vh;
    const past  = rect.bottom <= vh;

    setPinFixed(inPin);
    setPinDone(past);

    // 씬 인덱스 계산
    const scrolledInPin = Math.max(NAVBAR_H - rect.top, 0);
    const clamped = Math.min(scrolledInPin, totalScrollable);
    const progress = totalScrollable > 0 ? clamped / totalScrollable : 0;
    const idx = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
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

  const scene  = scenes[sceneIdx];
  const title  = lang === "ko" ? scene.ko.title : scene.en.title;
  const sub    = lang === "ko" ? scene.ko.sub   : scene.en.sub;
  const isLast = sceneIdx === scenes.length - 1;

  // 위치 스타일: fixed(핀 중) → absolute bottom-0(핀 끝) → absolute top-0(핀 전)
  const posStyle: React.CSSProperties = pinFixed
    ? { position: "fixed",    top: NAVBAR_H, left: 0, right: 0 }
    : pinDone
    ? { position: "absolute", bottom: 0,     left: 0, right: 0 }
    : { position: "absolute", top: 0,        left: 0, right: 0 };

  return (
    /* 외부: 스크롤 공간 확보 (씬당 ~75vh) */
    <div ref={outerRef} style={{ height: "400vh", position: "relative" }}>

      {/* 핀 패널 */}
      <div
        className="flex flex-col justify-center px-8 md:px-16 lg:px-24"
        style={{
          ...posStyle,
          height: `calc(100vh - ${NAVBAR_H}px)`,
          backgroundColor: "var(--background)",
        }}
      >
        {/* ── 배경 글로우 ── */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          aria-hidden
          style={{
            background: scene.gradient
              ? "radial-gradient(ellipse 70% 55% at 45% 35%, rgba(99,102,241,0.15) 0%, transparent 70%)"
              : "radial-gradient(ellipse 70% 55% at 45% 35%, rgba(99,102,241,0.07) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* ── 킥커 레이블 ── */}
        <motion.p
          className="text-white/25 text-[10px] tracking-[0.7em] uppercase mb-8 md:mb-10 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          COMET PRODUCTION · KE NETWORK
        </motion.p>

        {/* ── 메인 타이틀 ── */}
        <div className="mb-6 md:mb-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${sceneIdx}-${lang}`}
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
              exit={{ opacity: 0,    y: -22, filter: "blur(8px)"  }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={`font-black tracking-tight leading-[0.88] whitespace-pre-line ${
                scene.gradient ? "gradient-text" : "text-white"
              }`}
              style={{ fontSize: "clamp(42px, 9.5vw, 128px)" }}
            >
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* ── 서브 텍스트 ── */}
        <div className="relative z-10 mb-8 md:mb-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${sceneIdx}-${lang}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0,    y: -10 }}
              transition={{ duration: 0.34, ease: "easeOut", delay: 0.07 }}
              className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl whitespace-pre-line"
            >
              {sub}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── 씬 진행 표시 ── */}
        <div className="flex items-center gap-2 relative z-10">
          {scenes.map((_, i) => (
            <div
              key={i}
              className="h-px rounded-full transition-all duration-500 ease-out"
              style={{
                width: i === sceneIdx ? "2rem" : "0.75rem",
                backgroundColor:
                  i === sceneIdx
                    ? "#6C7CFF"
                    : i < sceneIdx
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
          <span className="text-white/15 text-[9px] tracking-[0.4em] uppercase ml-2">
            0{sceneIdx + 1} / 0{scenes.length}
          </span>
        </div>

        {/* ── CTA (마지막 씬에만) ── */}
        <AnimatePresence>
          {isLast && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0,    y: 8  }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 relative z-10"
            >
              <Link
                href="/about"
                className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 text-center"
              >
                {t("회사 소개", "About Us")}
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3 rounded-full border border-white/20 hover:border-indigo-400 text-white/70 hover:text-white text-sm font-medium transition-all text-center"
              >
                {t("문의하기", "Contact")}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 스크롤 인디케이터 (첫 씬만) ── */}
        <AnimatePresence>
          {sceneIdx === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-3 text-white/20 animate-float"
            >
              <span
                className="text-[9px] tracking-[0.6em] uppercase"
                style={{ writingMode: "vertical-rl" }}
              >
                SCROLL
              </span>
              <div className="w-px h-14 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
