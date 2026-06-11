import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { getEvaluationPeriod } from "@/lib/evaluation-schedule";
import { getActiveExamQuestions, getExamScheduleConfig } from "@/lib/auth/store";
import {
  getHardcodedSetA,
  REAL_EXAM_DOCUMENT_ID,
  REAL_EXAM_DOCUMENT_TITLE,
} from "@/lib/evaluation/real-exam-questions";
import RealEvaluationContent from "@/components/evaluation/RealEvaluationContent";

export const metadata: Metadata = {
  title: "실전 평가 페이지",
};

export default async function RealEvaluationPage() {
  const user = await requireEvaluationUser();

  // 트랙별 일정 우선, 없으면 글로벌 일정
  const scheduleConfig = await getExamScheduleConfig(user.evaluationTrack ?? undefined);
  const period = getEvaluationPeriod(scheduleConfig);

  // 연습 기간엔 실전 페이지 접근 불가 → 연습으로
  if (period === "practice") {
    redirect("/evaluation");
  }

  // 트랙별 문제 세트 우선, 없으면 글로벌 → 하드코딩 fallback
  const dbQuestions = await getActiveExamQuestions(user.evaluationTrack ?? undefined);
  const questions = dbQuestions ?? getHardcodedSetA();

  return (
    <RealEvaluationContent
      period={period}
      memberName={user.name}
      evaluationTrack={user.evaluationTrack}
      questions={questions}
      documentId={REAL_EXAM_DOCUMENT_ID}
      documentTitle={REAL_EXAM_DOCUMENT_TITLE}
      scheduleConfig={scheduleConfig}
    />
  );
}
