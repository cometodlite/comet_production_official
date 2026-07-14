"use client";

import { use } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";
import { developers, STATUS_META, type DevWork } from "@/data/developers";

function StatusBadge({ status }: { status: DevWork["status"] }) {
  const { t } = useLang();
  const meta = STATUS_META[status];
  return (
    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${meta.className}`}>
      {t(meta.ko, meta.en)}
    </span>
  );
}

function WorkCard({ work }: { work: DevWork }) {
  const { t, lang } = useLang();
  const Wrapper = work.url ? motion.a : motion.div;
  const wrapperProps = work.url
    ? { href: work.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <StaggerItem>
      <Wrapper
        {...wrapperProps}
        className={`block h-full rounded-2xl border p-6 transition-all ${work.url ? "hover:border-[#6C7CFF]/60 hover:-translate-y-1 group" : ""}`}
        style={{ borderColor: "rgba(108,124,255,0.2)", background: "rgba(108,124,255,0.04)" }}
        whileHover={work.url ? { y: -4, transition: { duration: 0.2 } } : undefined}
      >
        <div className="mb-3">
          <StatusBadge status={work.status} />
        </div>
        <h4 className="font-bold text-white mb-1.5 group-hover:text-[#9ba8ff] transition-colors">
          {work.name}
        </h4>
        {work.description && (
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            {lang === "ko" ? work.description.ko : work.description.en}
          </p>
        )}
        {work.url && (
          <p className="text-xs font-semibold mt-3" style={{ color: "#6C7CFF" }}>
            {t("플레이하기", "Play Now")} →
          </p>
        )}
      </Wrapper>
    </StaggerItem>
  );
}

export default function DeveloperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLang();

  const developer = developers.find((d) => d.slug === slug && d.hasPage);
  if (!developer) return null;

  return (
    <div className="min-h-screen" style={{ background: "#050814" }}>
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* 뒤로 가기 */}
        <FadeUp className="mb-12">
          <Link
            href="/develops"
            className="inline-flex items-center gap-2 text-sm tracking-[0.3em] transition-colors group"
            style={{ color: "rgba(108,124,255,0.7)" }}
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
            DEVELOPS
          </Link>
        </FadeUp>

        {/* 히어로 */}
        <FadeUp className="mb-14">
          <span className="font-mono text-xs tracking-[0.35em]" style={{ color: "rgba(108,124,255,0.5)" }}>
            {developer.number}
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white mt-3 mb-3 tracking-tight">
            {developer.name}
          </h1>
          <span
            className="inline-block rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-widest"
            style={{ borderColor: "rgba(108,124,255,0.25)", background: "rgba(108,124,255,0.1)", color: "#aeb7ff" }}
          >
            {t(developer.role.ko, developer.role.en)}
          </span>
        </FadeUp>

        {/* 소개 */}
        <FadeUp className="mb-6">
          <div className="glass-card p-8 border" style={{ borderColor: "rgba(108,124,255,0.18)", background: "rgba(108,124,255,0.03)" }}>
            <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: "#6C7CFF" }}>
              {t("소개", "About")}
            </p>
            <p className="text-white/75 leading-relaxed text-[15px] mb-6">
              {t(developer.description.ko, developer.description.en)}
            </p>
            <div className="flex flex-wrap gap-2">
              {developer.specialties.map((sp) => (
                <span key={sp} className="text-xs text-white/40 border border-white/10 rounded-full px-3 py-1 font-mono tracking-wider">
                  {sp}
                </span>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* 게임 */}
        {developer.games.length > 0 && (
          <FadeUp className="mt-14 mb-6">
            <p className="text-xs tracking-[0.5em] uppercase mb-3" style={{ color: "#6C7CFF" }}>
              {t("게임", "GAMES")}
            </p>
            <StaggerContainer className="grid sm:grid-cols-2 gap-4">
              {developer.games.map((work) => (
                <WorkCard key={work.name} work={work} />
              ))}
            </StaggerContainer>
          </FadeUp>
        )}

        {/* 웹 */}
        {developer.web.length > 0 && (
          <FadeUp className="mt-14 mb-6">
            <p className="text-xs tracking-[0.5em] uppercase mb-3" style={{ color: "#6C7CFF" }}>
              {t("웹", "WEB")}
            </p>
            <StaggerContainer className="grid sm:grid-cols-2 gap-4">
              {developer.web.map((work) => (
                <WorkCard key={work.name} work={work} />
              ))}
            </StaggerContainer>
          </FadeUp>
        )}

        {/* 기타 */}
        {developer.other.length > 0 && (
          <FadeUp className="mt-14 mb-6">
            <p className="text-xs tracking-[0.5em] uppercase mb-5" style={{ color: "#6C7CFF" }}>
              {t("기타", "OTHER")}
            </p>
            <div className="space-y-5">
              {developer.other.map((group) => (
                <div key={group.label.ko} className="rounded-2xl border p-6" style={{ borderColor: "rgba(108,124,255,0.16)", background: "rgba(108,124,255,0.03)" }}>
                  <p className="text-sm font-semibold text-white/70 mb-3">
                    {t(group.label.ko, group.label.en)}
                  </p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.name} className="flex items-baseline gap-2 text-sm">
                        <span className="text-[#6C7CFF]/50">·</span>
                        <span className="text-white/70 font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-white/35 text-xs">
                            — {t(item.description.ko, item.description.en)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </FadeUp>
        )}

        {/* 하단 뒤로 가기 */}
        <FadeUp className="text-center mt-16">
          <Link
            href="/develops"
            className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-[#9ba8ff] transition-colors tracking-widest"
          >
            ← {t("DEVELOPS로 돌아가기", "Back to DEVELOPS")}
          </Link>
        </FadeUp>
      </div>
    </div>
  );
}
