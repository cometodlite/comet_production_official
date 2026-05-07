"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem, motion } from "@/components/Motion";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-violet-400 text-sm tracking-[0.5em] uppercase mb-4">
            COMET PRODUCTION {t("산하", "Subsidiary")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-3">
            <span className="gradient-text">COMET</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-light tracking-[0.45em] text-violet-400/80 mb-10">
            ENTERTAINERS
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-amber-500/60 text-sm tracking-[0.15em] mb-3 italic">
            _Talent. Care. Knowledge. Connection
          </p>
          <p className="text-white/30 text-sm tracking-widest mb-6 italic">
            Ingenium atque labor lux veritatis
          </p>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            {t(
              "KE ENTERTAINMENT의 정신을 이어받아, 아티스트와 함께 더 빛나는 무대를 만들어갑니다.",
              "Carrying the spirit of KE ENTERTAINMENT, we create brighter stages together with our artists."
            )}
          </p>
        </motion.div>
      </div>

      {/* Origin Banner */}
      <FadeUp className="glass-card p-6 border border-violet-500/30 bg-gradient-to-r from-violet-900/20 to-purple-900/20 mb-16 flex items-start gap-4">
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
      </FadeUp>

      {/* Services */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-3">
            {t("주요 사업", "SERVICES")}
          </p>
          <h3 className="text-3xl font-bold text-white">
            {t("우리가 하는 일", "What We Do")}
          </h3>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <StaggerItem key={i}>
              <motion.div
                className="glass-card p-7 border border-violet-500/20 bg-gradient-to-b from-violet-900/10 to-transparent text-center h-full"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h4 className="text-lg font-bold text-white mb-3">{s.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* 아티스트 갤러리 */}
      <div className="mb-20">
        <FadeUp className="text-center mb-12">
          <p className="text-violet-400 text-xs tracking-[0.5em] uppercase mb-3">
            {t("아티스트", "ARTISTS")}
          </p>
          <h3 className="text-3xl font-bold text-white">
            {t("소속 아티스트", "Our Artists")}
          </h3>
        </FadeUp>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 고구마오지터 */}
          <StaggerItem>
            <motion.div
              className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-violet-400/40 shrink-0">
                  <Image src="/artist-ojiter.png" alt="고구마오지터" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">고구마오지터</h4>
                  <p className="text-violet-400 text-xs tracking-widest mt-0.5">BROADCASTER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://chzzk.naver.com/754a62c3d0f2247bfee59349049a8612" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-green-400 transition-colors">
                  <Image src="/chzzk.webp" alt="치지직" width={20} height={20} className="rounded" />치지직
                </a>
                <a href="https://discord.gg/nVG4rYGV62" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-indigo-400 transition-colors">
                  <Image src="/discord.webp" alt="디스코드" width={20} height={20} className="rounded" />디스코드
                </a>
                <a href="https://www.instagram.com/sp_ojiter/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          {/* 주황파커 */}
          <StaggerItem>
            <motion.div
              className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-violet-400/40 shrink-0">
                  <Image src="/artist-parker.png" alt="주황파커" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">주황파커</h4>
                  <p className="text-violet-400 text-xs tracking-widest mt-0.5">YOUTUBER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://www.youtube.com/@parker0951_overwatch2/videos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors">
                  <Image src="/youtube.svg" alt="유튜브" width={20} height={20} className="rounded" />주황머리파커
                </a>
                <a href="https://www.youtube.com/@parker0951_second" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors">
                  <Image src="/youtube.svg" alt="유튜브" width={20} height={20} className="rounded" />주황마인파커
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          {/* 테마 */}
          <StaggerItem>
            <motion.div
              className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-violet-400/40 shrink-0">
                  <Image src="/theme.png" alt="테마" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">테마</h4>
                  <p className="text-violet-400 text-xs tracking-widest mt-0.5">BROADCASTER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://chzzk.naver.com/674d8882d0be4f9114bcc7f66d90dd65" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-green-400 transition-colors">
                  <Image src="/chzzk.webp" alt="치지직" width={20} height={20} className="rounded" />치지직
                </a>
                <a href="https://discord.gg/9nejxVtwF4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-indigo-400 transition-colors">
                  <Image src="/discord.webp" alt="디스코드" width={20} height={20} className="rounded" />디스코드
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          {/* 강하월 */}
          <StaggerItem>
            <motion.div
              className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-violet-400/40 shrink-0">
                  <Image src="/artist-ghw.jpg" alt="강하월" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">강하월</h4>
                  <p className="text-violet-400 text-xs tracking-widest mt-0.5">CREATOR</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-violet-300 border-violet-500/30 bg-violet-500/10">COMET LIVE 2기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://www.instagram.com/lunatic_rhygam.world/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
              </div>
              <Link href="/entertainers/ghw" className="mt-4 pt-3 border-t border-violet-500/10 flex items-center justify-between group/profile">
                <span className="text-xs text-violet-400/50 tracking-widest group-hover/profile:text-violet-300 transition-colors">{t("프로필 보기", "View Profile")}</span>
                <span className="text-violet-400/40 text-xs group-hover/profile:text-violet-300 group-hover/profile:translate-x-0.5 transition-all inline-block">→</span>
              </Link>
            </motion.div>
          </StaggerItem>

          {/* instar */}
          <StaggerItem>
            <motion.div
              className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-violet-400/30 flex items-center justify-center text-violet-400/50 text-xl shrink-0">✦</div>
                <div>
                  <h4 className="text-lg font-bold text-white">instar</h4>
                  <p className="text-violet-400 text-xs tracking-widest mt-0.5">CREATOR</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">COMET LIVE 1기</span>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Lunalite */}
          <StaggerItem>
            <motion.div
              className="glass-card p-7 border border-violet-500/25 bg-gradient-to-b from-violet-900/15 to-transparent group h-full"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-violet-400/40 shrink-0">
                  <Image src="/composer-lunalite.png" alt="Lunalite" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Lunalite</h4>
                  <p className="text-violet-400 text-xs tracking-widest mt-0.5">COMPOSER</p>
                </div>
              </div>
              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border text-amber-300 border-amber-500/30 bg-amber-500/10">COMET LIVE 1기</span>
              </div>
              <div className="flex flex-col gap-2">
                <a href="https://soundcloud.com/user-149250997" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-orange-400 transition-colors">
                  <Image src="/soundcloud.png" alt="SoundCloud" width={20} height={20} className="rounded" />SoundCloud
                </a>
                <a href="https://www.instagram.com/hibi_lunalite100/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/50 hover:text-pink-400 transition-colors">
                  <Image src="/instagram.png" alt="인스타그램" width={20} height={20} className="rounded" />인스타그램
                </a>
              </div>
              <Link href="/entertainers/lunalite" className="mt-4 pt-3 border-t border-violet-500/10 flex items-center justify-between group/profile">
                <span className="text-xs text-violet-400/50 tracking-widest group-hover/profile:text-violet-300 transition-colors">{t("프로필 보기", "View Profile")}</span>
                <span className="text-violet-400/40 text-xs group-hover/profile:text-violet-300 group-hover/profile:translate-x-0.5 transition-all inline-block">→</span>
              </Link>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* CTA */}
      <FadeUp>
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
          <motion.a
            href="/contact"
            className="inline-block px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/30"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t("문의하기", "Contact Us")}
          </motion.a>
        </div>
      </FadeUp>
    </div>
  );
}
