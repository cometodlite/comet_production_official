"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, motion } from "@/components/Motion";
import { artists } from "@/data/artists";

export default function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t, lang } = useLang();

  const artist = artists.find((a) => a.slug === slug && a.hasPage);
  if (!artist) return null;

  const isGen2 = artist.year >= 2025;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      {/* 뒤로 가기 */}
      <FadeUp className="mb-12">
        <Link
          href="/entertainers"
          className="inline-flex items-center gap-2 text-violet-400/70 hover:text-violet-300 text-sm tracking-[0.3em] transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
          ENTERTAINERS
        </Link>
      </FadeUp>

      {/* 프로필 히어로 */}
      <FadeUp className="text-center mb-14">
        {/* 이미지 */}
        <div className="relative w-40 h-40 mx-auto mb-7">
          {artist.image ? (
            <Image
              src={artist.image}
              alt={artist.name}
              width={160}
              height={160}
              className="w-full h-full object-cover rounded-full border-2 border-violet-400/40"
            />
          ) : (
            <div className="w-full h-full rounded-full border-2 border-dashed border-violet-400/30 flex items-center justify-center text-violet-400/50 text-4xl">
              ✦
            </div>
          )}
          {/* 글로우 링 */}
          <div className="absolute inset-0 rounded-full ring-1 ring-violet-400/20 scale-[1.12] pointer-events-none" />
        </div>

        {/* 이름 */}
        <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
          {artist.name}
        </h1>
        <p className="text-violet-400 tracking-[0.4em] text-sm font-light mb-6">
          {artist.role}
        </p>

        {/* 기수 배지 */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-full border ${
              isGen2
                ? "text-violet-300 border-violet-500/30 bg-violet-500/10"
                : "text-amber-300 border-amber-500/30 bg-amber-500/10"
            }`}
          >
            {artist.generation}
          </span>
          <span className="text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-full border text-white/25 border-white/10 bg-white/5">
            {artist.year}
          </span>
        </div>
      </FadeUp>

      {/* 소개 */}
      {(artist.bio.ko || artist.bio.en) && (
        <FadeUp className="glass-card p-8 border border-violet-500/20 bg-gradient-to-b from-violet-900/10 to-transparent mb-6">
          <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-4">
            {t("소개", "About")}
          </p>
          <p className="text-white/75 leading-relaxed text-[15px]">
            {lang === "ko" ? artist.bio.ko : artist.bio.en || artist.bio.ko}
          </p>
        </FadeUp>
      )}

      {/* 태그 */}
      {artist.tags && artist.tags.length > 0 && (
        <FadeUp className="flex flex-wrap gap-2 mb-6 px-1">
          {artist.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-white/35 border border-white/10 rounded-full px-3 py-1"
            >
              #{tag}
            </span>
          ))}
        </FadeUp>
      )}

      {/* 채널 / SNS */}
      {artist.links.length > 0 && (
        <FadeUp className="glass-card p-6 border border-violet-500/20 bg-gradient-to-b from-violet-900/10 to-transparent mb-14">
          <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-5">
            {t("채널 / SNS", "Channels & SNS")}
          </p>
          <div className="flex flex-col gap-2.5">
            {artist.links.map((link) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-white/50 ${link.hoverClass} hover:border-white/15 hover:bg-white/[0.05] transition-all text-sm`}
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
              >
                <Image
                  src={link.iconSrc}
                  alt={link.label}
                  width={20}
                  height={20}
                  className="rounded shrink-0"
                />
                <span>{link.label}</span>
                <span className="ml-auto text-white/20 text-xs">↗</span>
              </motion.a>
            ))}
          </div>
        </FadeUp>
      )}

      {/* 하단 뒤로 가기 */}
      <FadeUp className="text-center">
        <Link
          href="/entertainers"
          className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-violet-300 transition-colors tracking-widest"
        >
          ← {t("전체 아티스트 보기", "All Artists")}
        </Link>
      </FadeUp>
    </div>
  );
}
