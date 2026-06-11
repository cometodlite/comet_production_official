"use client";

import { useLang } from "@/context/LanguageContext";
import { getNextPeriodChangeTime } from "@/lib/evaluation-schedule";
import type { EvaluationPeriod, ExamScheduleConfig } from "@/lib/evaluation-schedule";
import type { EvaluationTrack } from "@/lib/auth/evaluation-tracks";
import type { ExamQuestionData } from "@/lib/evaluation/exam-types";
import RealExamWorkspace from "./RealExamWorkspace";
import PeriodCountdownBanner from "./PeriodCountdownBanner";

export default function RealEvaluationContent({
  period,
  memberName,
  evaluationTrack,
  questions,
  documentId,
  documentTitle,
  scheduleConfig,
}: {
  period: EvaluationPeriod;
  memberName?: string;
  evaluationTrack?: EvaluationTrack;
  questions: ExamQuestionData[];
  documentId: string;
  documentTitle: string;
  scheduleConfig?: ExamScheduleConfig;
}) {
  const { t } = useLang();

  // 실전 기간이면 실전 시험 워크스페이스 렌더
  if (period === "real-exam") {
    return (
      <RealExamWorkspace
        memberName={memberName ?? ""}
        evaluationTrack={evaluationTrack}
        questions={questions}
        documentId={documentId}
        documentTitle={documentTitle}
        scheduleConfig={scheduleConfig}
      />
    );
  }

  // 등록 기간 안내
  // 오늘이 실전일 오전이면 "오늘 12:00", 등록일이면 "내일 12:00"
  const { label: nextLabel } = getNextPeriodChangeTime(scheduleConfig);
  const isToday = nextLabel.startsWith("오늘");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl items-center px-4 py-10 lg:px-6 lg:py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-10 text-center backdrop-blur-xl lg:p-12">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">
          COMET EVALUATION
        </p>

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-white/[0.03]">
          <span className="text-2xl text-amber-400/40">⏳</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">
          {t("실전 역량평가", "Real Evaluation")}
        </h1>

        {/* ── 실전 시험까지 카운트다운 ── */}
        <PeriodCountdownBanner variant="default" scheduleConfig={scheduleConfig} />

        <div className="mx-auto mb-4 h-px w-12 bg-white/10" />

        <p className="text-sm font-semibold leading-relaxed text-amber-200/80">
          {isToday
            ? t("오늘 12:00에 시험이 시작됩니다.", "The exam starts today at 12:00.")
            : t("내일 12:00에 시험이 시작됩니다.", "The exam starts tomorrow at 12:00.")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#86868b]">
          {t(
            "실전 문제는 시험 시작 시각 이후부터 공개됩니다.",
            "Exam questions will be available from the start time.",
          )}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#86868b]/50">
          {isToday
            ? t("잠시 후 다시 접속해 주세요.", "Please return shortly.")
            : t("내일 12:00 이후 다시 접속해 주세요.", "Please return after 12:00 tomorrow.")}
        </p>
      </section>
    </div>
  );
}
