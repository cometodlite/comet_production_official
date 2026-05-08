"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion, AnimatePresence } from "@/components/Motion";

export default function CareersPage() {
  const { t } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);

  const openings = [
    {
      brand: "COMET ENTERTAINERS",
      brandColor: "text-violet-400 border-violet-500/30 bg-violet-500/10",
      accentColor: "violet",
      hoverBorder: "hover:border-violet-500/30",
      titleKo: "아티스트 매니저",
      titleEn: "Artist Manager",
      typeKo: "정규직",
      typeEn: "Full-time",
      deadlineKo: "상시채용",
      deadlineEn: "Open",
      descKo: "아티스트의 스케줄 관리, 커리어 기획, 팬 커뮤니티 운영 등을 담당할 매니저를 모집합니다. 소속 아티스트의 성장을 가장 가까이에서 지원하는 역할입니다.",
      descEn: "We are looking for a manager responsible for scheduling, career planning, and fan community operations — supporting the growth of our artists from the very front line.",
      duties: [
        t("아티스트 일정 조율 및 스케줄 관리", "Artist schedule coordination and management"),
        t("커리어 기획 및 방향 설정 지원", "Career planning and direction support"),
        t("팬 커뮤니티 및 SNS 운영 보조", "Fan community and SNS operation assistance"),
        t("COMET ENTERTAINERS 내부 업무 협력", "Internal coordination within COMET ENTERTAINERS"),
      ],
      qualifications: [
        t("엔터테인먼트 또는 매니지먼트 관련 경험 보유자", "Experience in entertainment or management"),
        t("원활한 커뮤니케이션 및 일정 관리 능력", "Strong communication and scheduling skills"),
        t("책임감 있고 꼼꼼한 업무 태도", "Responsible and detail-oriented work ethic"),
      ],
      preferred: [
        t("SNS 운영 경험자", "Experience managing SNS accounts"),
        t("크리에이터 또는 아티스트 지원 경험자", "Experience supporting creators or artists"),
      ],
      applyKo: "문의 페이지를 통해 지원서 및 자기소개를 보내주세요.",
      applyEn: "Send your application and introduction via the Contact page.",
    },
    {
      brand: "COMET DEVELOPS",
      brandColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      accentColor: "blue",
      hoverBorder: "hover:border-blue-500/30",
      titleKo: "게임 기획자",
      titleEn: "Game Planner",
      typeKo: "정규직",
      typeEn: "Full-time",
      deadlineKo: "상시채용",
      deadlineEn: "Open",
      descKo: "새로운 게임 콘텐츠를 기획하고 개발팀과 협력하여 최고의 플레이어 경험을 만들어갈 기획자를 모집합니다. COMET DEVELOPS의 독창적인 세계관을 함께 구축해나갈 분을 환영합니다.",
      descEn: "We seek a planner to design new game content and collaborate with the development team to create the best player experience — building the unique COMET DEVELOPS universe together.",
      duties: [
        t("게임 컨셉 및 시스템 기획", "Game concept and system design"),
        t("게임 밸런싱 및 콘텐츠 설계", "Game balancing and content design"),
        t("개발팀과의 협업 및 기획 문서 작성", "Collaboration with development team and documentation"),
        t("유저 피드백 분석 및 반영", "Analyzing and applying user feedback"),
      ],
      qualifications: [
        t("게임 기획 관련 경험 또는 포트폴리오 보유자", "Experience or portfolio in game planning"),
        t("게임 장르에 대한 폭넓은 이해", "Broad understanding of game genres"),
        t("체계적인 문서 작성 능력", "Systematic documentation skills"),
      ],
      preferred: [
        t("인크리멘탈 / 아이들 장르 게임 경험자", "Experience with incremental/idle genre games"),
        t("픽셀 아트 스타일 게임 관심자", "Interest in pixel art style games"),
        t("세계관 구축 경험자", "Experience in world-building"),
      ],
      applyKo: "문의 페이지를 통해 지원서 및 포트폴리오를 보내주세요.",
      applyEn: "Send your application and portfolio via the Contact page.",
    },
    {
      brand: "COMET DEVELOPS",
      brandColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      accentColor: "blue",
      hoverBorder: "hover:border-blue-500/30",
      titleKo: "프론트엔드 개발자",
      titleEn: "Frontend Developer",
      typeKo: "정규직",
      typeEn: "Full-time",
      deadlineKo: "상시채용",
      deadlineEn: "Open",
      descKo: "React / Next.js 기반의 웹 서비스 및 게임 UI 개발에 참여할 개발자를 모집합니다. COMET의 디지털 제품을 함께 만들어갈 열정 있는 분을 기다립니다.",
      descEn: "We are recruiting a developer for React/Next.js-based web services and game UI development. We welcome passionate individuals ready to build COMET's digital products.",
      duties: [
        t("Next.js 기반 웹 서비스 개발 및 유지보수", "Development and maintenance of Next.js-based web services"),
        t("게임 UI/UX 구현", "Game UI/UX implementation"),
        t("성능 최적화 및 접근성 개선", "Performance optimization and accessibility improvements"),
        t("디자인팀과의 협업", "Collaboration with design team"),
      ],
      qualifications: [
        t("React 또는 Next.js 개발 경험자", "Experience with React or Next.js"),
        t("HTML/CSS/JavaScript에 대한 기본 이해", "Solid understanding of HTML/CSS/JavaScript"),
        t("Git 사용 경험자", "Experience using Git"),
      ],
      preferred: [
        t("TypeScript 사용 경험자", "Experience with TypeScript"),
        t("Framer Motion 등 애니메이션 라이브러리 경험자", "Experience with Framer Motion or animation libraries"),
        t("게임 UI 개발 경험자", "Experience in game UI development"),
        t("Tailwind CSS 경험자", "Experience with Tailwind CSS"),
      ],
      applyKo: "문의 페이지를 통해 지원서 및 GitHub 링크를 보내주세요.",
      applyEn: "Send your application and GitHub link via the Contact page.",
    },
  ];

  const accentMap: Record<string, string> = {
    violet: "text-violet-400",
    blue: "text-blue-400",
    indigo: "text-indigo-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-[#86868b] text-[11px] tracking-widest uppercase mb-4">
          {t("함께할 인재", "JOIN US")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          {t("채용", "Careers")}
        </h1>
        <p className="text-[#86868b] text-base max-w-xl mx-auto">
          {t(
            "COMET PRODUCTION과 함께 새로운 우주를 만들어갈 인재를 기다립니다.",
            "We're looking for talented people to build a new universe with COMET PRODUCTION."
          )}
        </p>
      </FadeUp>

      {/* 채용 목록 */}
      <StaggerContainer className="space-y-5 mb-20">
        {openings.map((job, i) => {
          const isOpen = expanded === i;
          const accent = accentMap[job.accentColor] ?? "text-indigo-400";
          return (
            <StaggerItem key={i}>
              <motion.div
                className={`glass-card border border-white/8 ${job.hoverBorder} transition-all overflow-hidden`}
                animate={{ y: 0 }}
              >
                {/* 카드 헤더 (클릭 가능) */}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full text-left p-7 group"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${job.brandColor}`}>
                      {job.brand}
                    </span>
                    <span className="text-white/30 text-xs border border-white/10 rounded-full px-2.5 py-1">
                      {t(job.typeKo, job.typeEn)}
                    </span>
                    <span className="text-green-400/70 text-xs border border-green-500/20 rounded-full px-2.5 py-1 bg-green-500/5">
                      {t(job.deadlineKo, job.deadlineEn)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                      {t(job.titleKo, job.titleEn)}
                    </h3>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-white/30 text-lg flex-shrink-0"
                    >
                      ↓
                    </motion.span>
                  </div>
                  <p className="text-[#86868b] text-sm leading-relaxed mt-3">{t(job.descKo, job.descEn)}</p>
                </button>

                {/* 상세 정보 (펼치기) */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-7 pt-0 border-t border-white/5 grid md:grid-cols-2 gap-7 mt-0 pt-6">

                        {/* 주요 업무 */}
                        <div>
                          <p className={`text-[10px] tracking-widest uppercase font-bold mb-3 ${accent}`}>
                            {t("주요 업무", "Key Responsibilities")}
                          </p>
                          <ul className="space-y-1.5">
                            {job.duties.map((d, di) => (
                              <li key={di} className="flex items-start gap-2 text-[#86868b] text-xs leading-relaxed">
                                <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${accent.replace("text-", "bg-")}`} />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 지원 자격 */}
                        <div>
                          <p className={`text-[10px] tracking-widest uppercase font-bold mb-3 ${accent}`}>
                            {t("지원 자격", "Qualifications")}
                          </p>
                          <ul className="space-y-1.5">
                            {job.qualifications.map((q, qi) => (
                              <li key={qi} className="flex items-start gap-2 text-white/55 text-xs leading-relaxed">
                                <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${accent.replace("text-", "bg-")}`} />
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 우대 사항 */}
                        <div>
                          <p className="text-[10px] tracking-widest uppercase font-bold mb-3 text-[#86868b]/60">
                            {t("우대 사항", "Preferred")}
                          </p>
                          <ul className="space-y-1.5">
                            {job.preferred.map((p, pi) => (
                              <li key={pi} className="flex items-start gap-2 text-[#86868b]/70 text-xs leading-relaxed">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 지원 방법 */}
                        <div>
                          <p className="text-[10px] tracking-widest uppercase font-bold mb-3 text-[#86868b]/60">
                            {t("지원 방법", "How to Apply")}
                          </p>
                          <p className="text-[#86868b]/70 text-xs leading-relaxed mb-4">
                            {t(job.applyKo, job.applyEn)}
                          </p>
                          <Link
                            href="/contact"
                            className={`inline-flex items-center gap-2 text-sm font-semibold ${accent} hover:opacity-80 transition-opacity`}
                          >
                            {t("지원하기", "Apply Now")} →
                          </Link>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* 자발적 지원 */}
      <FadeUp>
        <div className="glass-card p-10 text-center border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
            {t("원하는 포지션이 없으신가요?", "Don't see a role that fits?")}
          </h3>
          <p className="text-[#86868b] text-sm mb-6 leading-relaxed">
            {t(
              "공개 채용 외에도 자발적 지원을 언제든지 환영합니다. 문의 페이지를 통해 연락 주세요.",
              "We welcome spontaneous applications at any time. Please reach out through our contact page."
            )}
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              {t("문의하기", "Contact Us")}
            </Link>
          </motion.div>
        </div>
      </FadeUp>
    </div>
  );
}
