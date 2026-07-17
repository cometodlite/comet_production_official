import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { standardNewsArticles } from "@/data/news-articles";

const accentStyles = {
  amber: "text-amber-300 border-amber-400/20 bg-amber-400/[0.06]",
  violet: "text-violet-300 border-violet-400/20 bg-violet-400/[0.06]",
  blue: "text-blue-300 border-blue-400/20 bg-blue-400/[0.06]",
  slate: "text-slate-300 border-slate-400/20 bg-slate-400/[0.06]",
  emerald: "text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]",
};

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = standardNewsArticles[id];

  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { id } = await params;

  if (id === "5") redirect("/news/comet-ai");

  const article = standardNewsArticles[id];
  if (!article) notFound();

  const accent = accentStyles[article.accent];

  return (
    <article className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <Link href="/news" className="text-xs font-semibold text-white/55 transition hover:text-white">
        ← 뉴스로 돌아가기
      </Link>

      <header className="mt-8 border-b border-white/10 pb-10">
        <p className={`text-xs font-bold tracking-[0.28em] ${accent.split(" ")[0]}`}>{article.tag} · OFFICIAL NOTICE</p>
        <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">{article.title}</h1>
        <p className="mt-3 text-sm tracking-wide text-white/35">{article.englishTitle}</p>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#a1a1aa]">{article.summary}</p>
        <div className="mt-7 text-sm text-white/45">{article.date} · COMET PRODUCTION</div>
      </header>

      <section className="mt-12 space-y-6 text-[17px] leading-8 text-[#c5c5cc]">
        {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      {article.timeline && (
        <section className="mt-16 border-y border-white/10 py-10">
          <p className={`text-xs font-bold tracking-[0.28em] ${accent.split(" ")[0]}`}>TIMELINE</p>
          <ol className="mt-8 space-y-8">
            {article.timeline.map((item) => (
              <li key={item.date} className={`grid gap-2 border-l-2 pl-5 sm:grid-cols-[120px_1fr] sm:gap-6 ${article.accent === "emerald" ? "border-emerald-400/50" : "border-white/25"}`}>
                <time className={`font-mono text-sm ${accent.split(" ")[0]}`}>{item.date}</time>
                <div>
                  <h2 className="text-lg font-bold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {article.facts && (
        <section className={`mt-16 rounded-lg border p-7 ${accent}`}>
          <p className="text-xs font-bold tracking-[0.24em]">OFFICIAL INFORMATION</p>
          <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
            {article.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-white/45">{fact.label}</dt>
                <dd className="mt-1 font-semibold text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-12 text-sm leading-7 text-white/45">
        문의 사항은 <a className="text-white/75 hover:text-white" href="mailto:cometodlite@kenet.co.kr">cometodlite@kenet.co.kr</a>로 연락해 주세요.
      </p>
    </article>
  );
}
