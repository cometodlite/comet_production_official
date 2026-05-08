"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";

// ── 씬 정의 ──────────────────────────────────────────
type Brand = "entertainers" | "develops" | "both";

type BrandScene = {
  brand: Brand;
  ko: { kicker: string; title: string; sub: string; link?: string; href?: string };
  en: { kicker: string; title: string; sub: string; link?: string; href?: string };
};

const scenes: BrandScene[] = [
  {
    brand: "entertainers",
    ko: {
      kicker: "COMET ENTERTAINERS",
      title: "LET TALENT\nBECOME LIGHT.",
      sub: "예술, 방송, 음악, 캐릭터.\n재능이 하나의 무대가 되도록.",
      link: "ENTERTAINERS 보기",
      href: "/entertainers",
    },
    en: {
      kicker: "COMET ENTERTAINERS",
      title: "LET TALENT\nBECOME LIGHT.",
      sub: "Art, broadcasting, music, characters.\nWhere talent becomes a stage.",
      link: "Explore Entertainers",
      href: "/entertainers",
    },
  },
  {
    brand: "entertainers",
    ko: {
      kicker: "COMET ENTERTAINERS",
      title: "INGENIUM\nATQUE LABOR.",
      sub: "재능과 노력은\nCOMET ENTERTAINERS의 가장 선명한 빛입니다.",
      link: "아티스트 만나기",
      href: "/entertainers",
    },
    en: {
      kicker: "COMET ENTERTAINERS",
      title: "INGENIUM\nATQUE LABOR.",
      sub: "Talent and labor are\nCOMET ENTERTAINERS' brightest light.",
      link: "Meet Our Artists",
      href: "/entertainers",
    },
  },
  {
    brand: "develops",
    ko: {
      kicker: "COMET DEVELOPS",
      title: "WE BUILD\nTHE UNSEEN.",
      sub: "기술, 게임, 시스템, 서비스.\n보이지 않던 가능성을 구조로 만듭니다.",
      link: "DEVELOPS 보기",
      href: "/develops",
    },
    en: {
      kicker: "COMET DEVELOPS",
      title: "WE BUILD\nTHE UNSEEN.",
      sub: "Technology, games, systems, services.\nWe turn invisible potential into structure.",
      link: "Explore Develops",
      href: "/develops",
    },
  },
  {
    brand: "develops",
    ko: {
      kicker: "COMET DEVELOPS",
      title: "IDEAS\nINTO SYSTEMS.",
      sub: "아이디어를 구조로 만들고,\n구조를 경험으로 완성합니다.",
      link: "프로젝트 보기",
      href: "/develops",
    },
    en: {
      kicker: "COMET DEVELOPS",
      title: "IDEAS\nINTO SYSTEMS.",
      sub: "We turn ideas into structure,\nand structure into experience.",
      link: "View Projects",
      href: "/develops",
    },
  },
  {
    brand: "both",
    ko: {
      kicker: "COMET PRODUCTION",
      title: "TWO DIRECTIONS.\nONE PRODUCTION.",
      sub: "COMET ENTERTAINERS · COMET DEVELOPS\n두 방향이 하나의 제작 조직으로.",
    },
    en: {
      kicker: "COMET PRODUCTION",
      title: "TWO DIRECTIONS.\nONE PRODUCTION.",
      sub: "COMET ENTERTAINERS · COMET DEVELOPS\nTwo directions, one production.",
    },
  },
];

// 브랜드별 색상 값
const COLORS = {
  entertainers: {
    kicker: "rgba(200,168,106,0.75)",
    title: "#FFE6A6",
    sub: "rgba(248,244,234,0.65)",
    dot: "#C8A86A",
    link: "#C8A86A",
    linkBorder: "rgba(200,168,106,0.45)",
  },
  develops: {
    kicker: "rgba(108,124,255,0.85)",
    title: "#9ba8ff",
    sub: "rgba(244,247,255,0.6)",
    dot: "#6C7CFF",
    link: "#6C7CFF",
    linkBorder: "rgba(108,124,255,0.5)",
  },
  both: {
    kicker: "rgba(255,255,255,0.35)",
    title: undefined, // gradient-text 클래스 사용
    sub: "rgba(255,255,255,0.45)",
    dot: "#a78bfa",
    link: "",
    linkBorder: "",
  },
} as const;

const NAVBAR_H = 64;

