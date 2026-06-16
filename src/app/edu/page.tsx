"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, motion } from "@/components/Motion";
import { IconDocument, IconFileSearch, IconRocket } from "@/components/icons/LineIcons";

const EDU_HEX = "#00B896";
const EDU = (a: number) => `rgba(0,184,150,${a})`;

const NAVBAR_H = 64;
const NUM_SLIDES = 3;

export default function EduPage() {
  const { t } = useLang();
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
    const past = rect.bottom <= vh;
    setPinFixed(inPin);
    setPinDone(past);
    const scrolledInPin = Math.max(NAVBAR_H - rect.top, 0);
    const clamped = Math.min(scrolledInPin, totalScrollable);
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

  useEffect(() => {
    if (!pinFixed) return;
    const id = setInterval(() => {
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const innerH = vh - NAVBAR_H;
      const totalScrollable = el.offsetHeight - innerH;
      const scrollPerSlide = totalScrollable / NUM_SLIDES;
      const scrolledInPin = Math.max(NAVBAR_H - rect.top, 0);
      if (scrolledInPin >= totalScrollable - scrollPerSlide * 0.3) return;
      window.scrollBy({ top: scrollPerSlide, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [pinFixed]);

  const jumpToSlide = (idx: number) => {
    const el = outerRef.current;
    if (!el) return;
    const vh = window.innerHeight;
    const innerH = vh - NAVBAR_H;
    const totalScrollable = el.offsetHeight - innerH;
    const scrollPerSlide = totalScrollable / NUM_SLIDES;
    window.scrollTo({ top: el.offsetTop - NAVBAR_H + scrollPerSlide * idx + 1, behavior: "smooth" });
  };

  const posStyle: React.CSSProperties = pinFixed
    ? { position: "fixed", top: NAVBAR_H, left: 0, right: 0 }
    : pinDone
    ? { position: "absolute", bottom: 0, left: 0, right: 0 }
    : { position: "absolute", top: 0, left: 0, right: 0 };

  const slideW = `${100 / NUM_SLIDES}%`;

  return (
    <div>
      <div ref={outerRef} style={{ height: `${NUM_SLIDES * 100}vh`, position: "relative" }}>
        <div
          style={{
            ...posStyle,
            height: `calc(100vh - ${NAVBAR_H}px)`,
            overflow: "hidden",
            backgroundColor: "#05100e",
          }}
        >
          <div
            className="flex h-full"
            style={{
              width: `${NUM_SLIDES * 100}%`,
              transform: `translateX(-${sceneIdx * (100 / NUM_SLIDES)}%)`,
              transition: "transform 0.7s cubic-bezier(0.45, 0, 0.2, 1)",
            }}
          >

            {/* ── 슬라이드 1: 히어로 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0 }}
            >
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(circle at 68% 26%, ${EDU(0.30)} 0%, transparent 32%),
                  radial-gradient(circle at 18% 76%, rgba(0,212,180,0.10) 0%, transparent 28%),
                  linear-gradient(135deg, #05100e 0%, #061812 100%)
                `,
              }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${EDU(0.05)} 1px, transparent 1px), linear-gradient(90deg, ${EDU(0.05)} 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }} />

              <div className="relative z-10">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-8" style={{ color: EDU(0.65) }}>
                  COMET EDU
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                  className="font-black tracking-tight mb-4"
                  style={{ fontSize: "clamp(42px, 9.5vw, 128px)", color: EDU_HEX }}
                >
                  EDU
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 0.61, 0.36, 1] }}
                  className="font-light tracking-[0.22em] mb-8 uppercase"
                  style={{ fontSize: "clamp(13px, 1.6vw, 22px)", color: EDU(0.7) }}
                >
                  Learning Shapes Your Future Path.
                </motion.p>
                <p className="text-base md:text-lg leading-relaxed max-w-xl"
                  style={{ color: "rgba(236,255,250,0.42)" }}>
                  {t(
                    "COMET PRODUCTION 산하 교육 웹플랫폼. 사내 교육과 실력 향상을 통해 더 나은 미래를 만들어갑니다.",
                    "COMET PRODUCTION's education web platform. Building a better future through in-house education and skill development."
                  )}
                </p>
              </div>
            </div>

            {/* ── 슬라이드 2: 우리가 바라는 것 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0, background: "#061410" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(circle at 80% 50%, ${EDU(0.08)} 0%, transparent 45%)`,
              }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${EDU(0.04)} 1px, transparent 1px), linear-gradient(90deg, ${EDU(0.04)} 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }} />
              <div className="relative z-10 max-w-5xl w-full">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6" style={{ color: EDU(0.5) }}>
                  02 / WHAT WE ASPIRE TO
                </p>
                <h2 className="font-black tracking-tight leading-[0.9] mb-10"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: EDU_HEX }}>
                  {t("우리가 바라는 것", "WHAT WE ASPIRE TO.")}
                </h2>
                <div className="grid md:grid-cols-3 gap-5">
                  {([
                    {
                      Icon: IconDocument,
                      title: t("사내 교육 전문", "Internal Education"),
                      desc: t(
                        "COMET PRODUCTION 구성원을 위한 체계적인 사내 교육 프로그램을 전문적으로 운영합니다.",
                        "We specialize in systematic internal education programs for COMET PRODUCTION members."
                      ),
                    },
                    {
                      Icon: IconFileSearch,
                      title: t("문제 풀이", "Problem Solving"),
                      desc: t(
                        "실전 문제 풀이를 통해 이론을 넘어 진짜 응용 능력을 기릅니다.",
                        "We develop real applied skills beyond theory through hands-on problem solving."
                      ),
                    },
                    {
                      Icon: IconRocket,
                      title: t("실력 상승", "Skill Enhancement"),
                      desc: t(
                        "지속적인 학습과 평가를 통해 구성원 모두가 성장할 수 있는 환경을 만듭니다.",
                        "We create an environment where every member can grow through continuous learning and assessment."
                      ),
                    },
                  ] as const).map((s, i) => (
                    <div key={i} className="rounded-2xl p-7 border"
                      style={{ borderColor: EDU(0.20), background: EDU(0.05) }}>
                      <div
                        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
                        style={{ borderColor: EDU(0.32), background: EDU(0.12), color: EDU_HEX }}
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

            {/* ── 슬라이드 3: 비전 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0 }}
            >
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(circle at 70% 35%, ${EDU(0.20)} 0%, transparent 40%),
                  radial-gradient(circle at 20% 70%, rgba(0,212,180,0.08) 0%, transparent 35%),
                  linear-gradient(135deg, #05100e 0%, #061812 100%)
                `,
              }} />
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${EDU(0.05)} 1px, transparent 1px), linear-gradient(90deg, ${EDU(0.05)} 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }} />
              <div className="relative z-10 max-w-3xl">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6" style={{ color: EDU(0.5) }}>
                  03 / VISION
                </p>
                <h2 className="font-black tracking-tight leading-[0.9] whitespace-pre-line mb-8"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: EDU_HEX }}>
                  {"A WORLD WHERE\nEVERY LEARNING\nBECOMES A PATH."}
                </h2>
                <p className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
                  style={{ color: "rgba(236,255,250,0.45)" }}>
                  {t(
                    "모든 배움이 길이 되는 세상. COMET EDU는 그 세상을 만들기 위해 존재합니다.",
                    "A world where every learning becomes a path. COMET EDU exists to build that world."
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/develops" className="btn-primary"
                    style={{
                      "--btn-bg": EDU_HEX,
                      "--btn-bg-hover": "#00d4ae",
                      "--btn-fg": "#031a14",
                      "--btn-glow": EDU(0.35),
                    } as React.CSSProperties}
                  >
                    {t("DEVELOPS로 돌아가기", "← Back to DEVELOPS")}
                  </Link>
                  <Link href="/contact" className="btn-ghost">
                    {t("문의하기", "Contact Us")}
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* 진행 표시 (점) */}
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
                      ? EDU_HEX
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

      {/* 하단 — DEVELOPS 복귀 */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <FadeUp>
          <p className="text-xs tracking-[0.5em] uppercase mb-3" style={{ color: EDU(0.45) }}>
            COMET EDU
          </p>
          <p className="text-white/25 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            {t(
              "COMET EDU는 내부 구성원을 위한 교육 플랫폼으로, COMET DEVELOPS를 통해 접근할 수 있습니다.",
              "COMET EDU is an internal education platform accessible through COMET DEVELOPS."
            )}
          </p>
          <Link href="/develops" className="btn-ghost">
            {t("← DEVELOPS로 돌아가기", "← Back to DEVELOPS")}
          </Link>
        </FadeUp>
      </section>
    </div>
  );
}
