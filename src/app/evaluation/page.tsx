import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EvaluationWorkspace from "@/components/evaluation/EvaluationWorkspace";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { isRealExamDay } from "@/lib/evaluation-schedule";

export const metadata: Metadata = {
  title: "평가 페이지",
};

export default async function EvaluationPage() {
  const user = await requireEvaluationUser();

  if (isRealExamDay()) {
    redirect("/evaluation/real");
  }

  return (
    <EvaluationWorkspace
      memberName={user.name}
      evaluationTrack={user.evaluationTrack}
    />
  );
}
