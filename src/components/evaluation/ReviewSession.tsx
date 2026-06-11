"use client";

import { useState } from "react";
import type { ExamQuestionData } from "@/lib/evaluation/exam-types";
import { useLang } from "@/context/LanguageContext";

const CIRCLE_LABELS = ["①", "②", "③", "④", "⑤"] as const;

// ── sub-component: one question card ─────────────────────────────────────────

function ReviewQuestionCard({
  q,
  idx,
  originalAnswer,
}: {
  q: ExamQuestionData;
  idx: number;
  originalAnswer: string;
}) {
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = selected !== null;
  const isCorrect = selected === q.correctAnswer;

  function handleSelect(val: string) {
    if (revealed) return;
    setSelected(val);
  }

  function choiceStyle(val: string) {
    const choiceNum = String(val);
    if (!revealed) {
      // Before answering: highlight original wrong answer subtly
      if (choiceNum === originalAnswer) {
        return "border-red-400/30 bg-red-500/[0.06] text-red-200/70";
      }
      return "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.06]";
    }
    // After answering
    if (choiceNum === q.correctAnswer) {
      return "border-emerald-400/50 bg-emerald-500/10 text-emerald-200 font-semibold";
    }
    if (choiceNum === selected && !isCorrect) {
      return "border-red-400/40 bg-red-500/10 text-red-300";
    }
    if (choiceNum === originalAnswer && choiceNum !== selected) {
      return "border-red-400/20 bg-red-500/[0.04] text-red-400/50";
    }
    return "border-white/[0.05] bg-white/[0.02] text-white/30";
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        revealed
          ? isCorrect
            ? "border-emerald-500/20 bg-emerald-900/[0.07]"
            : "border-red-500/20 bg-red-900/[0.07]"
          : "border-white/[0.07] bg-white/[0.025]"
      }`}
    >
      {/* Question header */}
      <div className="mb-3 flex items-start gap-2">
        <span className="flex-shrink-0 rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-white/50">
          Q{idx + 1}
        </span>
        {revealed && (
          <span
            className={`flex-shrink-0 text-xs font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}
          >
            {isCorrect ? t("✓ 정답!", "✓ Correct!") : t("✗ 오답", "✗ Wrong")}
          </span>
        )}
      </div>

      {/* Question text */}
      <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-white">
        {q.text}
      </p>

      {/* Choices */}
      {q.choices && (
        <div className="space-y-2">
          {q.choices.map((choice, i) => {
            const val = String(i + 1);
            return (
              <button
                key={val}
                type="button"
                disabled={revealed}
                onClick={() => handleSelect(val)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${choiceStyle(val)} ${
                  !revealed ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="flex-shrink-0 font-semibold">
                  {CIRCLE_LABELS[i]}
                </span>
                <span className="text-left">{choice}</span>
                {/* Indicators */}
                {revealed && val === q.correctAnswer && (
                  <span className="ml-auto flex-shrink-0 text-emerald-400">✓</span>
                )}
                {revealed && val === selected && !isCorrect && (
                  <span className="ml-auto flex-shrink-0 text-red-400">✗</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Original answer reminder (before answering) */}
      {!revealed && (
        <p className="mt-3 text-[10px] text-white/25">
          {t(`이전 답: ${originalAnswer}번`, `Your previous answer: ${originalAnswer}`)}
        </p>
      )}

      {/* Explanation (after answering) */}
      {revealed && q.explanation && (
        <div
          className={`mt-4 rounded-md px-3 py-3 text-xs leading-relaxed ${
            isCorrect
              ? "bg-emerald-900/20 text-emerald-200/80"
              : "bg-indigo-900/20 text-indigo-200/80"
          }`}
        >
          <span className="font-semibold">{t("해설: ", "Explanation: ")}</span>
          {q.explanation}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ReviewSession({
  wrongQuestions,
  originalResponses,
  onClose,
}: {
  wrongQuestions: ExamQuestionData[];
  originalResponses: Record<string, string>;
  onClose: () => void;
}) {
  const { t } = useLang();

  if (wrongQuestions.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-900/10 px-4 py-5 text-center">
        <p className="text-sm font-bold text-emerald-300">
          {t("오답이 없습니다! 완벽한 점수입니다.", "No wrong answers — perfect score!")}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-white/40 underline"
        >
          {t("닫기", "Close")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-amber-300/70">
            {t("복습 모드", "REVIEW MODE")}
          </p>
          <p className="mt-0.5 text-sm font-bold text-white">
            {t(`오답 ${wrongQuestions.length}문항`, `${wrongQuestions.length} wrong answers`)}
          </p>
          <p className="mt-0.5 text-[11px] text-white/35">
            {t(
              "선택지를 클릭해 다시 풀어보세요. 정답과 해설이 즉시 표시됩니다.",
              "Click a choice to try again. Answer and explanation are revealed immediately.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:text-white"
        >
          {t("닫기", "Close")}
        </button>
      </div>

      {/* Question list */}
      <div className="space-y-4">
        {wrongQuestions.map((q, idx) => (
          <ReviewQuestionCard
            key={q.id}
            q={q}
            idx={idx}
            originalAnswer={originalResponses[q.id] || "?"}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-lg border border-white/10 py-2.5 text-sm font-semibold text-white/50 transition hover:text-white"
      >
        {t("복습 닫기", "Close Review")}
      </button>
    </div>
  );
}
