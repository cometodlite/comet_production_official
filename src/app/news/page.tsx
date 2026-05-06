"use client";

import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, AnimatePresence, motion } from "@/components/Motion";

type Category = "all" | "production" | "entertainers" | "develops";

const newsData = [
  {
    id: 1,
    category: "production" as Category,
    date: "2026.05.05",
    titleKo: "COMET PRODUCTION 공식 홈페이지 오픈",
    titleEn: "COMET PRODUCTION Official Website Launch",
    descKo: "COMET PRODUCTION의 공식 홈페이지가 오픈되었습니다. 앞으로 다양한 소식을 전달해 드리겠습니다.",
    descEn: "The official COMET PRODUCTION website has launched. We look forward to sharing exciting news with you.",
    tag: "PRODUCTION",
    tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: 2,
    category: "entertainers" as Category,
    date: "2026.05.05",
    titleKo: "COMET ENTERTAINERS 공식 출범",
    titleEn: "COMET ENTERTAINERS Official Launch",
    descKo: "KE ENTERTAINMENT의 뒤를 이어 COMET ENTERTAINERS가 공식 출범하였습니다. 아티스트 지원을 시작합니다.",
    descEn: "COMET ENTERTAINERS has officially launched, succeeding KE ENTERTAINMENT. Artist support has begun.",
    tag: "ENTERTAINERS",
    tagColor: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  },
  {
    id: 3,
    category: "develops" as Category,
    date: "2026.05.05",
    titleKo: "COMET DEVELOPS 공식 출범",
    titleEn: "COMET DEVELOPS Official Launch",
    descKo: "게임 개발·배급 전담 자회사 COMET DEVELOPS가 공식 출범하였습니다. 첫 번째 프로젝트를 준비 중입니다.",
    descEn: "COMET DEVELOPS, our game development and publishing subsidiary, has officially launched. Our first project is in preparation.",
    tag: "DEVELOPS",
    tagColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
];

export default function NewsPage() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Category>("all");

  const categories: { value: Category; label: string }[] = [
    { value: "all", label: t("전체", "All") },
    { value: "production", label: "PRODUCTION" },
    { value: "entertainers", label: "ENTERTAINERS" },
    { value: "develops", label: "DEVELOPS" },
  ];

  const filtered = filter === "all" ? newsData : newsData.filter((n) => n.category === filter);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">
          {t("최신 소식", "LATEST NEWS")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          {t("뉴스", "News")}
        </h1>
        <p className="text-white/50 text-base">
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
                ? "bg-indigo-600 border-indigo-500 text-white"
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
          className="space-y-6"
        >
          {filtered.map((news) => (
            <motion.div
              key={news.id}
              className="glass-card p-7 border border-white/8 hover:border-indigo-500/30 transition-all"
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${news.tagColor}`}>
                  {news.tag}
                </span>
                <span className="text-white/30 text-xs">{news.date}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t(news.titleKo, news.titleEn)}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{t(news.descKo, news.descEn)}</p>
            </motion.div>
          ))}

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