// ── 컴포넌트 ──────────────────────────────────────────
export default function BrandShowcase() {
  const { lang } = useLang();
  const outerRef = useRef<HTMLDivElement>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [pinFixed, setPinFixed] = useState(false);
  const [pinDone, setPinDone] = useState(false);

  const calcState = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const innerH = vh - NAVBAR_H;
    const totalScrollable = el.offsetHeight - innerH;

    const inPin = rect.top <= NAVBAR_H && rect.bottom > vh;
    const past  = rect.bottom <= vh;

    setPinFixed(inPin);
    setPinDone(past);

    const scrolledInPin = Math.max(NAVBAR_H - rect.top, 0);
    const clamped  = Math.min(scrolledInPin, totalScrollable);
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

  const scene   = scenes[sceneIdx];
  const content = lang === "ko" ? scene.ko : scene.en;
  const colors  = COLORS[scene.brand];

  // 배경 레이어 투명도
  const entOpacity = scene.brand === "entertainers" ? 1 : scene.brand === "both" ? 0.4 : 0;
  const devOpacity = scene.brand === "develops"     ? 1 : scene.brand === "both" ? 0.4 : 0;

  // 위치 스타일 (PinnedHero와 동일한 fixed/absolute 로직)
  const posStyle: React.CSSProperties = pinFixed
    ? { position: "fixed",    top: NAVBAR_H, left: 0, right: 0 }
    : pinDone
    ? { position: "absolute", bottom: 0,     left: 0, right: 0 }
    : { position: "absolute", top: 0,        left: 0, right: 0 };

  return (
    /* 스크롤 공간: 5씬 × ~90vh */
    <div ref={outerRef} style={{ height: "500vh", position: "relative" }}>

      {/* 핀 패널 */}
      <div
        style={{
          ...posStyle,
          height: `calc(100vh - ${NAVBAR_H}px)`,
          overflow: "hidden",
          backgroundColor: "#000000",
        }}
      >
        {/* ── ENTERTAINERS 배경 ── */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: entOpacity,
            background: `
              radial-gradient(circle at 72% 30%, rgba(200,168,106,0.30) 0%, transparent 32%),
              radial-gradient(circle at 20% 78%, rgba(255,230,166,0.13) 0%, transparent 28%),
              linear-gradient(135deg, #070604 0%, #130d08 100%)
            `,
          }}
        />

        {/* ── DEVELOPS 배경 ── */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: devOpacity,
            background: `
              radial-gradient(circle at 70% 28%, rgba(108,124,255,0.34) 0%, transparent 32%),
              radial-gradient(circle at 18% 78%, rgba(0,212,255,0.13) 0%, transparent 28%),
              linear-gradient(135deg, #050814 0%, #060f1f 100%)
            `,
          }}
        />

        {/* ── BOTH 배경 (TWO DIRECTIONS.) ── */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: scene.brand === "both" ? 1 : 0,
            background: `
              radial-gradient(ellipse 55% 45% at 25% 40%, rgba(200,168,106,0.12) 0%, transparent 50%),
              radial-gradient(ellipse 55% 45% at 75% 60%, rgba(108,124,255,0.12) 0%, transparent 50%),
              linear-gradient(135deg, #070509 0%, #070b14 100%)
            `,
          }}
        />

        {/* ── 콘텐츠 ── */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">

          {/* 킥커 */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`k-${sceneIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[10px] tracking-[0.55em] uppercase mb-8 md:mb-10"
              style={{ color: colors.kicker }}
            >
              {content.kicker}
            </motion.p>
          </AnimatePresence>

          {/* 타이틀 */}
          <div className="mb-7 md:mb-9">
            <AnimatePresence mode="wait">
              <motion.h2
                key={`t-${sceneIdx}-${lang}`}
                initial={{ opacity: 0, y: 32, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
                exit={{ opacity: 0,    y: -24, filter: "blur(8px)"  }}
                transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                className={`font-black tracking-tight leading-[0.88] whitespace-pre-line ${
                  scene.brand === "both" ? "gradient-text" : ""
                }`}
                style={{
                  fontSize: "clamp(42px, 9.5vw, 128px)",
                  ...(scene.brand !== "both" && { color: colors.title }),
                }}
              >
                {content.title}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* 서브 텍스트 */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`s-${sceneIdx}-${lang}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0,    y: -10 }}
              transition={{ duration: 0.34, ease: "easeOut", delay: 0.07 }}
              className="text-base md:text-lg leading-relaxed max-w-xl whitespace-pre-line mb-10"
              style={{ color: colors.sub }}
            >
              {content.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTA 링크 */}
          <AnimatePresence>
            {content.link && content.href && (
              <motion.div
                key={`l-${sceneIdx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{ opacity: 0,    y: 8  }}
                transition={{ duration: 0.3, delay: 0.18 }}
              >
                <Link
                  href={content.href}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full border text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    color: colors.link,
                    borderColor: colors.linkBorder,
                  }}
                >
                  {content.link}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 씬 진행 표시 ── */}
        <div className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center gap-2 z-10">
          {scenes.map((s, i) => (
            <div
              key={i}
              className="h-px rounded-full transition-all duration-500 ease-out"
              style={{
                width: i === sceneIdx ? "2rem" : "0.5rem",
                backgroundColor:
                  i === sceneIdx
                    ? COLORS[s.brand].dot
                    : i < sceneIdx
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
          <span className="text-white/15 text-[9px] tracking-[0.4em] uppercase ml-2">
            0{sceneIdx + 1} / 0{scenes.length}
          </span>
        </div>
      </div>
    </div>
  );
}
