"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";
import { IconDocument, IconFileSearch, IconRocket } from "@/components/icons/LineIcons";

const EDU_HEX = "#00B896";
const EDU = (a: number) => `rgba(0,184,150,${a})`;

const ASPIRATIONS = [
  {
    num: "01",
    Icon: IconDocument,
    title_ko: "사내 교육 전문",
    title_en: "Internal Education",
    desc_ko:
      "COMET PRODUCTION 구성원을 위한 체계적인 사내 교육 프로그램을 전문적으로 운영합니다.",
    desc_en:
      "We specialize in systematic internal education programs for COMET PRODUCTION members.",
  },
  {
    num: "02",
    Icon: IconFileSearch,
    title_ko: "문제 풀이",
    title_en: "Problem Solving",
    desc_ko:
      "실전 문제 풀이를 통해 이론을 넘어 진짜 응용 능력을 기릅니다.",
    desc_en:
      "We develop real applied skills beyond theory through hands-on problem solving.",
  },
  {
    num: "03",
    Icon: IconRocket,
    title_ko: "실력 상승",
    title_en: "Skill Enhancement",
    desc_ko:
      "지속적인 학습과 평가를 통해 구성원 모두가 성장할 수 있는 환경을 만듭니다.",
    desc_en:
      "We create an environment where every member can grow through continuous learning and assessment.",
  },
];

export default function EduPage() {
  const { t } = useLang();

  return (
    <div style={{ background: "#05100e" }}>

      {/* ══ 히어로 ══════════════════════════════════════ */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 65% -15%, ${EDU(0.22)} 0%, transparent 52%),
            radial-gradient(ellipse at 10% 85%, rgba(0,150,120,0.09) 0%, transparent 42%),
            #05100e
          `,
        }}
      >
        <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 w-full py-28">
          <div className="grid md:grid-cols-[1fr_340px] gap-16 items-center">

            {/* 왼쪽 — 대형 EDU 타이틀 */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[10px] tracking-[0.6em] uppercase mb-6 font-semibold"
                style={{ color: EDU(0.55) }}
              >
                COMET EDU
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 36, filter: "blur(18px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
                className="font-black leading-[0.78] tracking-tighter select-none"
                style={{ fontSize: "clamp(100px, 21vw, 240px)", color: EDU_HEX }}
              >
                EDU
              </motion.h1>
            </div>

            {/* 오른쪽 — 슬로건 + 설명 */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <p
                className="font-semibold leading-snug mb-5"
                style={{ fontSize: "clamp(17px, 2vw, 22px)", color: "rgba(255,255,255,0.88)" }}
              >
                Learning Shapes<br />Your Future Path.
              </p>
              <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.36)" }}>
                {t(
                  "COMET PRODUCTION 산하 교육 웹플랫폼. 사내 교육과 실력 향상을 통해 구성원 모두의 미래를 만들어갑니다.",
                  "COMET PRODUCTION's education web platform. Building every member's future through internal education and skill development."
                )}
              </p>
              <span className="text-[11px] tracking-[0.35em] uppercase" style={{ color: EDU(0.38) }}>
                ↓ scroll
              </span>
            </motion.div>

          </div>
        </div>

        {/* 하단 페이드 연결 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #061410)" }}
        />
      </section>

      {/* ══ 우리가 바라는 것 ══════════════════════════════ */}
      <section className="py-28 px-8 md:px-16 lg:px-24" style={{ background: "#061410" }}>
        <div className="max-w-6xl mx-auto">

          <FadeUp className="mb-16">
            <p
              className="text-[10px] tracking-[0.6em] uppercase mb-4 font-semibold"
              style={{ color: EDU(0.5) }}
            >
              02 / WHAT WE ASPIRE TO
            </p>
            <h2
              className="font-black tracking-tight leading-[0.88]"
              style={{ fontSize: "clamp(32px, 5vw, 64px)", color: EDU_HEX }}
            >
              {t("우리가 바라는 것", "WHAT WE\nASPIRE TO.")}
            </h2>
          </FadeUp>

          <StaggerContainer className="grid md:grid-cols-3 gap-5">
            {ASPIRATIONS.map((item, i) => (
              <StaggerItem key={i}>
                <div
                  className="rounded-2xl p-8 h-full flex flex-col gap-7 border"
                  style={{ borderColor: EDU(0.14), background: EDU(0.04) }}
                >
                  {/* 번호 + 아이콘 */}
                  <div className="flex items-start justify-between">
                    <span
                      className="font-black leading-none tabular-nums"
                      style={{ fontSize: "clamp(44px, 6vw, 64px)", color: EDU(0.16) }}
                    >
                      {item.num}
                    </span>
                    <div
                      className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
                      style={{ borderColor: EDU(0.32), background: EDU(0.10), color: EDU_HEX }}
                    >
                      <item.Icon size={20} />
                    </div>
                  </div>
                  {/* 텍스트 */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      {t(item.title_ko, item.title_en)}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {t(item.desc_ko, item.desc_en)}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

        </div>
      </section>

      {/* ══ 비전 ════════════════════════════════════════ */}
      <section
        className="py-36 px-8 md:px-16 lg:px-24 text-center"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, ${EDU(0.13)} 0%, transparent 58%),
            #05100e
          `,
        }}
      >
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <p
              className="text-[10px] tracking-[0.6em] uppercase mb-10 font-semibold"
              style={{ color: EDU(0.5) }}
            >
              03 / VISION
            </p>

            {/* 구분선 */}
            <div
              className="w-10 h-px mx-auto mb-10"
              style={{ background: EDU(0.35) }}
            />

            <p
              className="font-black tracking-tight leading-[0.88] mb-10 whitespace-pre-line"
              style={{ fontSize: "clamp(28px, 5.5vw, 68px)", color: EDU_HEX }}
            >
              {"A WORLD WHERE\nEVERY LEARNING\nBECOMES A PATH."}
            </p>
            <p
              className="text-base leading-relaxed max-w-md mx-auto mb-14"
              style={{ color: "rgba(236,255,250,0.40)" }}
            >
              {t(
                "모든 배움이 길이 되는 세상. COMET EDU는 그 세상을 만들기 위해 존재합니다.",
                "A world where every learning becomes a path. COMET EDU exists to build that world."
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/develops"
                className="btn-primary"
                style={{
                  "--btn-bg":       EDU_HEX,
                  "--btn-bg-hover": "#00d4ae",
                  "--btn-fg":       "#031a14",
                  "--btn-glow":     EDU(0.35),
                } as React.CSSProperties}
              >
                {t("DEVELOPS로 돌아가기", "← Back to DEVELOPS")}
              </Link>
              <Link href="/contact" className="btn-ghost">
                {t("문의하기", "Contact Us")}
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
