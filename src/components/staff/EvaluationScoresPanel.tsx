"use client";

import { useState } from "react";
import type { EvaluationScore } from "@/lib/auth/store";

const CHOICE_QUESTIONS = new Set([1,2,3,4,5,6,7,8,9,10,15,16,17,18]);
const WRITTEN_QUESTIONS = new Set([11,12,13,14,19,20]);

function QuestionRow({ number, value }: { number: number; value: string }) {
  const isWritten = WRITTEN_QUESTIONS.has(number);
  return (
    <div className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="w-8 flex-shrink-0 text-xs font-bold text-white/40">{number}번</span>
      {isWritten ? (
        <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap break-words">{value || <span className="text-white/25 italic">미입력</span>}</p>
      ) : (
        <span className={`text-sm font-bold ${value ? "text-indigo-300" : "text-white/25 italic"}`}>
          {value || "미선택"}
        </span>
      )}
    </div>
  );
}

function ScoreCard({ score }: { score: EvaluationScore }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.03] transition"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-white">
            {score.applicantName || score.memberName}
          </span>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-indigo-300">
            {score.documentTitle}
          </span>
          <span className="text-xs text-[#86868b]">{score.evaluationDate}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:block text-[10px] text-white/30">
            제출 {new Date(score.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-white/40 text-sm">{open ? "↑" : "↓"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-5 space-y-6">
          {/* 객관식 */}
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-widest text-indigo-300/80">객관식 (1~10번)</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <QuestionRow key={n} number={n} value={score.responses[String(n)] || ""} />
              ))}
            </div>
          </div>

          {/* 서술형 11~14 */}
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-widest text-indigo-300/80">단답 / 서술형 (11~14번)</p>
            <div className="space-y-2">
              {[11,12,13,14].map((n) => (
                <QuestionRow key={n} number={n} value={score.responses[String(n)] || ""} />
              ))}
            </div>
          </div>

          {/* 객관식 15~18 */}
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-widest text-indigo-300/80">객관식 (15~18번)</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[15,16,17,18].map((n) => (
                <QuestionRow key={n} number={n} value={score.responses[String(n)] || ""} />
              ))}
            </div>
          </div>

          {/* 서술형 19~20 */}
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-widest text-indigo-300/80">단답 / 서술형 (19~20번)</p>
            <div className="space-y-2">
              {[19,20].map((n) => (
                <QuestionRow key={n} number={n} value={score.responses[String(n)] || ""} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EvaluationScoresPanel({ scores }: { scores: EvaluationScore[] }) {
  const [filter, setFilter] = useState<string>("all");
  const members = Array.from(new Set(scores.map((s) => s.memberName)));

  const filtered = filter === "all" ? scores : scores.filter((s) => s.memberName === filter);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">평가 답안 기록</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
            평가 회원이 제출한 답안을 열람합니다. 이사회 전용입니다.
          </p>
        </div>
        <p className="text-xs font-semibold text-indigo-200/80">총 {scores.length}건</p>
      </div>

      {/* 멤버 필터 */}
      {members.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === "all"
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-white/15 text-white/50 hover:text-white"
            }`}
          >
            전체
          </button>
          {members.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                filter === m
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-white/15 text-white/50 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-white/30">
            {scores.length === 0 ? "아직 제출된 답안이 없습니다." : "선택한 회원의 제출 기록이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((score) => (
            <ScoreCard key={`${score.memberId}-${score.documentId}`} score={score} />
          ))}
        </div>
      )}
    </section>
  );
}
