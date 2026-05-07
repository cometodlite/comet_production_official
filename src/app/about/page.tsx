"use client";

import Image from "next/image";
import { useLang } from "@/context/LanguageContext";
import { CometProductionLogo } from "@/components/logos/CometLogo";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";

export default function AboutPage() {
  const { t } = useLang();

  const history = [
    {
      date: t("2024년 8월 1일", "August 1, 2024"),
      org: t("COMET PRODUCTION 설립", "COMET PRODUCTION Founded"),
      desc: t(
        "KE NETWORK 산하 독립 프로덕션으로 공식 설립. 엔터테인먼트와 개발 두 분야를 아우르는 종합 프로덕션을 목표로 첫 발을 내딛습니다.",
        "Officially established as an independent production under KE NETWORK, taking its first steps toward becoming a comprehensive production spanning entertainment and development."
      ),
      color: "border-indigo-500/40",
      dot: "bg-indigo-500",
      label: "text-indigo-400",
      highlight: true,
    },
    {
      date: t("2025년 1월", "January 2025"),
      org: t("KE NETWORK 산하 계열사 편입", "Incorporated into KE NETWORK Affiliates"),
      desc: t(
        "COMET PRODUCTION이 KE NETWORK의 공식 계열사로 편입되며 그룹 체계를 갖추기 시작합니다.",
        "COMET PRODUCTION is officially incorporated into KE NETWORK's affiliate structure, beginning to establish a formal group framework."
      ),
      color: "border-amber-500/40",
      dot: "bg-amber-500",
      label: "text-amber-400",
    },
    {
      date: t("2026년 5월", "May 2026"),
      org: t("COMET ENTERTAINERS / DEVELOPS 법인 분리", "COMET ENTERTAINERS / DEVELOPS Incorporated"),
      desc: t(
        "COMET ENTERTAINERS와 COMET DEVELOPS가 독립 법인으로 분리되며, COMET PRODUCTION의 자회사 구조가 공식화됩니다.",
        "COMET ENTERTAINERS and COMET DEVELOPS are incorporated as independent entities, formalizing COMET PRODUCTION's subsidiary structure."
      ),
      color: "border-violet-500/40",
      dot: "bg-violet-500",
      label: "text-violet-400",
    },
  ];

  const values = [
    {
      key: "T",
      name: "TAKE",
      color: "text-indigo-400",
      border: "border-indigo-500/30",
      bg: "from-indigo-900/10",
      desc: t(
        "아티스트와 크리에이터의 가능성을 발굴하고, 그 재능을 세상으로 이끌어냅니다.",
        "We discover the potential of artists and creators, and bring their talents to the world."
      ),
    },
    {
      key: "2C",
      name: "CARE & CONNECTION",
      color: "text-violet-400",
      border: "border-violet-500/30",
      bg: "from-violet-900/10",
      desc: t(
        "소속원을 보호하고 아끼며, 아티스트와 팬, 팀 사이의 연결을 소중히 여깁니다.",
        "We protect and cherish our members, valuing the connections between artists, fans, and our team."
      ),
    },
    {
      key: "K",
      name: "KNOWLEDGE",
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "from-blue-900/10",
      desc: t(
        "전문적인 지식과 경험을 바탕으로 올바른 방향을 제시하고, 지속적으로 성장합니다.",
        "We provide clear direction grounded in expertise and experience, and continuously grow."
      ),
    },
  ];

  const team = [
    {
      name: "조용완",
      nameEn: "Yongwan Cho",
      title: "CEO",
      role: t("COMET PRODUCTION 대표", "Representative Director"),
      color: "border-indigo-500/30",
      accent: "text-indigo-400",
      bg: "from-indigo-900/10",
      desc: t(
        "COMET 설립 이후로 소속원들이 부조리를 당하거나 힘들지 않게 이끌어주면서, 멋진 방향으로 회사를 이끌어나갈 것을 약속합니다.",
        "Since COMET's founding, committed to leading the company in a great direction — ensuring every member is protected from injustice and never left to struggle alone."
      ),
    },
    {
      name: "김다원",
      nameEn: "Dawon Kim",
      title: "CCO",
      role: t("COMET PRODUCTION 부대표", "Co-Director"),
      color: "border-violet-500/30",
      accent: "text-violet-400",
      bg: "from-violet-900/10",
      desc: t(
        "KE NETWORK의 관리 및 COMET의 지원을 보조하고, 소속원에 대한 각종 보호를 약속합니다.",
        "Assists in managing KE NETWORK and supporting COMET operations, with a commitment to comprehensive protection for all members."
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">

      {/* ── 히어로 ── */}
      <FadeUp className="relative text-center mb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: "scale(1.4)",
          }}
        />
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">
          {t("회사 소개", "ABOUT US")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
          {t("우리의 이야기", "Our Story")}
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          {t(
            "COMET PRODUCTION은 KE NETWORK 산하에서 엔터테인먼트와 개발을 아우르는 종합 프로덕션으로 성장해가고 있습니다.",
            "COMET PRODUCTION is growing into a comprehensive production under KE NETWORK, spanning both entertainment and development."
          )}
        </p>
      </FadeUp>

      {/* ── 연혁 ── */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-3">
            {t("연혁", "HISTORY")}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {t("걸어온 길", "Our Journey")}
          </h2>
        </FadeUp>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
          <StaggerContainer className="space-y-10">
            {history.map((item, i) => (
              <StaggerItem key={i} className="relative pl-16">
                <div className={`absolute left-[18px] top-3.5 w-3.5 h-3.5 rounded-full ${item.dot} ring-4 ring-black`} />
                <div className={`glass-card p-6 border ${item.color} ${item.highlight ? "ring-1 ring-indigo-500/20" : ""}`}>
                  <p className={`text-xs tracking-widest uppercase font-bold mb-1.5 ${item.label}`}>
                    {item.date}
                  </p>
                  <h3 className="text-lg font-bold text-white mb-2">{item.org}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>

      {/* ── 핵심 가치 ── */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-3">
            {t("핵심 가치", "CORE VALUES")}
          </p>
          <h2 className="text-2xl font-bold text-white mb-2">T · 2C · K</h2>
          <p className="text-white/25 text-xs tracking-[0.35em]">
            TAKE · CARE &amp; CONNECTION · KNOWLEDGE
          </p>
        </FadeUp>

        <StaggerContainer className="grid md:grid-cols-3 gap-5">
          {values.map((v) => (
            <StaggerItem key={v.key}>
              <motion.div
                className={`glass-card p-7 border ${v.border} bg-gradient-to-b ${v.bg} to-transparent text-center h-full`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className={`text-6xl font-black mb-3 ${v.color} leading-none tracking-tight`}>
                  {v.key}
                </div>
                <h4 className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-4 ${v.color}`}>
                  {v.name}
                </h4>
                <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* ── 그룹 구조 ── */}
      <FadeUp className="mb-20">
        <p className="text-amber-400 text-xs tracking-[0.5em] uppercase mb-3 text-center">
          {t("그룹 구조", "GROUP STRUCTURE")}
        </p>
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          {t("KE 그룹 산하 COMET", "COMET under KE Group")}
        </h2>
        <div className="glass-card p-8 border border-amber-500/20">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl px-8 py-5 inline-block">
              <Image
                src="/logo-ke-comet.jpg"
                alt="KE NETWORK & COMET"
                width={380}
                height={160}
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-amber-500/40 bg-amber-500/5">
              <span className="text-amber-400 font-bold tracking-widest text-sm">KE NETWORK</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-amber-500/60 bg-amber-500/10">
              <CometProductionLogo size={22} />
              <span className="text-white font-bold tracking-widest text-sm">C O M E T&nbsp;&nbsp;PRODUCTION</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="px-5 py-2.5 rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-wider text-center">
                COMET ENTERTAINERS
              </div>
              <div className="px-5 py-2.5 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wider text-center">
                COMET DEVELOPS
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── 경영진 ── */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-3">
            {t("경영진", "LEADERSHIP")}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {t("함께하는 사람들", "Our Team")}
          </h2>
        </FadeUp>

        <StaggerContainer className="grid md:grid-cols-2 gap-6">
          {team.map((member) => (
            <StaggerItem key={member.name}>
              <motion.div
                className={`glass-card p-8 border ${member.color} bg-gradient-to-b ${member.bg} to-transparent h-full`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* 이니셜 아바타 */}
                <div className={`w-14 h-14 rounded-full border-2 ${member.color} flex items-center justify-center mb-5 bg-white/5`}>
                  <span className={`text-2xl font-black ${member.accent}`}>
                    {member.name[0]}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{member.name}</h3>
                    <p className="text-white/35 text-xs mt-0.5 tracking-wider">{member.nameEn}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-black tracking-[0.3em] px-3 py-1 rounded-full border ${member.color} ${member.accent} bg-white/5`}>
                      {member.title}
                    </span>
                    <span className="text-white/30 text-[10px] tracking-wider">{member.role}</span>
                  </div>
                </div>

                <p className="text-white/55 text-sm leading-relaxed">{member.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* ── 비전 ── */}
      <FadeUp>
        <div className="glass-card border border-indigo-500/20 overflow-hidden">

          {/* Brand Line */}
          <div className="p-10 text-center border-b border-white/5">
            <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-6">
              {t("비전", "VISION")}
            </p>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              {t(
                "재능을 발견하고, 창작을 실현하며,\n사람과 가능성을 연결하는 제작 생태계를 만든다.",
                "Discover talent, realize creation, and build a production ecosystem that connects people and possibility."
              )}
            </p>
            <p className="text-3xl md:text-4xl font-black gradient-text mb-2 tracking-tight">
              We produce possibility.
            </p>
            <p className="text-white/30 text-sm tracking-[0.2em]">
              {t("우리는 가능성을 제작합니다.", "We produce possibility.")}
            </p>
          </div>

          {/* Core Direction */}
          <div className="px-10 py-7 text-center border-b border-white/5">
            <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-3">
              {t("핵심 방향", "CORE DIRECTION")}
            </p>
            <p className="text-amber-500/70 text-sm md:text-base tracking-[0.25em] font-medium">
              Talent.&nbsp; Care.&nbsp; Knowledge.&nbsp; Connection.
            </p>
          </div>

          {/* Description */}
          <div className="px-10 py-8 space-y-4">
            <p className="text-white/55 text-sm leading-relaxed">
              {t(
                "COMET PRODUCTION은 재능 있는 사람을 단순히 모으는 곳이 아니라, 그들이 실제로 창작하고, 성장하고, 연결될 수 있는 환경을 만드는 제작 조직입니다.",
                "COMET PRODUCTION is not simply a place to gather talented people — it is a production organization that creates an environment where they can truly create, grow, and connect."
              )}
            </p>
            <p className="text-white/55 text-sm leading-relaxed">
              {t(
                "우리는 콘텐츠, 기술, 예술, 엔터테인먼트를 분리된 분야로 보지 않습니다. 각자의 가능성이 하나의 프로젝트가 되고, 하나의 프로젝트가 새로운 세계가 될 수 있도록 돕습니다.",
                "We do not see content, technology, art, and entertainment as separate fields. We help each person's potential become a project — and each project become a new world."
              )}
            </p>
          </div>

        </div>
      </FadeUp>

    </div>
  );
}
