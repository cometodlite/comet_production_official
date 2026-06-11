"use client";

import { useLang } from "@/context/LanguageContext";
import { motion, FadeUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import PinnedHero from "@/components/PinnedHero";
import BrandShowcase from "@/components/BrandShowcase";
import Link from "next/link";

export default function HomePage() {
  const { t } = useLang();

  const cultureValues = [
    {
      en: "TALENT",
      ko: "재능",
      color: "#6C7CFF",
      descKo: "잠재된 가능성을 발굴하고 세상으로 이끌어냅니다.",
      descEn: "Discovering hidden potential and bringing it to the world.",
    },
    {
      en: "CARE",
      ko: "보호",
      color: "#C8A86A",
      descKo: "모두가 안전하게 성장할 수 있는 환경을 만듭니다.",
      descEn: "Creating an environment where everyone grows safely.",
    },
    {
      en: "KNOWLEDGE",
      ko: "지식",
      color: "#60d5fa",
      descKo: "경험에서 나온 올바른 방향과 지속적인 성장.",
      descEn: "Guiding with expertise and continuous growth.",
    },
    {
      en: "CONNECTION",
      ko: "연결",
      color: "#a78bfa",
      descKo: "창작이 실제 세계로 닿는 연결고리.",
      descEn: "The bridge where creation reaches the real world.",
    },
  ];

  return (
    <div className="relative">

      {/* ══════════════════════════════════════════
          PINNED HERO
      ══════════════════════════════════════════ */}
      <PinnedHero />

      {/* ══════════════════════════════════════════
          BRAND SHOWCASE
      ══════════════════════════════════════════ */}
      <BrandShowcase />

      {/* ══════════════════════════════════════════
          01 / WHO WE ARE
      ══════════════════════════════════════════ */}
      <section className="px-8 md:px-16 lg:px-24 py-28 md:py-44 border-t border-white/[0.07]">
        <FadeUp>
          <p className="text-[#86868b] text-[11px] tracking-widest uppercase mb-12 md:mb-20">
            01 / WHO WE ARE
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight max-w-4xl mb-10 md:mb-14 whitespace-pre-line">
            {t(
              "창작, 개발,\n엔터테인먼트를\n하나로 잇는\n제작 조직.",
              "A production\norganization that\nconnects creation,\ndevelopment & art."
            )}
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-[#86868b] text-base md:text-lg leading-relaxed max-w-2xl">
            {t(
              "COMET PRODUCTION은 재능 있는 사람들이 실제로 창작하고, 성장하고, 연결될 수 있는 환경을 만드는 제작 중심 조직입니다. 콘텐츠, 기술, 예술, 엔터테인먼트를 분리된 분야로 보지 않습니다.",
              "COMET PRODUCTION is a production-first organization that builds environments where talented people can truly create, grow, and connect — viewing content, technology, art, and entertainment not as separate fields, but as one."
            )}
          </p>
        </FadeUp>
      </section>

      {/* ══════════════════════════════════════════
          02 / OUR GROUPS
      ══════════════════════════════════════════ */}
      <section className="border-t border-white/[0.07]">
        <div className="px-8 md:px-16 lg:px-24 pt-16 pb-10">
          <FadeUp>
            <p className="text-[#86868b] text-[11px] tracking-widest uppercase">
              02 / OUR GROUPS
            </p>
          </FadeUp>
        </div>

        <StaggerContainer className="grid md:grid-cols-2 gap-px bg-[#3a3a3c]">

          {/* ── DEVELOPS ── */}
          <StaggerItem>
            <motion.div
              className="group relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex flex-col"
              style={{ background: "#060d1f" }}
              whileHover="hover"
            >
              {/* 배경 효과 */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div
                  className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(ellipse 80% 70% at 20% 85%, rgba(108,124,255,0.22) 0%, transparent 60%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse 50% 40% at 90% 10%, rgba(0,212,255,0.08) 0%, transparent 50%)",
                  }}
                />
                {/* 그리드 텍스처 */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(108,124,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(108,124,255,0.055) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }}
                />
              </div>

              <Link href="/develops" className="block relative z-10 p-10 md:p-16 lg:p-20 h-full flex flex-col">
                <p className="text-[#6C7CFF]/50 text-[9px] tracking-[0.7em] uppercase mb-10 md:mb-14">
                  COMET DEVELOPS
                </p>
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tight mb-8 group-hover:text-[#6C7CFF] transition-colors duration-500">
                  WE BUILD<br />THE UNSEEN.
                </h3>
                <p className="text-white/35 text-sm md:text-base leading-relaxed mb-auto max-w-sm">
                  {t(
                    "기술, 게임, 시스템, 서비스. 아이디어를 구조로 만들고, 구조를 경험으로 완성합니다.",
                    "Technology, games, systems, services. We turn ideas into structure, and structure into experience."
                  )}
                </p>
                <div className="mt-10 md:mt-14">
                  <span className="inline-flex items-center gap-3 text-[#6C7CFF]/50 text-[10px] tracking-[0.6em] uppercase group-hover:text-[#6C7CFF] transition-colors duration-300">
                    EXPLORE
                    <span className="w-6 h-px bg-current transition-all duration-500 group-hover:w-12" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </StaggerItem>

          {/* ── ENTERTAINERS ── */}
          <StaggerItem>
            <motion.div
              className="group relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex flex-col"
              style={{ background: "#100b07" }}
              whileHover="hover"
            >
              {/* 배경 효과 */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div
                  className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(ellipse 80% 60% at 80% 15%, rgba(200,168,106,0.2) 0%, transparent 60%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse 55% 45% at 15% 90%, rgba(200,168,106,0.1) 0%, transparent 55%)",
                  }}
                />
                {/* 무대 스포트라이트 라인 */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    background:
                      "repeating-linear-gradient(125deg, transparent, transparent 80px, rgba(200,168,106,1) 80px, rgba(200,168,106,1) 81px)",
                  }}
                />
              </div>

              <Link href="/entertainers" className="block relative z-10 p-10 md:p-16 lg:p-20 h-full flex flex-col">
                <p className="text-[#C8A86A]/50 text-[9px] tracking-[0.7em] uppercase mb-10 md:mb-14">
                  COMET ENTERTAINERS
                </p>
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tight mb-8 group-hover:text-[#C8A86A] transition-colors duration-500">
                  LET TALENT<br />BECOME LIGHT.
                </h3>
                <p className="text-white/35 text-sm md:text-base leading-relaxed mb-auto max-w-sm">
                  {t(
                    "예술, 방송, 음악, 캐릭터. 재능 있는 창작자가 자신만의 빛으로 성장하도록 돕습니다.",
                    "Art, broadcasting, music, characters. We help creators grow with their own light."
                  )}
                </p>
                <div className="mt-10 md:mt-14">
                  <span className="inline-flex items-center gap-3 text-[#C8A86A]/50 text-[10px] tracking-[0.6em] uppercase group-hover:text-[#C8A86A] transition-colors duration-300">
                    EXPLORE
                    <span className="w-6 h-px bg-current transition-all duration-500 group-hover:w-12" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ══════════════════════════════════════════
          03 / CULTURE
      ══════════════════════════════════════════ */}
      <section className="border-t border-white/[0.07]">
        <div className="px-8 md:px-16 lg:px-24 pt-16 pb-10">
          <FadeUp>
            <p className="text-[#86868b] text-[11px] tracking-widest uppercase">
              03 / CULTURE
            </p>
          </FadeUp>
        </div>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#3a3a3c]">
          {cultureValues.map((v) => (
            <StaggerItem key={v.en}>
              <motion.div
                className="bg-black py-14 md:py-24 px-6 md:px-8 text-center flex flex-col items-center justify-center h-full"
                whileHover={{ backgroundColor: "#111111" }}
                transition={{ duration: 0.4 }}
              >
                <p
                  className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-1"
                  style={{ color: `${v.color}CC` }}
                >
                  {v.en}
                </p>
                <p
                  className="text-[9px] tracking-[0.4em] mb-5"
                  style={{ color: `${v.color}55` }}
                >
                  {v.ko}
                </p>
                <p className="text-white/30 text-xs leading-relaxed max-w-[140px]">
                  {t(v.descKo, v.descEn)}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="h-20 md:h-28" />
      </section>

      {/* ══════════════════════════════════════════
          04 / EVALUATION RESULTS
      ══════════════════════════════════════════ */}
      <section className="border-t border-white/[0.07] px-8 md:px-16 lg:px-24 py-20 md:py-28">
        <FadeUp>
          <p className="text-[#86868b] text-[11px] tracking-widest uppercase mb-8">
            04 / EVALUATION RESULTS
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-3">
                {t("합격 여부 조회", "Check Your Result")}
              </h2>
              <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-md">
                {t(
                  "실전 역량평가에 응시하셨나요? 이사회의 채점이 완료되면 이름으로 결과를 조회할 수 있습니다.",
                  "Did you take the real evaluation? Once the board has finalized grading, you can check your result by name.",
                )}
              </p>
            </div>
            <Link href="/results" className="btn-ghost group flex-shrink-0">
              <span>{t("결과 조회하기", "Check Result")}</span>
              <span className="text-white/40 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </FadeUp>
      </section>

    </div>
  );
}
