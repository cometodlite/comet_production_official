import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "COMET EDU 공식 해산 및 StudyLab 서비스 종료 안내",
  description: "COMET EDU의 공식 해산과 StudyLab 서비스 종료 일정을 안내합니다.",
};

const timeline = [
  {
    date: "2026.06.17",
    title: "StudyLab 공식 운영 시작",
    description: "COMET EDU는 StudyLab을 통해 교육과 학습을 지원하는 공식 운영을 시작했습니다.",
  },
  {
    date: "2026.07.17",
    title: "StudyLab 서비스 종료 발표 · COMET EDU 공식 해산",
    description: "StudyLab의 공식 서비스 종료를 발표했으며, 같은 날 COMET DEVELOPS 산하 COMET EDU는 공식 해산 및 부서 폐지되었습니다.",
  },
  {
    date: "2026.08.01",
    title: "StudyLab 공식 서비스 종료",
    description: "StudyLab은 이 날짜를 기준으로 공식 서비스를 종료합니다.",
  },
];

export default function CometEduClosureNewsPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <Link href="/news" className="text-xs font-semibold text-emerald-300/80 transition hover:text-emerald-200">
        ← 뉴스로 돌아가기
      </Link>

      <header className="mt-8 border-b border-white/10 pb-10">
        <p className="text-xs font-bold tracking-[0.28em] text-emerald-300">COMET DEVELOPS · OFFICIAL NOTICE</p>
        <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
          COMET EDU 공식 해산 및 StudyLab 서비스 종료 안내
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#a1a1aa]">
          COMET DEVELOPS는 COMET EDU의 공식 해산과 StudyLab의 공식 서비스 종료 일정을 안내합니다.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/45">
          <span>2026.07.17</span>
          <span>COMET DEVELOPS</span>
          <span>공식 공지</span>
        </div>
      </header>

      <section className="mt-12 space-y-6 text-[17px] leading-8 text-[#c5c5cc]">
        <p>
          COMET DEVELOPS 산하 교육 부서 <strong className="font-semibold text-white">COMET EDU</strong>는 2026년 7월 17일부로 공식 해산 및 부서 폐지되었습니다.
        </p>
        <p>
          StudyLab은 2026년 6월 17일 공식 운영을 시작했습니다. 운영 시작 한 달 뒤인 7월 17일, StudyLab의 공식 서비스 종료를 발표했으며 서비스는 2026년 8월 1일에 공식 종료됩니다.
        </p>
        <p>
          COMET EDU의 해산에 따라 해당 부서는 더 이상 운영되지 않습니다. StudyLab의 남은 서비스 운영 일정은 8월 1일 공식 종료일까지 유지됩니다.
        </p>
      </section>

      <section className="mt-16 border-y border-white/10 py-10">
        <p className="text-xs font-bold tracking-[0.28em] text-emerald-300">TIMELINE</p>
        <ol className="mt-8 space-y-8">
          {timeline.map((item) => (
            <li key={item.date} className="grid gap-2 border-l-2 border-emerald-400/50 pl-5 sm:grid-cols-[120px_1fr] sm:gap-6">
              <time className="font-mono text-sm text-emerald-300">{item.date}</time>
              <div>
                <h2 className="text-lg font-bold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/60">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-7">
        <p className="text-xs font-bold tracking-[0.24em] text-emerald-300">OFFICIAL INFORMATION</p>
        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
          <div><dt className="text-white/45">COMET EDU 해산일</dt><dd className="mt-1 font-semibold text-white">2026년 7월 17일</dd></div>
          <div><dt className="text-white/45">StudyLab 운영 시작일</dt><dd className="mt-1 font-semibold text-white">2026년 6월 17일</dd></div>
          <div><dt className="text-white/45">StudyLab 종료 발표일</dt><dd className="mt-1 font-semibold text-white">2026년 7월 17일</dd></div>
          <div><dt className="text-white/45">StudyLab 공식 종료일</dt><dd className="mt-1 font-semibold text-white">2026년 8월 1일</dd></div>
        </dl>
      </section>

      <p className="mt-12 text-sm leading-7 text-white/45">
        문의 사항은 <a className="text-emerald-300 hover:text-emerald-200" href="mailto:cometodlite@kenet.co.kr">cometodlite@kenet.co.kr</a>로 연락해 주세요.
      </p>
    </article>
  );
}
