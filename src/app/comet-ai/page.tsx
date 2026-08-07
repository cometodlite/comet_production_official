"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";
import { IconSparkle, IconDocument, IconFileSearch, IconGem, IconRocket, IconSearch } from "@/components/icons/LineIcons";

const CYAN = (a: number) => `rgba(34,211,238,${a})`;
const VIOLET = (a: number) => `rgba(140,169,255,${a})`;

export default function CometAiPage() {
  const { t } = useLang();

  const stutantFeatures = [
    { Icon: IconSearch, ko: "언어·이학 과목 질문·해설", en: "Language & science Q&A with explanations" },
    { Icon: IconFileSearch, ko: "문제 사진 분석과 수학 기호·LaTeX 표현", en: "Photo problem analysis with math/LaTeX rendering" },
    { Icon: IconSparkle, ko: "영어·일본어 대화 학습", en: "English & Japanese conversation practice" },
    { Icon: IconDocument, ko: "저장된 답변, 추가 질문, 오늘의 복습", en: "Saved answers, follow-ups, daily review" },
    { Icon: IconGem, ko: "학습 노트·리포트와 단어 암기장", en: "Study notes, reports, and vocabulary flashcards" },
    { Icon: IconRocket, ko: "사진 속 단어 추출, 발음·오타 검사, 예문 생성", en: "Word extraction from photos, pronunciation/typo checks, example sentences" },
  ];

  const dailiaFeatures = [
    { Icon: IconSparkle, ko: "자유로운 AI 대화", en: "Free-form AI conversation" },
    { Icon: IconDocument, ko: "생각과 할 일 정리", en: "Organizing thoughts and tasks" },
    { Icon: IconFileSearch, ko: "문장 다듬기와 번역", en: "Sentence polishing and translation" },
    { Icon: IconGem, ko: "일정·계획 수립", en: "Scheduling and planning" },
    { Icon: IconRocket, ko: "저장된 대화 관리", en: "Managing saved conversations" },
    { Icon: IconSearch, ko: "STAR-1.0 모델 기반의 간결한 사용 경험", en: "A concise experience powered by the STAR-1.0 model" },
  ];

  const crossFeatures = [
    { ko: "데스크톱·모바일 지원", en: "Desktop & mobile support" },
    { ko: "앱처럼 설치하는 PWA", en: "Installable as a PWA" },
    { ko: "라이트·다크 모드", en: "Light & dark mode" },
    { ko: "기존·최신 디자인 선택", en: "Legacy & modern design toggle" },
    { ko: "새 버전 감지·업데이트 안내", en: "New version detection & update prompts" },
    { ko: "사용자별 기록·사용량 관리", en: "Per-user history & usage tracking" },
  ];

  return (
    <div style={{ background: "#050a12" }}>

      {/* ── 히어로 ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          background: `
            radial-gradient(circle at 75% 25%, ${CYAN(0.16)} 0%, transparent 35%),
            radial-gradient(circle at 15% 75%, ${VIOLET(0.12)} 0%, transparent 32%),
            linear-gradient(135deg, #050a12 0%, #060f1a 100%)
          `,
        }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          backgroundImage: `linear-gradient(${CYAN(0.05)} 1px, transparent 1px), linear-gradient(90deg, ${CYAN(0.05)} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
          <FadeUp>
            <span className="inline-block text-[10px] font-bold tracking-[0.4em] uppercase px-3 py-1.5 rounded-full border mb-8"
              style={{ color: "#67e8f9", borderColor: CYAN(0.35), background: CYAN(0.08) }}>
              {t("초대 베타 운영 중", "Invite Beta")}
            </span>
          </FadeUp>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="font-black tracking-tight mb-5"
            style={{ fontSize: "clamp(46px, 9vw, 116px)", background: "linear-gradient(120deg, #fff 20%, #a5f3fc 60%, #c7d2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            COMET AI
          </motion.h1>
          <FadeUp delay={0.1}>
            <p className="text-2xl md:text-3xl font-light tracking-tight mb-8" style={{ color: "#e0f7ff" }}>
              {t("배움에서 일상으로.", "From Learning to Living.")}
            </p>
          </FadeUp>
          <FadeUp delay={0.18}>
            <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "rgba(224,247,255,0.55)" }}>
              {t(
                "학습을 돕는 Stutant와 일상을 돕는 DAILIA, 하나의 서비스 COMET AI 안에서 상단 전환 버튼으로 자연스럽게 오갈 수 있습니다.",
                "Stutant for learning and DAILIA for everyday life — one service, COMET AI, with a top switcher to move naturally between the two."
              )}
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact?type=general" className="btn-primary">
                {t("베타 신청하기", "Apply for Beta")}
              </Link>
              <a href="https://stutant.kenet.co.kr" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                {t("서비스 살펴보기", "Visit the Service")}
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── COMET AI란 ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <FadeUp className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: "#67e8f9" }}>
            01 / WHAT IS COMET AI
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-5">
            {t("두 AI, 하나의 서비스", "Two AIs, One Service")}
          </h2>
          <p className="text-white/45 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {t(
              "COMET AI는 학습과 일상생활을 하나의 AI 서비스 안에서 지원합니다. Stutant와 DAILIA는 stutant.kenet.co.kr 한 곳에서 상단 전환 버튼으로 오갈 수 있으며, 현재는 소수 사용자 대상 초대 베타 단계입니다.",
              "COMET AI supports learning and everyday life within a single AI service. Stutant and DAILIA live together at stutant.kenet.co.kr and switch with one tap at the top — currently in invite beta for a small group of users."
            )}
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl p-7 border" style={{ borderColor: CYAN(0.25), background: CYAN(0.05) }}>
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#67e8f9" }}>STUTANT</p>
            <p className="text-white font-bold text-xl mb-2">{t("공부를 돕는 AI", "The AI That Helps You Study")}</p>
            <p className="text-white/45 text-sm leading-relaxed">
              {t("Stutant 1.61 · 정답을 넘어 학습 과정을 잇는 AI", "Stutant 1.61 · Beyond answers — connecting the learning process")}
            </p>
          </div>
          <div className="rounded-2xl p-7 border" style={{ borderColor: VIOLET(0.25), background: VIOLET(0.05) }}>
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#a5b4fc" }}>DAILIA</p>
            <p className="text-white font-bold text-xl mb-2">{t("일상을 돕는 AI", "The AI That Helps Your Day")}</p>
            <p className="text-white/45 text-sm leading-relaxed">
              {t("DAILIA Beta 0.61 · 생각과 작업을 정리하는 일상 AI", "DAILIA Beta 0.61 · Organizing thoughts and tasks for daily life")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stutant ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <FadeUp className="mb-10">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: "#67e8f9" }}>02 / STUTANT</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            {t("정답을 넘어 학습 과정을 잇는 AI", "AI That Connects the Learning Process")}
          </h2>
          <p className="text-white/45 text-sm md:text-base max-w-2xl leading-relaxed">
            {t(
              "질문 하나에 답을 제시하는 데 그치지 않고, 해설과 복습, 단어 암기, 학습 기록까지 이어지는 경험을 목표로 합니다.",
              "Goes beyond a single answer — aiming for an experience that connects explanation, review, vocabulary, and study records."
            )}
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <Image src="/news/comet-ai/stutant-language-conversation.png" alt="Stutant 영어 대화 학습 화면" width={1952} height={1105} className="w-full h-auto rounded-xl border border-white/10" />
          <Image src="/news/comet-ai/stutant-question-analysis.png" alt="Stutant 문제 사진 분석 화면" width={2940} height={1666} className="w-full h-auto rounded-xl border border-white/10" />
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stutantFeatures.map((f) => (
            <StaggerItem key={f.en}>
              <div className="rounded-xl p-5 border h-full" style={{ borderColor: CYAN(0.15), background: CYAN(0.03) }}>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border" style={{ borderColor: CYAN(0.3), background: CYAN(0.1), color: "#67e8f9" }}>
                  <f.Icon size={18} />
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{t(f.ko, f.en)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── DAILIA ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <FadeUp className="mb-10">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: "#a5b4fc" }}>03 / DAILIA</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            {t("생각과 작업을 정리하는 일상 AI", "Everyday AI That Organizes Thought and Work")}
          </h2>
          <p className="text-white/45 text-sm md:text-base max-w-2xl leading-relaxed">
            {t(
              "대화를 중심으로 사용하는 일상 AI입니다. 생각과 할 일을 정리하고 문장을 다듬거나 번역·계획 수립·일상적인 질문을 돕습니다.",
              "A conversation-first everyday AI — organizing thoughts and tasks, polishing sentences, translating, planning, and answering everyday questions."
            )}
          </p>
        </FadeUp>

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <Image src="/news/comet-ai/dailia-conversation.png" alt="DAILIA 일상 AI 대화 화면" width={2940} height={1666} className="w-full h-auto rounded-xl border border-white/10" />
          <Image src="/news/comet-ai/dailia-planning.png" alt="DAILIA 생각 정리 대화 화면" width={2940} height={1666} className="w-full h-auto rounded-xl border border-white/10" />
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailiaFeatures.map((f) => (
            <StaggerItem key={f.en}>
              <div className="rounded-xl p-5 border h-full" style={{ borderColor: VIOLET(0.18), background: VIOLET(0.03) }}>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border" style={{ borderColor: VIOLET(0.32), background: VIOLET(0.1), color: "#a5b4fc" }}>
                  <f.Icon size={18} />
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{t(f.ko, f.en)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── 공통 기능 ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <FadeUp className="text-center mb-10">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-3 text-white/35">04 / EVERYWHERE</p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {t("어디서나 이어지는 사용 경험", "A Consistent Experience, Anywhere")}
          </h2>
        </FadeUp>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {crossFeatures.map((f) => (
            <StaggerItem key={f.en}>
              <div className="rounded-xl p-5 border border-white/[0.08] bg-white/[0.02] text-center h-full flex items-center justify-center">
                <p className="text-sm text-white/60 leading-relaxed">{t(f.ko, f.en)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── 비전 인용구 ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center border-t border-white/[0.06]">
        <FadeUp>
          <p className="text-xl md:text-2xl font-medium leading-relaxed" style={{ color: "#e0f7ff" }}>
            {t(
              "“COMET AI는 정답을 대신 말해주는 도구를 넘어, 사용자가 공부하고 생각한 과정이 다음 학습과 일상으로 이어지도록 만드는 것을 목표로 합니다.”",
              "“COMET AI aims to go beyond a tool that simply gives you answers — helping the process of studying and thinking carry forward into the next learning moment and everyday life.”"
            )}
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="mt-8">
          <p className="text-xs text-white/25 leading-relaxed">
            {t(
              "생성형 AI의 특성상 부정확한 답변이 만들어질 수 있습니다. 중요한 학습 내용과 일정 정보는 공식 자료와 함께 확인하는 것을 권장합니다.",
              "As with any generative AI, responses may occasionally be inaccurate. For important study material or schedules, please verify against official sources."
            )}
          </p>
        </FadeUp>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <FadeUp>
          <div className="glass-card p-10 md:p-14 border" style={{ borderColor: CYAN(0.2) }}>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
              {t("COMET AI를 먼저 만나보세요", "Meet COMET AI Early")}
            </h3>
            <p className="text-white/45 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
              {t(
                "현재는 소수 사용자를 대상으로 한 초대 베타 단계입니다. 베타 신청을 남겨주시면 순차적으로 안내드립니다.",
                "COMET AI is currently in invite beta for a small group of users. Apply and we'll reach out as spots open up."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact?type=general" className="btn-primary">
                {t("베타 신청하기", "Apply for Beta")}
              </Link>
              <Link href="/news/comet-ai" className="btn-ghost">
                {t("전체 소식 보기", "Read the Full Announcement")}
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

    </div>
  );
}
