"use client";

import { useLang } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLang();

  const timeline = [
    {
      org: "KE NETWORK",
      role: t("모(계열사) 그룹", "Parent Group"),
      desc: t(
        "COMET PRODUCTION의 모체가 되는 그룹. COMET PRODUCTION을 포함한 여러 브랜드의 기반을 제공합니다.",
        "The parent group of COMET PRODUCTION, providing the foundation for multiple brands including COMET PRODUCTION."
      ),
      color: "border-amber-500/40",
      dot: "bg-amber-500",
      label: "text-amber-400",
    },
    {
      org: "KE ENTERTAINMENT",
      role: t("KE NETWORK 산하 엔터테인먼트", "KE NETWORK Entertainment Branch"),
      desc: t(
        "KE NETWORK 내 엔터테인먼트 분야를 담당하던 브랜드로, COMET ENTERTAINERS의 전신입니다.",
        "The entertainment branch under KE NETWORK and the predecessor of COMET ENTERTAINERS."
      ),
      color: "border-purple-500/40",
      dot: "bg-purple-500",
      label: "text-purple-400",
    },
    {
      org: "COMET PRODUCTION",
      role: t("설립 · KE NETWORK 산하", "Founded · Under KE NETWORK"),
      desc: t(
        "KE NETWORK 산하의 독립 프로덕션으로 설립. 엔터테인먼트와 개발 두 분야를 아우르는 종합 프로덕션을 목표로 합니다.",
        "Established as an independent production under KE NETWORK, aiming to be a comprehensive production spanning entertainment and development."
      ),
      color: "border-indigo-500/40",
      dot: "bg-indigo-500",
      label: "text-indigo-400",
      highlight: true,
    },
    {
      org: "COMET ENTERTAINERS",
      role: t("COMET PRODUCTION 자회사 설립", "COMET PRODUCTION Subsidiary Founded"),
      desc: t(
        "KE ENTERTAINMENT의 뒤를 이어 COMET PRODUCTION 산하에 설립된 엔터테인먼트 자회사. 아티스트 발굴·관리·지원을 담당합니다.",
        "Entertainment subsidiary established under COMET PRODUCTION, succeeding KE ENTERTAINMENT. Responsible for artist discovery, management, and support."
      ),
      color: "border-violet-500/40",
      dot: "bg-violet-500",
      label: "text-violet-400",
    },
    {
      org: "COMET DEVELOPS",
      role: t("COMET PRODUCTION 자회사 설립", "COMET PRODUCTION Subsidiary Founded"),
      desc: t(
        "게임 개발·배급을 전담하는 자회사로 설립. KE 그룹에 대한 추가 개발 지원도 수행합니다.",
        "Subsidiary dedicated to game development and publishing, also providing extended development support for the KE group."
      ),
      color: "border-blue-500/40",
      dot: "bg-blue-500",
      label: "text-blue-400",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-20">
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
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-12">
          {timeline.map((item, i) => (
            <div key={i} className="relative pl-16">
              <div className={`absolute left-[18px] top-2 w-3.5 h-3.5 rounded-full ${item.dot} ring-4 ring-black`} />

              <div className={`glass-card p-6 border ${item.color} ${item.highlight ? "ring-1 ring-indigo-500/30" : ""}`}>
                <p className={`text-xs tracking-widest uppercase font-semibold mb-1 ${item.label}`}>
                  {item.role}
                </p>
                <h3 className="text-xl font-bold text-white mb-3">{item.org}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision */}
      <div className="mt-24 glass-card p-10 text-center border border-indigo-500/20">
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">
          {t("비전", "VISION")}
        </p>
        <h2 className="text-3xl font-bold text-white mb-4">
          {t("더 넓은 우주로", "Toward a Wider Universe")}
        </h2>
        <p className="text-white/50 text-base leading-relaxed max-w-2xl mx-auto">
          {t(
            "COMET PRODUCTION은 엔터테인먼트와 기술 개발을 통해 더 많은 사람들에게 영감을 주고, KE 그룹과 함께 새로운 가능성을 탐구합니다.",
            "COMET PRODUCTION inspires more people through entertainment and technology, exploring new possibilities together with the KE group."
          )}
        </p>
      </div>
    </div>
  );
}
