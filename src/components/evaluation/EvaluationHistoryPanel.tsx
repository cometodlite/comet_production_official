"use client";

import { useState } from "react";
import type { EvaluationScore } from "@/lib/auth/store";
import {
  REAL_EXAM_DOCUMENT_ID,
  REAL_EXAM_ANSWER_KEY,
  MC_QUESTION_IDS,
  getHardcodedSetA,
} from "@/lib/evaluation/real-exam-questions";
import { useLang } from "@/context/LanguageContext";
import ReviewSession from "./ReviewSession";

// Keys that should never be shown to the applicant
const HIDDEN_KEYS = new Set(["_leave_count", "_paste_count"]);

// Filter out internal meta keys (_t_*, etc.) from visible responses
function isVisibleResponseKey(key: string) {
  return /^\d{1,2}$/.test(key) && !HIDDEN_KEYS.has(key);
}

function calcMcScore(responses: Record<string, string>) {
  let correct = 0;
  for (const id of MC_QUESTION_IDS) {
    if (responses[String(id)] === REAL_EXAM_ANSWER_KEY[id]) correct++;
  }
  return { correct, total: MC_QUESTION_IDS.length };
}

function ScoreBar({ correct, total }: { correct: number; total: number }) {
  const pct = Math.round((correct / total) * 100);
  const color =
    pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-indigo-400" : "bg-red-400";
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function HistoryCard({ score }: { score: EvaluationScore }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const isRealExam = score.documentId === REAL_EXAM_DOCUMENT_ID;
  const mcScore = isRealExam ? calcMcScore(score.responses) : null;

  // Identify wrong MC questions for review (Set A only)
  const wrongQuestions = isRealExam
    ? (() => {
        const allQuestions = getHardcodedSetA();
        return allQuestions.filter(
          (q) =>
            q.type === "choice" &&
            REAL_EXAM_ANSWER_KEY[Number(q.id)] !== undefined &&
            score.responses[q.id] !== REAL_EXAM_ANSWER_KEY[Number(q.id)],
        );
      })()
    : [];

  // Only entries with actual question-number keys (not hidden/meta keys)
  const visibleResponses = Object.entries(score.responses).filter(([key]) =>
    isVisibleResponseKey(key),
  );
  const answeredCount = visibleResponses.filter(([, v]) => v.trim() !== "").length;

  const submittedDate = new Date(score.submittedAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03]">
      {/* ── Collapsed header ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 text-left transition hover:bg-white/[0.03]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest ${
                  isRealExam
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                    : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                }`}
              >
                {isRealExam ? t("실전", "REAL") : t("연습", "PRACTICE")}
              </span>
              <span className="text-sm font-bold text-white">{score.documentTitle}</span>
            </div>

            {/* MC score preview (real exam only) */}
            {mcScore && (
              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{mcScore.correct}</span>
                  <span className="text-sm text-[#86868b]">/ {mcScore.total}</span>
                  <span className="ml-1 text-xs text-[#86868b]">{t("객관식 정답", "correct")}</span>
                </div>
                <ScoreBar correct={mcScore.correct} total={mcScore.total} />
              </div>
            )}

            {/* Practice: answer count */}
            {!isRealExam && (
              <p className="mt-1.5 text-xs text-[#86868b]">
                {t(`${answeredCount}문항 답안 제출`, `${answeredCount} answers submitted`)}
              </p>
            )}
          </div>

          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            {/* 합불 결과 */}
            {score.verdict === "pass" && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                ✓ 합격
              </span>
            )}
            {score.verdict === "fail" && (
              <span className="rounded-full border border-red-400/40 bg-red-500/15 px-2.5 py-0.5 text-[10px] font-black text-red-300">
                ✗ 불합격
              </span>
            )}
            {!score.verdict && isRealExam && (
              <span className="rounded-full border border-amber-400/25 bg-amber-500/[0.08] px-2.5 py-0.5 text-[10px] font-semibold text-amber-300/60">
                채점 대기 중
              </span>
            )}
            <span className="text-[10px] text-white/30">{submittedDate}</span>
            <span className="text-xs font-semibold text-[#86868b]">
              {score.evaluationDate}
            </span>
            <span className="mt-1 text-xs text-white/30">{open ? "↑" : "↓"}</span>
          </div>
        </div>
      </button>

      {/* ── Expanded answers ── */}
      {open && (
        <div className="border-t border-white/[0.06] px-5 py-5">

          {/* ── 합불 결과 상세 배너 ── */}
          {score.verdict && (
            <div
              className={`mb-5 rounded-lg border px-4 py-4 ${
                score.verdict === "pass"
                  ? "border-emerald-400/25 bg-emerald-500/[0.07]"
                  : "border-red-400/25 bg-red-500/[0.07]"
              }`}
            >
              <p
                className={`text-base font-black ${
                  score.verdict === "pass" ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {score.verdict === "pass"
                  ? t("✓ 최종 합격", "✓ PASSED")
                  : t("✗ 최종 불합격", "✗ NOT PASSED")}
              </p>
              {score.verdictNote && (
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                  {score.verdictNote}
                </p>
              )}
              {score.verdictAt && (
                <p className="mt-2 text-[10px] text-white/25">
                  {new Date(score.verdictAt).toLocaleString("ko-KR")} 결정
                </p>
              )}
            </div>
          )}

          {/* Review mode */}
          {reviewing ? (
            <ReviewSession
              wrongQuestions={wrongQuestions}
              originalResponses={score.responses}
              onClose={() => setReviewing(false)}
            />
          ) : (
            <>
              {/* Review CTA (real exam with wrong answers only) */}
              {isRealExam && wrongQuestions.length > 0 && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3">
                  <p className="text-sm text-amber-200/80">
                    {t(
                      `오답 ${wrongQuestions.length}문항을 다시 풀어볼 수 있습니다.`,
                      `You can retry ${wrongQuestions.length} wrong answer${wrongQuestions.length > 1 ? "s" : ""}.`,
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewing(true)}
                    className="flex-shrink-0 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-300"
                  >
                    {t("복습 시작", "Start Review")}
                  </button>
                </div>
              )}

              {isRealExam && wrongQuestions.length === 0 && mcScore && mcScore.correct > 0 && (
                <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-900/[0.07] px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-300">
                    {t("🎉 객관식 전문항 정답입니다!", "🎉 Perfect score on all MC questions!")}
                  </p>
                </div>
              )}

              <p className="mb-4 text-[10px] font-bold tracking-widest text-white/30">
                {t("제출 답안", "SUBMITTED ANSWERS")}
              </p>

              {visibleResponses.length === 0 ? (
                <p className="text-sm text-white/30">{t("저장된 답안이 없습니다.", "No answers recorded.")}</p>
              ) : (
                <div className="space-y-2">
                  {visibleResponses
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, value]) => {
                      const qNum = Number(key);
                      const isWritten = (qNum >= 11 && qNum <= 14) || qNum >= 19;
                      const isEmpty = !value.trim();
                      const isWrong =
                        isRealExam &&
                        !isWritten &&
                        !isEmpty &&
                        REAL_EXAM_ANSWER_KEY[qNum] !== undefined &&
                        value !== REAL_EXAM_ANSWER_KEY[qNum];
                      const isCorrectChoice =
                        isRealExam &&
                        !isWritten &&
                        !isEmpty &&
                        REAL_EXAM_ANSWER_KEY[qNum] !== undefined &&
                        value === REAL_EXAM_ANSWER_KEY[qNum];

                      return (
                        <div
                          key={key}
                          className={`flex gap-3 rounded-lg border px-4 py-3 ${
                            isWrong
                              ? "border-red-500/20 bg-red-500/[0.04]"
                              : isCorrectChoice
                              ? "border-emerald-500/15 bg-emerald-500/[0.03]"
                              : "border-white/[0.06] bg-white/[0.02]"
                          }`}
                        >
                          <span className="w-8 flex-shrink-0 text-xs font-bold text-white/40">
                            {key}{t("번", "")}
                          </span>
                          {isWritten ? (
                            <p className={`text-sm leading-relaxed break-words ${isEmpty ? "italic text-white/20" : "text-white/75"}`}>
                              {isEmpty ? t("미입력", "—") : value}
                            </p>
                          ) : (
                            <span
                              className={`text-sm font-bold ${
                                isEmpty
                                  ? "italic text-white/20"
                                  : isWrong
                                  ? "text-red-300"
                                  : isCorrectChoice
                                  ? "text-emerald-300"
                                  : "text-indigo-300"
                              }`}
                            >
                              {isEmpty ? t("미선택", "—") : `${value}번`}
                              {isWrong && (
                                <span className="ml-2 text-[10px] font-normal text-red-400/60">
                                  {t(`정답: ${REAL_EXAM_ANSWER_KEY[qNum]}번`, `ans: ${REAL_EXAM_ANSWER_KEY[qNum]}`)}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function EvaluationHistoryPanel({
  scores,
  memberName,
}: {
  scores: EvaluationScore[];
  memberName: string;
}) {
  const { t } = useLang();

  const realCount = scores.filter((s) => s.documentId === REAL_EXAM_DOCUMENT_ID).length;
  const practiceCount = scores.length - realCount;

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-2xl px-4 py-8 lg:px-6 lg:py-16">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 backdrop-blur-xl p-5 lg:p-8">

        {/* Header */}
        <div className="mb-7 border-b border-white/10 pb-6">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">
            COMET EVALUATION
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">
            {t("내 성적 기록", "My Score History")}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#86868b] lg:text-sm">
            {memberName}
            {scores.length > 0 && (
              <> · {t(`총 ${scores.length}건`, `${scores.length} total`)}</>
            )}
          </p>

          {/* Summary chips */}
          {scores.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {practiceCount > 0 && (
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
                  {t(`연습 ${practiceCount}회`, `Practice ×${practiceCount}`)}
                </span>
              )}
              {realCount > 0 && (
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
                  {t(`실전 ${realCount}회`, `Real ×${realCount}`)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score list */}
        {scores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 py-16 text-center">
            <p className="text-sm font-semibold text-white/30">
              {t("아직 제출된 답안이 없습니다.", "No submissions yet.")}
            </p>
            <p className="mt-2 text-xs text-white/20">
              {t("연습 문제 또는 실전 문제를 완료하면 여기에 기록됩니다.", "Complete a practice or real exam to see your history here.")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((score) => (
              <HistoryCard key={score.id} score={score} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
