import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "COMET AI 초대 베타 공개",
  description: "학습 AI Stutant와 일상 AI DAILIA를 하나로 잇는 COMET AI 초대 베타를 소개합니다.",
};

const features = {
  stutant: [
    "언어 및 이학 과목 질문·해설",
    "문제 사진 분석과 수학 기호·LaTeX 표현",
    "영어·일본어 대화 학습",
    "저장된 답변, 추가 질문, 오늘의 복습",
    "학습 노트·리포트와 단어 암기장",
    "사진 속 단어 추출, 플래시카드, 발음·오타 검사, 예문 생성",
  ],
  dailia: [
    "자유로운 AI 대화",
    "생각과 할 일 정리",
    "문장 다듬기와 번역",
    "일정·계획 수립",
    "저장된 대화 관리",
    "STAR-1.0 모델 기반의 간결한 사용 경험",
  ],
};

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-white/10 bg-[#10131c]">
      <img src={src} alt={alt} className="block h-auto w-full" />
    </figure>
  );
}

export default function CometAiNewsPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <Link href="/news" className="text-xs font-semibold text-cyan-300/80 transition hover:text-cyan-200">
        ← 뉴스로 돌아가기
      </Link>

      <header className="mt-8 border-b border-white/10 pb-10">
        <p className="text-xs font-bold tracking-[0.28em] text-cyan-300">COMET AI · INVITE BETA</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
          COMET, 학습과 일상을 연결하는 ‘COMET AI’ 초대 베타 공개
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#a1a1aa]">
          COMET PRODUCTION은 학습과 일상생활을 하나의 AI 서비스 안에서 지원하는 COMET AI의 초대 베타를 공개했다.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/45">
          <span>2026.07.17</span>
          <span>개발 · Luna-1o (COMET DEV.)</span>
          <span>검토 · COMET PRODUCTION in COMET DEVELOPS</span>
        </div>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <ArticleImage src="/news/comet-ai/stutant-language-conversation.png" alt="Stutant 영어 대화 학습 화면" />
        <ArticleImage src="/news/comet-ai/dailia-conversation.png" alt="DAILIA 일상 AI 대화 화면" />
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 text-[17px] leading-8 text-[#c5c5cc]">
          <p>
            COMET AI는 공부를 돕는 <strong className="font-semibold text-white">Stutant 1.61</strong>과 일상을 돕는 <strong className="font-semibold text-white">DAILIA Beta 0.61</strong>으로 구성된다. 사용자는 상단 전환 버튼을 통해 목적에 맞는 AI 작업 공간으로 자연스럽게 이동할 수 있다.
          </p>
          <p>
            현재 서비스는 소수 사용자를 대상으로 한 초대 베타 단계다. COMET은 실제 사용자 의견을 바탕으로 답변 품질과 안정성, 학습 기능, 모바일 사용성을 계속 개선할 계획이다.
          </p>
          <blockquote className="border-l-2 border-cyan-300 pl-5 text-xl font-medium leading-9 text-white">
            “COMET AI는 정답을 대신 말해주는 도구를 넘어, 사용자가 공부하고 생각한 과정이 다음 학습과 일상으로 이어지도록 만드는 것을 목표로 합니다.”
          </blockquote>
        </div>

        <aside className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
          <p className="text-xs font-bold tracking-[0.24em] text-cyan-300">SERVICE INFORMATION</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-white/45">서비스명</dt><dd className="mt-1 font-semibold text-white">COMET AI</dd></div>
            <div><dt className="text-white/45">구성</dt><dd className="mt-1 text-white/85">Stutant 1.61 + DAILIA Beta 0.61</dd></div>
            <div><dt className="text-white/45">출시 단계</dt><dd className="mt-1 text-white/85">소수 사용자 대상 초대 베타</dd></div>
            <div><dt className="text-white/45">서비스 주소</dt><dd className="mt-1"><a className="text-cyan-300 hover:text-cyan-200" href="https://stutant.kenet.co.kr" target="_blank" rel="noreferrer">stutant.kenet.co.kr</a></dd></div>
            <div><dt className="text-white/45">COMET 사이트</dt><dd className="mt-1"><a className="text-cyan-300 hover:text-cyan-200" href="https://comet.kenet.co.kr" target="_blank" rel="noreferrer">comet.kenet.co.kr</a></dd></div>
            <div><dt className="text-white/45">문의</dt><dd className="mt-1"><a className="text-cyan-300 hover:text-cyan-200" href="mailto:cometodlite@kenet.co.kr">cometodlite@kenet.co.kr</a></dd></div>
          </dl>
        </aside>
      </section>

      <section className="mt-20">
        <p className="text-xs font-bold tracking-[0.28em] text-cyan-300">STUTANT</p>
        <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">정답을 넘어 학습 과정을 잇는 AI</h2>
        <p className="mt-5 max-w-3xl text-[17px] leading-8 text-[#c5c5cc]">
          Stutant는 질문 하나에 답을 제시하는 데 그치지 않고, 해설과 복습, 단어 암기, 학습 기록까지 이어지는 경험을 목표로 한다. 텍스트 질문은 물론 문제 사진을 분석하고, 언어 학습과 수학·과학 중심의 이학 학습을 지원한다.
        </p>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {features.stutant.map((feature) => <li key={feature} className="border-b border-white/10 py-3 text-sm text-white/75">{feature}</li>)}
        </ul>
        <div className="mt-8">
          <ArticleImage src="/news/comet-ai/stutant-question-analysis.png" alt="Stutant 언어 문제 해설과 사진 첨부 화면" />
        </div>
      </section>

      <section className="mt-20">
        <p className="text-xs font-bold tracking-[0.28em] text-[#8ca9ff]">DAILIA</p>
        <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">생각과 작업을 정리하는 일상 AI</h2>
        <p className="mt-5 max-w-3xl text-[17px] leading-8 text-[#c5c5cc]">
          DAILIA는 대화를 중심으로 사용하는 일상 AI다. 생각과 할 일을 정리하고 문장을 다듬거나 번역·계획 수립·일상적인 질문을 돕는다. 필요한 보조 도구는 입력창의 + 버튼에서 선택할 수 있도록 설계했다.
        </p>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {features.dailia.map((feature) => <li key={feature} className="border-b border-white/10 py-3 text-sm text-white/75">{feature}</li>)}
        </ul>
        <div className="mt-8">
          <ArticleImage src="/news/comet-ai/dailia-planning.png" alt="DAILIA 생각 정리 대화 화면" />
        </div>
      </section>

      <section className="mt-20 border-y border-white/10 py-10">
        <h2 className="text-2xl font-black text-white">어디서나 이어지는 사용 경험</h2>
        <p className="mt-4 max-w-3xl text-[17px] leading-8 text-[#c5c5cc]">
          COMET AI는 데스크톱과 모바일 환경을 모두 지원하며, 웹사이트를 앱처럼 설치할 수 있는 PWA 기능을 제공한다. 라이트·다크 모드, 기존·최신 디자인 선택, 새 버전 감지와 업데이트 안내, 사용자별 기록 및 사용량 관리도 포함한다.
        </p>
        <p className="mt-6 text-sm leading-7 text-white/45">
          생성형 AI의 특성상 부정확한 답변이 만들어질 수 있습니다. 중요한 학습 내용과 일정 정보는 공식 자료와 함께 확인하는 것을 권장합니다.
        </p>
      </section>
    </article>
  );
}
