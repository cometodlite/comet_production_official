import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EvaluationWorkspace from "@/components/evaluation/EvaluationWorkspace";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { getEvaluationPeriod } from "@/lib/evaluation-schedule";
import { getExamScheduleConfig } from "@/lib/auth/store";

export const metadata: Metadata = {
  title: "평가 페이지",
};

export default async function EvaluationPage() {
  const user = await requireEvaluationUser();

  const scheduleConfig = await getExamScheduleConfig(user.evaluationTrack ?? undefined);

  // 등록·실전 기간엔 연습 불가 → 실전 페이지로
  if (getEvaluationPeriod(scheduleConfig) !== "practice") {
    redirect("/evaluation/real");
  }

  return (
    <EvaluationWorkspace
      memberName={user.name}
      evaluationTrack={user.evaluationTrack}
      scheduleConfig={scheduleConfig}
    />
  );
}
