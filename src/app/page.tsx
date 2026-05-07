"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { motion, FadeUp, StaggerContainer, StaggerItem } from "@/components/Motion";

export default function HomePage() {
  const { t } = useLang();

  const cultureValues = [
    { en: "TALENT",     ko: "재능" },
    { en: "CARE",       ko: "보호" },
    { en: "KNOWLEDGE",  ko: "지식" },
    { en: "CONNECTION", ko: "연결" },
  ];

  return (
    <div className="relative">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-20 pt-36 relative overflow-hidden">

        {/* 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: "radial-gradient(ellipse 70% 55% at 45% 35%, rgba(99,102,241,0.13) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* 라벨 */}
        <motion.p
          className="text-white/30 text-[10px] tracking-[0.7em] uppercase mb-8 md:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          COMET PRODUCTION · KE NETWORK
        </motion.p>

        {/* 메인 타이포 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
        >
          <h1 className="font-black tracking-tight leading-[0.88] mb-10 md:mb-14">
            <span className="block gradient-text text-[15vw] sm:text-[12vw] md:text-[11vw] lg:text-[10vw]">
              WE
            </span>
            <span className="block gradient-text text-[15vw] sm:text-[12vw] md:text-[11vw] lg:text-[10vw]">
              PRODUCE
            </span>
            <span className="block text-white text-[15vw] sm:text-[12vw] md:text-[11vw] lg:text-[10vw]">
              POSSIBILITY.
            </span>
          </h1>
        </motion.div>

        {/* 서브 문구 + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="max-w-lg"
        >
          <p className="text-white/45 text-base md:text-lg leading-relaxed mb-8">
            {t(
              "재능을 발견하고, 창작을 실현하며,\n사람과 가능성을 연결하는 제작 생태계.",
              "Discover talent, realize creation —\na production ecosystem connecting people and possibility."
            )}
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/about"
              className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              {t("회사 소개", "About Us")}
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-full border border-white/20 hover:border-indigo-400 text-white/70 hover:text-white text-sm font-medium transition-all"
            >
              {t("문의하기", "Contact")}
            </Link>
          </div>
        </motion.div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-3 text-white/20 animate-float">
          <span
            className="text-[9px] tracking-[0.6em] uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            SCROLL
          </span>
          <div className="w-px h-14 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          01 / WHO WE ARE
      ══════════════════════════════════════════ */}
      <section className="px-8 md:px-16 lg:px-24 py-28 md:py-40 border-t border-white/5">
        <FadeUp>
          <p className="text-white/25 text-[10px] tracking-[0.7em] uppercase mb-10 md:mb-16">
            01 / WHO WE ARE
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.0] tracking-tight max-w-4xl mb-10 md:mb-14 whitespace-pre-line">
            {t(
              "창작, 개발,\n엔터테인먼트를\n하나로 잇는\n제작 조직.",
              "A production\norganization that\nconnects creation,\ndevelopment & art."
            )}
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-white/40 text-base md:text-lg leading-relaxed max-w-2xl">
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
      <section className="border-t border-white/5">
        <div className="px-8 md:px-16 lg:px-24 pt-16 pb-10">
          <FadeUp>
            <p className="text-white/25 text-[10px] tracking-[0.7em] uppercase">
              02 / OUR GROUPS
            </p>
          </FadeUp>
        </div>

        <StaggerContainer className="grid md:grid-cols-2 gap-px bg-white/5">
          {/* DEVELOPS */}
          <StaggerItem>
            <motion.div
              className="bg-[#05040f] p-10 md:p-16 lg:p-20 h-full"
              whileHover={{ backgroundColor: "rgba(59,130,246,0.03)" }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/develops" className="group block">
                <p className="text-blue-400/50 text-[9px] tracking-[0.7em] uppercase mb-8">
                  COMET DEVELOPS
                </p>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.0] tracking-tight mb-8 group-hover:text-blue-100 transition-colors duration-300">
                  WE BUILD<br />THE UNSEEN.
                </h3>
                <p className="text-white/35 text-sm leading-relaxed mb-10 max-w-sm">
                  {t(
                    "기술, 게임, 시스템, 서비스. 아이디어를 구조로 만들고, 구조를 경험으로 완성합니다.",
                    "Technology, games, systems, services. We turn ideas into structure, and structure into experience."
                  )}
                </p>
                <span className="text-blue-400/40 text-[10px] tracking-[0.5em] group-hover:text-blue-400 transition-colors duration-300">
                  EXPLORE →
                </span>
              </Link>
            </motion.div>
          </StaggerItem>

          {/* ENTERTAINERS */}
          <StaggerItem>
            <motion.div
              className="bg-[#05040f] p-10 md:p-16 lg:p-20 h-full"
              whileHover={{ backgroundColor: "rgba(139,92,246,0.03)" }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/entertainers" className="group block">
                <p className="text-violet-400/50 text-[9px] tracking-[0.7em] uppercase mb-8">
                  COMET ENTERTAINERS
                </p>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.0] tracking-tight mb-8 group-hover:text-violet-100 transition-colors duration-300">
                  LET TALENT<br />BECOME LIGHT.
                </h3>
                <p className="text-white/35 text-sm leading-relaxed mb-10 max-w-sm">
                  {t(
                    "예술, 방송, 음악, 캐릭터. 재능 있는 창작자가 자신만의 빛으로 성장하도록 돕습니다.",
                    "Art, broadcasting, music, characters. We help creators grow with their own light."
                  )}
                </p>
                <span className="text-violet-400/40 text-[10px] tracking-[0.5em] group-hover:text-violet-400 transition-colors duration-300">
                  EXPLORE →
                </span>
              </Link>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ══════════════════════════════════════════
          03 / PROJECTS
      ══════════════════════════════════════════ */}
      <section className="px-8 md:px-16 lg:px-24 py-28 md:py-40 border-t border-white/5">
        <FadeUp>
          <p className="text-white/25 text-[10px] tracking-[0.7em] uppercase mb-10 md:mb-16">
            03 / PROJECTS
          </p>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* HCSiG */}
          <StaggerItem>
            <motion.a
              href="https://cometodlite.github.io/hacking-code-simulation-game/"
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-card block p-8 border border-blue-500/20 h-full"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <p className="text-blue-400/50 text-[9px] tracking-[0.5em] uppercase mb-5">
                COMET DEVELOPS
              </p>
              <h4 className="text-2xl font-black text-white mb-1 group-hover:text-blue-200 transition-colors">
                HCSiG
              </h4>
              <p className="text-white/25 text-xs tracking-wider mb-6">
                해킹코드 시뮬레이션
              </p>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                {t(
                  "브라우저에서 즐기는 인크리멘탈/아이들 장르 웹게임.",
                  "An incremental / idle web game playable in your browser."
                )}
              </p>
              <span className="text-blue-400/40 text-[10px] tracking-[0.5em] group-hover:text-blue-400 transition-colors">
                PLAY →
              </span>
            </motion.a>
          </StaggerItem>

          {/* 준비 중 × 2 */}
          {[...Array(2)].map((_, i) => (
            <StaggerItem key={i}>
              <div className="glass-card p-8 border border-white/5 flex flex-col items-center justify-center min-h-[240px] text-white/10">
                <div className="text-3xl mb-3">◈</div>
                <p className="text-[10px] tracking-[0.5em]">
                  {t("준비 중", "COMING SOON")}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ══════════════════════════════════════════
          04 / CULTURE
      ══════════════════════════════════════════ */}
      <section className="border-t border-white/5">
        <div className="px-8 md:px-16 lg:px-24 pt-16 pb-10">
          <FadeUp>
            <p className="text-white/25 text-[10px] tracking-[0.7em] uppercase">
              04 / CULTURE
            </p>
          </FadeUp>
        </div>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
          {cultureValues.map((v) => (
            <StaggerItem key={v.en}>
              <div className="bg-[#05040f] py-14 md:py-24 px-6 text-center">
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-white/75 tracking-tight mb-2">
                  {v.en}
                </p>
                <p className="text-white/20 text-[10px] tracking-[0.4em]">{v.ko}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* 하단 여백 */}
        <div className="h-20 md:h-28" />
      </section>

    </div>
  );
}
