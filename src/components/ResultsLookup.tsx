"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VerdictLookup } from "@/lib/auth/store";
import { IconSearch, IconFileSearch } from "@/components/icons/LineIcons";

// ── 결과 카드 ────────────────────────────────────────────────────────────────

function VerdictCard({ result }: { result: VerdictLookup }) {
  const { verdict, verdictNote, verdictAt, evaluationTrack, evaluationDate, documentTitle } = result;

  if (!verdict) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300/70">
            결과 대기 중
          </span>
          <span className="text-xs text-white/30">{evaluationDate}</span>
        </div>
        <p className="text-sm leading-relaxed text-white/50">
          이사회가 채점을 진행 중입니다. 결과가 확정되면 이 페이지에서 바로 확인하실 수 있습니다.
        </p>
        <p className="mt-2 text-xs text-white/25">
          {evaluationTrack} · {documentTitle}
        </p>
      </div>
    );
  }

  const isPass = verdict === "pass";

  return (
    <div
      className={`rounded-xl border p-6 ${
        isPass
          ? "border-emerald-400/25 bg-emerald-500/[0.06]"
          : "border-red-400/25 bg-red-500/[0.06]"
      }`}
    >
      {/* 결과 헤더 */}
      <div className="mb-4 flex items-start gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border text-xl ${
            isPass
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
              : "border-red-400/30 bg-red-500/15 text-red-300"
          }`}
        >
          {isPass ? "✓" : "✗"}
        </div>
        <div>
          <p
            className={`text-2xl font-black tracking-tight ${
              isPass ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {isPass ? "최종 합격" : "최종 불합격"}
          </p>
          <p className="mt-0.5 text-xs text-white/35">
            {evaluationTrack} · {evaluationDate}
          </p>
        </div>
      </div>

      {/* 코멘트 */}
      {verdictNote && (
        <div className="mb-4 rounded-lg border border-white/[0.06] bg-black/20 px-4 py-3">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-white/30">이사회 코멘트</p>
          <p className="text-sm leading-relaxed text-white/65">{verdictNote}</p>
        </div>
      )}

      {/* 결정 시각 */}
      {verdictAt && (
        <p className="text-[11px] text-white/20">
          결정일시 {new Date(verdictAt).toLocaleString("ko-KR")}
        </p>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export default function ResultsLookup({
  initialName,
  results,
}: {
  initialName: string;
  results: VerdictLookup[] | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/results?name=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-xl px-4 py-16 lg:px-6 lg:py-24">
      <section className="rounded-2xl border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl lg:p-10">

        {/* 헤더 */}
        <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">
          COMET EVALUATION
        </p>
        <h1 className="mb-1 text-3xl font-black tracking-tight text-white">
          합격 여부 조회
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          실전 역량평가 응시 시 입력한 이름을 입력하세요.
        </p>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="응시자 이름 입력"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            조회
          </button>
        </form>

        {/* 결과 영역 */}
        <div className="mt-8">
          {/* 검색 전 */}
          {results === null && (
            <div className="py-8 text-center">
              <IconSearch size={30} className="mx-auto text-white/15" strokeWidth={1.25} />
              <p className="mt-3 text-sm text-white/30">이름을 입력하고 조회 버튼을 눌러주세요.</p>
            </div>
          )}

          {/* 검색했지만 결과 없음 */}
          {results !== null && results.length === 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-8 text-center">
              <IconFileSearch size={30} className="mx-auto text-white/20" strokeWidth={1.25} />
              <p className="mt-3 text-sm font-semibold text-white/50">
                &apos;{initialName}&apos;으로 등록된 응시 기록을 찾을 수 없습니다.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/25">
                이름은 실전 평가 응시 시 직접 입력한 이름과 정확히 일치해야 합니다.
              </p>
            </div>
          )}

          {/* 결과 있음 */}
          {results !== null && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold tracking-widest text-white/30">
                &apos;{initialName}&apos; 조회 결과
              </p>
              {results.map((r, i) => (
                <VerdictCard key={i} result={r} />
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
