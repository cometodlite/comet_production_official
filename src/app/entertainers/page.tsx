"use client";

import Image from "next/image";
import { useLang } from "@/context/LanguageContext";

export default function EntertainersPage() {
  const { t } = useLang();

  const services = [
    {
      icon: "🎤",
      title: t("아티스트 발굴", "Artist Discovery"),
      desc: t(
        "잠재력 있는 아티스트를 발굴하고 성장할 수 있는 환경을 제공합니다.",
        "We discover artists with potential and provide an environment for them to grow."
      ),
    },
    {
      icon: "🌟",
      title: t("아티스트 관리", "Artist Management"),
      desc: t(
        "아티스트의 커리어 전반을 체계적으로 관리하고 지원합니다.",
        "We systematically manage and support every aspect of an artist's career."
      ),
    },
    {
      icon: "🚀",
      title: t("아티스트 지원", "Artist Support"),
      desc: t(
        "프로모션, 콘텐츠 제작, 팬 커뮤니티 운영 등 다양한 지원을 제공합니다.",
        "We provide diverse support including promotion, content creation, and fan community management."
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-20">
        <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-8">
          COMET PRODUCTION {t("산하", "Subsidiary")}
        </p>
        {/* 실제 로고 이미지 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl px-10 py-6 inline-block shadow-lg shadow-violet-500/10">
            <Image
              src="/logo-entertainers.jpg"
              alt="COMET ENTERTAINERS"
              width={320}
              height={100}
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-violet-300/70 text-base tracking-[0.08em] mb-3 italic">
          _Talent. Care. Knowledge. Connection
        </p>
        <p className="text-white/30 text-sm tracking-widest mb-8 italic">
          Ingenium atque labor lux veritatis
        </p>
        <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
          {t(
            "KE ENTERTAINMENT의 정신을 이어받아, 아티스트와 함께 더 빛나는 무대를 만들어갑니다.",
            "Carrying the spirit of KE ENTERTAINMENT, we create brighter stages together with our artists."
          )}
        </p>
      </div>

      {/* Origin Banner */}
      <div className="glass-card p-6 border border-violet-500/30 bg-gradient-to-r from-violet-900/20 to-purple-900/20 mb-16 flex items-start gap-4">
        <span className="text-2xl mt-0.5">📜</span>
        <div>
          <p className="text-violet-400 text-xs tracking-widest uppercase font-semibold mb-1">
            {t("설립 배경", "Background")}
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            {t(
              "COMET ENTERTAINERS는 KE NETWORK 산하 KE ENTERTAINMENT의 뒤를 이어, COMET PRODUCTION에서 파생된 엔터테인먼트 전문 자회사입니다. KE ENTERTAINMENT가 쌓아온 경험과 노하우를 바탕으로, 아티스트 중심의 새로운 엔터테인먼트 생태계를 구축합니다.",
              "COMET ENTERTAINERS is an entertainment-focused subsidiary derived from COMET PRODUCTION, succeeding KE ENTERTAINMENT under KE NETWORK. Built on the experience and know-how accumulated by KE ENTERTAINMENT, we establish a new artist-centered entertainment ecosystem."
            )}
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="mb-20">
        <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-3 text-center">
          {t("주요 사업", "SERVICES")}
        </p>
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          {t("우리가 하는 일", "What We Do")}
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="glass-card p-7 border border-violet-500/20 bg-gradient-to-b from-violet-900/10 to-transparent text-center">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h4 className="text-lg font-bold text-white mb-3">{s.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 아티스트 갤러리 */}
      <div className="mb-20">
        <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-3 text-center">
          {t("아티스트", "ARTISTS")}
        </p>
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          {t("소속 아티스트", "Our Artists")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 고구마오지터 */}
          <div className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl font-black text-white shrink-0">
                고
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">고구마오지터</h4>
                <p className="text-violet-400 text-xs tracking-widest mt-0.5">BROADCASTER</p>
              </div>
            </div>
            <div className="mb-5">
              <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">
                COMET LIVE 2기
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://chzzk.naver.com/754a62c3d0f2247bfee59349049a8612" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-green-400 transition-colors">
                <span className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center text-green-400 text-[10px] font-bold">치</span>
                치지직
              </a>
              <a href="https://discord.gg/nVG4rYGV62" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-indigo-400 transition-colors">
                <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px]">D</span>
                디스코드
              </a>
              <a href="https://www.instagram.com/sp_ojiter/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                <span className="w-5 h-5 rounded bg-pink-500/20 flex items-center justify-center text-pink-400 text-[10px]">ig</span>
                인스타그램
              </a>
            </div>
          </div>

          {/* 추가 슬롯 */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card border border-violet-500/10 flex flex-col items-center justify-center gap-3 text-white/20 min-h-[200px]">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-2xl">
                ✦
              </div>
              <p className="text-xs tracking-widest">{t("준비 중", "Coming Soon")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="glass-card p-10 text-center border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-purple-900/20">
        <h3 className="text-2xl font-bold text-white mb-4">
          {t("함께하고 싶으신가요?", "Want to Work with Us?")}
        </h3>
        <p className="text-white/50 mb-6 text-sm">
          {t(
            "아티스트 지원이나 협업 문의는 언제든지 환영합니다.",
            "We welcome inquiries for artist support or collaboration at any time."
          )}
        </p>
        <a
          href="/contact"
          className="inline-block px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/30"
        >
          {t("문의하기", "Contact Us")}
        </a>
      </div>
    </div>
  );
}
