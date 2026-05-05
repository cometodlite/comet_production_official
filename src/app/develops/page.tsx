"use client";

import { useLang } from "@/context/LanguageContext";

export default function DevelopsPage() {
  const { t } = useLang();

  const services = [
    {
      icon: "🎮",
      title: t("게임 개발", "Game Development"),
      desc: t(
        "독창적인 게임 콘텐츠를 기획하고 개발합니다. 플레이어에게 새로운 경험을 선사합니다.",
        "We plan and develop original game content, delivering new experiences to players."
      ),
    },
    {
      icon: "📦",
      title: t("게임 관리 및 배급", "Game Management & Publishing"),
      desc: t(
        "개발된 게임의 서비스 운영, 업데이트 관리, 배급을 전담합니다.",
        "We are dedicated to service operations, update management, and publishing of developed games."
      ),
    },
    {
      icon: "🔧",
      title: t("KE 그룹 추가 지원", "KE Group Extended Support"),
      desc: t(
        "모기업 KE 네트워크 및 계열사에 대한 기술적 개발 지원을 수행합니다.",
        "We provide technical development support for the parent KE Network and affiliated companies."
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-20">
        <p className="text-blue-400 text-xs tracking-[0.5em] uppercase mb-4">
          COMET PRODUCTION {t("산하", "Subsidiary")}
        </p>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-3">
          COMET
        </h1>
        <h2 className="text-2xl md:text-3xl font-light tracking-[0.4em] text-blue-400 mb-8">
          DEVELOPS
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          {t(
            "게임이라는 새로운 우주를 개척하고, COMET PRODUCTION의 기술적 가능성을 확장합니다.",
            "We pioneer a new universe called games, expanding the technological possibilities of COMET PRODUCTION."
          )}
        </p>
      </div>

      {/* Origin Banner */}
      <div className="glass-card p-6 border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 mb-16 flex items-start gap-4">
        <span className="text-2xl mt-0.5">🛰️</span>
        <div>
          <p className="text-blue-400 text-xs tracking-widest uppercase font-semibold mb-1">
            {t("설립 배경", "Background")}
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            {t(
              "COMET DEVELOPS는 COMET PRODUCTION의 새로운 시도 중 '개발'을 목적으로 설립된 자회사입니다. 게임 개발·관리·배급을 주요 사업으로 하며, 모기업인 KE 네트워크에 대한 추가적인 기술 지원도 수행합니다.",
              "COMET DEVELOPS is a subsidiary established for 'development' as one of COMET PRODUCTION's new ventures. Its main businesses are game development, management, and publishing, while also providing additional technical support for the parent KE Network."
            )}
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="mb-20">
        <p className="text-blue-400 text-xs tracking-[0.5em] uppercase mb-3 text-center">
          {t("주요 사업", "SERVICES")}
        </p>
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          {t("우리가 하는 일", "What We Do")}
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="glass-card p-7 border border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-transparent text-center">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h4 className="text-lg font-bold text-white mb-3">{s.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="glass-card p-10 text-center border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
        <h3 className="text-2xl font-bold text-white mb-4">
          {t("협업 또는 지원 문의", "Collaboration or Support Inquiry")}
        </h3>
        <p className="text-white/50 mb-6 text-sm">
          {t(
            "게임 개발 협업, 배급 파트너십, 기술 지원 등 다양한 문의를 받고 있습니다.",
            "We accept various inquiries including game development collaboration, publishing partnerships, and technical support."
          )}
        </p>
        <a
          href="/contact"
          className="inline-block px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30"
        >
          {t("문의하기", "Contact Us")}
        </a>
      </div>
    </div>
  );
}
