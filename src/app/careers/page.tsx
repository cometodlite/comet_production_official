"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";

const openings = [
  {
    brand: "COMET ENTERTAINERS",
    brandColor: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    titleKo: "아티스트 매니저",
    titleEn: "Artist Manager",
    typeKo: "정규직",
    typeEn: "Full-time",
    descKo: "아티스트의 스케줄 관리, 커리어 기획, 팬 커뮤니티 운영 등을 담당할 매니저를 모집합니다.",
    descEn: "We are looking for a manager responsible for scheduling, career planning, and fan community operations.",
  },
  {
    brand: "COMET DEVELOPS",
    brandColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    titleKo: "게임 기획자",
    titleEn: "Game Planner",
    typeKo: "정규직",
    typeEn: "Full-time",
    descKo: "새로운 게임 콘텐츠를 기획하고 개발팀과 협력하여 최고의 플레이어 경험을 만들어갈 기획자를 모집합니다.",
    descEn: "We seek a planner to design new game content and collaborate with the development team to create the best player experience.",
  },
  {
    brand: "COMET DEVELOPS",
    brandColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    titleKo: "프론트엔드 개발자",
    titleEn: "Frontend Developer",
    typeKo: "정규직",
    typeEn: "Full-time",
    descKo: "React / Next.js 기반의 웹 서비스 및 게임 UI 개발에 참여할 개발자를 모집합니다.",
    descEn: "We are recruiting a developer to participate in React/Next.js-based web services and game UI development.",
  },
];

export default function CareersPage() {
  const { t } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">
          {t("함께할 인재", "JOIN US")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          {t("채용", "Careers")}
        </h1>
        <p className="text-white/50 text-base max-w-xl mx-auto">
          {t(
            "COMET PRODUCTION과 함께 새로운 우주를 만들어갈 인재를 기다립니다.",
            "We're looking for talented people to build a new universe with COMET PRODUCTION."
          )}
        </p>
      </FadeUp>

      {/* 채용 목록 */}
      <StaggerContainer className="space-y-6 mb-20">
        {openings.map((job, i) => (
          <StaggerItem key={i}>
            <motion.div
              className="glass-card p-7 border border-white/8 hover:border-indigo-500/30 transition-all group"
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${job.brandColor}`}>
                  {job.brand}
                </span>
                <span className="text-white/30 text-xs border border-white/10 rounded-full px-2.5 py-1">
                  {t(job.typeKo, job.typeEn)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {t(job.titleKo, job.titleEn)}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">{t(job.descKo, job.descEn)}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:gap-3"
              >
                {t("지원하기", "Apply Now")} →
              </Link>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* 자발적 지원 */}
      <FadeUp>
        <div className="glass-card p-10 text-center border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
          <h3 className="text-2xl font-bold text-white mb-3">
            {t("원하는 포지션이 없으신가요?", "Don't see a role that fits?")}
          </h3>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
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
