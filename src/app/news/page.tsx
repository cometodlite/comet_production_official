"use client";

import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, AnimatePresence, motion } from "@/components/Motion";

type Category = "all" | "production" | "entertainers" | "develops";

const newsData = [
  {
    id: 4,
    category: "develops" as Category,
    date: "2026.05.16",
    titleKo: "HCSiG II 개발 프로젝트 착수",
    titleEn: "HCSiG II Development Project Begins",
    descKo: "COMET DEVELOPS가 HCSiG의 후속 프로젝트인 HCSiG II 개발에 착수했습니다. 전작의 해킹 코드 시뮬레이션 콘셉트를 확장해, 더 깊어진 시스템 구조와 새로운 플레이 흐름을 갖춘 웹게임 경험을 준비하고 있습니다.",
    descEn: "COMET DEVELOPS has begun development on HCSiG II, the follow-up project to HCSiG. Building on the original hacking code simulation concept, the team is preparing a web game experience with deeper systems and a refreshed gameplay flow.",
    tag: "DEVELOPS",
    tagColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    accentBar: "bg-gradient-to-r from-blue-500/70 to-transparent",
  },
  {
    id: 1,
    category: "production" as Category,
    date: "2026.05.05",
    titleKo: "COMET PRODUCTION 공식 홈페이지 오픈",
    titleEn: "COMET PRODUCTION Official Website Launch",
    descKo: "COMET PRODUCTION의 공식 홈페이지가 오픈되었습니다. 브랜드의 비전과 소속 아티스트, 개발 프로젝트를 한눈에 확인하실 수 있으며, 앞으로 다양한 소식과 업데이트를 이 곳을 통해 전달해 드리겠습니다.",
    descEn: "The official COMET PRODUCTION website has launched. You can now explore our brand vision, artists, and development projects in one place — and we look forward to sharing exciting news and updates with you here.",
    tag: "PRODUCTION",
    tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    accentBar: "bg-gradient-to-r from-amber-500/70 to-transparent",
  },
  {
    id: 2,
    category: "entertainers" as Category,
    date: "2026.05.05",
    titleKo: "COMET ENTERTAINERS 공식 출범",
    titleEn: "COMET ENTERTAINERS Official Launch",
    descKo: "KE ENTERTAINMENT의 뒤를 이어 COMET ENTERTAINERS가 공식 출범하였습니다. 아티스트 지원과 육성을 핵심으로, 창작자들이 자신만의 빛으로 성장할 수 있는 환경을 구축해 나가겠습니다.",
    descEn: "COMET ENTERTAINERS has officially launched, succeeding KE ENTERTAINMENT. With a focus on artist support and development, we are building an environment where creators can grow with their own unique light.",
    tag: "ENTERTAINERS",
    tagColor: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    accentBar: "bg-gradient-to-r from-violet-500/70 to-transparent",
  },
  {
    id: 3,
    category: "develops" as Category,
    date: "2026.05.05",
    titleKo: "COMET DEVELOPS 공식 출범",
    titleEn: "COMET DEVELOPS Official Launch",
    descKo: "게임 개발·배급 전담 자회사 COMET DEVELOPS가 공식 출범하였습니다. 인크리멘탈 웹게임 HCSiG를 시작으로, 다양한 독창적 게임 프로젝트를 통해 새로운 디지털 경험을 제공해 나갈 예정입니다.",
    descEn: "COMET DEVELOPS, our dedicated game development and publishing subsidiary, has officially launched. Starting with HCSiG, an incremental web game, we will deliver new digital experiences through a variety of original game projects.",
    tag: "DEVELOPS",
    tagColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    accentBar: "bg-gradient-to-r from-blue-500/70 to-transparent",
  },
];

export default function NewsPage() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Category>("all");

  const categories: { value: Category; label: string; activeClass: string }[] = [
    { value: "all",           label: t("전체", "All"),         activeClass: "bg-indigo-600 border-indigo-500 text-white" },
    { value: "production",    label: "PRODUCTION",             activeClass: "bg-amber-600/80 border-amber-500 text-white" },
    { value: "entertainers",  label: "ENTERTAINERS",           activeClass: "bg-violet-600/80 border-violet-500 text-white" },
    { value: "develops",      label: "DEVELOPS",               activeClass: "bg-blue-600/80 border-blue-500 text-white" },
  ];

  const filtered = filter === "all" ? newsData : newsData.filter((n) => n.category === filter);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-[#86868b] text-[11px] tracking-widest uppercase mb-4">
          {t("최신 소식", "LATEST NEWS")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          {t("뉴스", "News")}
        </h1>
        <p className="text-[#86868b] text-base">
          {t("COMET PRODUCTION 그룹의 최신 소식을 전달합니다.", "The latest news from the COMET PRODUCTION group.")}
        </p>
      </FadeUp>

      {/* 필터 */}
      <FadeUp className="flex flex-wrap gap-2 mb-12 justify-center">
        {categories.map((c) => (
          <motion.button
            key={c.value}
            onClick={() => setFilter(c.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all border ${
              filter === c.value
                ? c.activeClass
                : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            {c.label}
          </motion.button>
        ))}
      </FadeUp>

      {/* 뉴스 목록 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <StaggerContainer className="space-y-5">
            {filtered.map((news) => (
              <StaggerItem key={news.id}>
                <motion.div
                  className="glass-card border border-white/[0.08] hover:border-white/20 transition-all overflow-hidden"
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  {/* 카테고리 컬러 액센트 바 */}
                  <div className={`h-[2px] w-full ${news.accentBar}`} />

                  <div className="p-7">
                    {/* 태그 + 날짜 + PRESS RELEASE */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${news.tagColor}`}>
                        {news.tag}
                      </span>
                      <span className="text-white/30 text-xs font-mono">{news.date}</span>
                      <span className="text-white/12 text-[9px] tracking-[0.5em] uppercase ml-auto hidden sm:block">
                        PRESS RELEASE
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1.5">
                      {t(news.titleKo, news.titleEn)}
                    </h3>
                    <p className="text-white/25 text-xs mb-4 tracking-wide">
                      {t(news.titleEn, news.titleKo)}
                    </p>

                    {/* 구분선 */}
                    <div className="w-12 h-px bg-white/10 mb-4" />

                    {/* 본문 */}
                    <p className="text-[#86868b] text-sm leading-relaxed">
                      {t(news.descKo, news.descEn)}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {filtered.length === 0 && (
            <motion.div
              className="text-center py-20 text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-4xl mb-4">✦</p>
              <p>{t("아직 등록된 소식이 없습니다.", "No news yet.")}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
