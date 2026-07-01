"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";
import { IconSparkle, IconGem, IconRocket, IconDocument } from "@/components/icons/LineIcons";

const NAVBAR_H  = 64;
const NUM_SLIDES = 4;

export default function EntertainersPage() {
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
            backgroundColor: "#100b07",
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
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(circle at 72% 30%, rgba(200,168,106,0.30) 0%, transparent 32%),
                  radial-gradient(circle at 20% 78%, rgba(255,230,166,0.13) 0%, transparent 28%),
                  linear-gradient(135deg, #070604 0%, #130d08 100%)
                `,
              }} />
              <div className="relative z-10">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-8"
                  style={{ color: "rgba(200,168,106,0.65)" }}>
                  COMET ENTERTAINERS
                </p>

                <h1 className="font-black tracking-tight leading-[0.88] whitespace-pre-line mb-7"
                  style={{ fontSize: "clamp(42px, 9.5vw, 128px)", color: "#FFE6A6" }}>
                  {"LET TALENT\nBECOME LIGHT."}
                </h1>

                <motion.h2
                  className="text-2xl md:text-3xl font-light tracking-[0.45em] mb-8"
                  style={{ color: "rgba(200,168,106,0.7)" }}
                  variants={{ visible: { transition: { staggerChildren: 0.055, delayChildren: 0.3 } } }}
                  initial="hidden"
                  animate="visible"
                >
                  {"ENTERTAINERS".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      variants={{
                        hidden:  { opacity: 0, y: 16, filter: "blur(6px)"  },
                        visible: { opacity: 1, y: 0,  filter: "blur(0px)",
                          transition: { duration: 0.36, ease: [0.2, 0, 0.2, 1] } },
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h2>

                <p className="text-sm italic" style={{ color: "rgba(200,168,106,0.35)" }}>
                  Ingenium atque labor lux veritatis.
                </p>
              </div>

              {/* 마키 */}
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t"
                style={{ borderColor: "rgba(200,168,106,0.08)" }}>
                <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
                  style={{ background: "linear-gradient(to right, #100b07, transparent)" }} />
                <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
                  style={{ background: "linear-gradient(to left, #100b07, transparent)" }} />
                <div className="flex animate-marquee w-max py-2.5">
                  {[0, 1].map((ri) => (
                    <span key={ri} className="flex items-center">
                      {["ART","BROADCAST","MUSIC","CHARACTER","PERFORMANCE","TALENT","CREATION","ENTERTAINMENT"].map((word) => (
                        <span key={word} className="flex items-center">
                          <span className="text-[9px] tracking-[0.6em] uppercase mx-7"
                            style={{ color: "rgba(200,168,106,0.3)" }}>{word}</span>
                          <span className="text-[8px]" style={{ color: "rgba(200,168,106,0.12)" }}>✦</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 슬라이드 2 : 우리가 하는 일 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0, background: "#0e0a06" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(circle at 15% 50%, rgba(200,168,106,0.09) 0%, transparent 45%)",
              }} />
              <div className="relative z-10 max-w-5xl w-full">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6"
                  style={{ color: "rgba(200,168,106,0.5)" }}>
                  02 / WHAT WE DO
                </p>
                <h2 className="font-black tracking-tight leading-[0.9] mb-10"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: "#FFE6A6" }}>
                  {t("우리가 하는 일", "WHAT WE DO.")}
                </h2>
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    {
                      Icon: IconSparkle,
                      title: t("아티스트 발굴", "Artist Discovery"),
                      desc:  t("잠재력 있는 아티스트를 발굴하고 성장할 수 있는 환경을 제공합니다.",
                               "We discover artists with potential and provide an environment for them to grow."),
                    },
                    {
                      Icon: IconGem,
                      title: t("아티스트 관리", "Artist Management"),
                      desc:  t("아티스트의 커리어 전반을 체계적으로 관리하고 지원합니다.",
                               "We systematically manage and support every aspect of an artist's career."),
                    },
                    {
                      Icon: IconRocket,
                      title: t("아티스트 지원", "Artist Support"),
                      desc:  t("프로모션, 콘텐츠 제작, 팬 커뮤니티 운영 등 다양한 지원을 제공합니다.",
                               "We provide diverse support including promotion, content creation, and fan community management."),
                    },
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl p-7 border"
                      style={{ borderColor: "rgba(200,168,106,0.18)", background: "rgba(200,168,106,0.04)" }}>
                      <div
                        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
                        style={{ borderColor: "rgba(200,168,106,0.3)", background: "rgba(200,168,106,0.1)", color: "#C8A86A" }}
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

            {/* ── 슬라이드 3 : 주요 아티스트 ── */}
            <div
              className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24"
              style={{ width: slideW, flexShrink: 0, background: "#0e0a06" }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(circle at 80% 25%, rgba(200,168,106,0.09) 0%, transparent 40%)",
              }} />
              <div className="relative z-10 max-w-5xl w-full">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6"
                  style={{ color: "rgba(200,168,106,0.5)" }}>
                  03 / ARTISTS
                </p>
                <h2 className="font-black tracking-tight leading-[0.9] mb-8"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: "#FFE6A6" }}>
                  {t("소속 아티스트", "OUR ARTISTS.")}
                </h2>
                <div className="grid md:grid-cols-3 gap-5 mb-8">
                  {[
                    { img: "/artist-ojiter.png", name: "고구마오지터", role: "BROADCASTER", gen: "COMET LIVE 2기" },
                    { img: "/artist-parker.png", name: "주황파커",     role: "YOUTUBER",   gen: "COMET LIVE 2기" },
                    { img: "/theme.png",          name: "테마",         role: "BROADCASTER", gen: "COMET LIVE 2기" },
                  ].map((a) => (
                    <div key={a.name} className="rounded-2xl p-6 border flex items-center gap-4"
                      style={{ borderColor: "rgba(200,168,106,0.2)", background: "rgba(200,168,106,0.04)" }}>
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 shrink-0"
                        style={{ borderColor: "rgba(200,168,106,0.4)" }}>
                        <Image src={a.img} alt={a.name} width={56} height={56}
                          className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{a.name}</p>
                        <p className="text-xs tracking-widest mt-0.5" style={{ color: "#C8A86A" }}>{a.role}</p>
                        <span className="text-[10px] tracking-widest px-2 py-0.5 rounded-full border mt-2 inline-block"
                          style={{ color: "#e8cfa0", borderColor: "rgba(200,168,106,0.3)", background: "rgba(200,168,106,0.1)" }}>
                          {a.gen}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#all-artists" className="btn-ghost btn-gold group">
                  {t("전체 아티스트 보기", "View All Artists")}
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
                  radial-gradient(circle at 30% 40%, rgba(200,168,106,0.16) 0%, transparent 40%),
                  linear-gradient(135deg, #070604 0%, #130d08 100%)
                `,
              }} />
              <div className="relative z-10 max-w-3xl">
                <p className="text-[10px] tracking-[0.55em] uppercase mb-6"
                  style={{ color: "rgba(200,168,106,0.5)" }}>
                  04 / VISION
                </p>
                <h2 className="font-black tracking-tight leading-[0.88] whitespace-pre-line mb-8"
                  style={{ fontSize: "clamp(30px, 5.5vw, 72px)", color: "#FFE6A6" }}>
                  {"LET TALENT\nBECOME LIGHT."}
                </h2>
                <p className="text-base md:text-lg leading-relaxed max-w-xl mb-3"
                  style={{ color: "rgba(248,244,234,0.52)" }}>
                  {t(
                    "재능 있는 창작자와 엔터테이너가 자신만의 빛으로 성장하고, 더 넓은 무대와 연결되는 창작 생태계를 만든다.",
                    "To build a creative ecosystem where talented creators and entertainers grow with their own light and connect to a wider stage."
                  )}
                </p>
                <p className="text-sm italic mb-10" style={{ color: "rgba(200,168,106,0.38)" }}>
                  Ingenium atque labor lux veritatis.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/contact" className="btn-primary btn-gold">
                    {t("함께하고 싶으신가요?", "Work With Us")}
                  </Link>
                  <a href="#all-artists" className="btn-ghost btn-gold">
                    {t("전체 아티스트 보기", "View All Artists")}
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
                      ? "#C8A86A"
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
          전체 아티스트  (핀 아래)
      ══════════════════════════════════════════ */}
      <section id="all-artists" className="max-w-5xl mx-auto px-6 py-20">

        {/* Origin Banner */}
        <FadeUp className="glass-card p-6 border border-[#C8A86A]/30 bg-gradient-to-r from-[#1a1106]/80 to-transparent mb-16 flex items-start gap-4">
          <span
            className="mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
            style={{ borderColor: "rgba(200,168,106,0.3)", background: "rgba(200,168,106,0.1)", color: "#C8A86A" }}
          >
            <IconDocument size={20} />
          </span>
          <div>
            <p className="text-[#C8A86A] text-xs tracking-widest uppercase font-semibold mb-1">
              {t("설립 배경", "Background")}
            </p>
            <p className="text-[#86868b] text-sm leading-relaxed">
              {t(
                "COMET ENTERTAINERS는 KE NETWORK 산하 KE ENTERTAINMENT의 뒤를 이어, COMET PRODUCTION에서 파생된 엔터테인먼트 전문 자회사입니다. KE ENTERTAINMENT가 쌓아온 경험과 노하우를 바탕으로, 아티스트 중심의 새로운 엔터테인먼트 생태계를 구축합니다.",
                "COMET ENTERTAINERS is an entertainment-focused subsidiary derived from COMET PRODUCTION, succeeding KE ENTERTAINMENT under KE NETWORK. Built on the experience and know-how accumulated by KE ENTERTAINMENT, we establish a new artist-centered entertainment ecosystem."
              )}
            </p>
          </div>
        </FadeUp>

        {/* 전체 아티스트 목록 */}
        <FadeUp className="text-center mb-12">
          <p className="text-[#C8A86A] text-xs tracking-[0.5em] uppercase mb-3">
            {t("전체 아티스트", "ALL ARTISTS")}
          </p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {t("소속 아티스트", "Our Artists")}
          </h3>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

          {/* 고구마오지터 */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A86A]/40 shrink-0 transition-all duration-300 group-hover:border-[#C8A86A]/80 group-hover:shadow-[0_0_14px_rgba(200,168,106,0.45)]">
                  <Image src="/artist-ojiter.png" alt="고구마오지터" width={56} height={56} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">고구마오지터</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">BROADCASTER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-[#e8cfa0] border-[#C8A86A]/30 bg-[#C8A86A]/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://chzzk.naver.com/754a62c3d0f2247bfee59349049a8612" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-green-400 transition-colors">
                  <Image src="/chzzk.webp" alt="치지직" width={20} height={20} className="rounded" />치지직
                </a>
                <a href="https://discord.gg/nVG4rYGV62" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-indigo-400 transition-colors">
                  <Image src="/discord.webp" alt="디스코드" width={20} height={20} className="rounded" />디스코드
                </a>
                <a href="https://www.instagram.com/sp_ojiter/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          {/* 주황파커 */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A86A]/40 shrink-0 transition-all duration-300 group-hover:border-[#C8A86A]/80 group-hover:shadow-[0_0_14px_rgba(200,168,106,0.45)]">
                  <Image src="/artist-parker.png" alt="주황파커" width={56} height={56} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">주황파커</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">YOUTUBER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-[#e8cfa0] border-[#C8A86A]/30 bg-[#C8A86A]/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://www.youtube.com/@parker0951_overwatch2/videos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors">
                  <Image src="/youtube.svg" alt="유튜브" width={20} height={20} className="rounded" />주황머리파커
                </a>
                <a href="https://www.youtube.com/@parker0951_second" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors">
                  <Image src="/youtube.svg" alt="유튜브" width={20} height={20} className="rounded" />주황마인파커
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          {/* 테마 */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A86A]/40 shrink-0 transition-all duration-300 group-hover:border-[#C8A86A]/80 group-hover:shadow-[0_0_14px_rgba(200,168,106,0.45)]">
                  <Image src="/theme.png" alt="테마" width={56} height={56} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">테마</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">BROADCASTER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-[#e8cfa0] border-[#C8A86A]/30 bg-[#C8A86A]/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://chzzk.naver.com/674d8882d0be4f9114bcc7f66d90dd65" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-green-400 transition-colors">
                  <Image src="/chzzk.webp" alt="치지직" width={20} height={20} className="rounded" />치지직
                </a>
                <a href="https://discord.gg/9nejxVtwF4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-indigo-400 transition-colors">
                  <Image src="/discord.webp" alt="디스코드" width={20} height={20} className="rounded" />디스코드
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          {/* 강하월 */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A86A]/40 shrink-0 transition-all duration-300 group-hover:border-[#C8A86A]/80 group-hover:shadow-[0_0_14px_rgba(200,168,106,0.45)]">
                  <Image src="/artist-ghw.jpg" alt="강하월" width={56} height={56} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">강하월</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">CREATOR</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-[#e8cfa0] border-[#C8A86A]/30 bg-[#C8A86A]/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://www.instagram.com/lunatic_rhygam.world/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
              </div>
              <Link href="/entertainers/ghw" className="mt-4 pt-3 border-t border-[#C8A86A]/10 flex items-center justify-between group/profile">
                <span className="text-xs text-[#C8A86A]/50 tracking-widest group-hover/profile:text-[#C8A86A] transition-colors">{t("프로필 보기", "View Profile")}</span>
                <span className="text-[#C8A86A]/40 text-xs group-hover/profile:text-[#C8A86A] group-hover/profile:translate-x-0.5 transition-all inline-block">→</span>
              </Link>
            </motion.div>
          </StaggerItem>

          {/* instar */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#C8A86A]/30 flex items-center justify-center text-[#C8A86A]/50 text-xl shrink-0">✦</div>
                <div>
                  <h4 className="text-lg font-bold text-white">instar</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">CREATOR</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">COMET LIVE 1기</span>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Lunalite */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A86A]/40 shrink-0 transition-all duration-300 group-hover:border-[#C8A86A]/80 group-hover:shadow-[0_0_14px_rgba(200,168,106,0.45)]">
                  <Image src="/composer-lunalite.png" alt="Lunalite" width={56} height={56} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Lunalite</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">COMPOSER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">COMET LIVE 1기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://soundcloud.com/user-149250997" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-orange-400 transition-colors">
                  <Image src="/soundcloud.png" alt="SoundCloud" width={20} height={20} className="rounded" />SoundCloud
                </a>
                <a href="https://www.instagram.com/hibi_lunalite100/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
              </div>
              <Link href="/entertainers/lunalite" className="mt-4 pt-3 border-t border-[#C8A86A]/10 flex items-center justify-between group/profile">
                <span className="text-xs text-[#C8A86A]/50 tracking-widest group-hover/profile:text-[#C8A86A] transition-colors">{t("프로필 보기", "View Profile")}</span>
                <span className="text-[#C8A86A]/40 text-xs group-hover/profile:text-[#C8A86A] group-hover/profile:translate-x-0.5 transition-all inline-block">→</span>
              </Link>
            </motion.div>
          </StaggerItem>

          {/* 레도 */}
          <StaggerItem>
            <motion.div className="glass-card p-7 border border-[#C8A86A]/25 bg-gradient-to-b from-[#1a1106]/50 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A86A]/40 shrink-0 transition-all duration-300 group-hover:border-[#C8A86A]/80 group-hover:shadow-[0_0_14px_rgba(200,168,106,0.45)]">
                  <Image src="/artist-redo.jpg" alt="레도" width={56} height={56} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">레도</h4>
                  <p className="text-[#C8A86A] text-xs tracking-widest mt-0.5">ILLUSTRATOR</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-[#e8cfa0] border-[#C8A86A]/30 bg-[#C8A86A]/10">COMET LIVE 3기</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                {t("SD, 귀여운 그림체를 추구하는 아티스트 '레도'입니다!", "Artist 'Redo' who pursues an SD, cute art style!")}
              </p>
              <div className="flex flex-col gap-2">
                <a href="https://www.instagram.com/hikkari._.archive" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
                <a href="https://www.instagram.com/art_hikkari._.archive/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램 (아트)" width={20} height={20} className="rounded" />인스타그램 (아트)
                </a>
              </div>
            </motion.div>
          </StaggerItem>

        </StaggerContainer>
      </section>

    </div>
  );
}
