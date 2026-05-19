import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EvaluationWorkspace from "@/components/evaluation/EvaluationWorkspace";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { getEvaluationPeriod } from "@/lib/evaluation-schedule";

export const metadata: Metadata = {
  title: "평가 페이지",
};

export default async function EvaluationPage() {
  const user = await requireEvaluationUser();

  // 등록 기간(4·14·24일) 또는 실전 기간(5·15·25일)엔 연습 불가 → 실전 페이지로
  if (getEvaluationPeriod() !== "practice") {
    redirect("/evaluation/real");
  }

  return (
    <EvaluationWorkspace
      memberName={user.name}
      evaluationTrack={user.evaluationTrack}
    />
  );
}
