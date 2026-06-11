import type { Metadata } from "next";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { getMyEvaluationScores } from "@/lib/auth/store";
import EvaluationHistoryPanel from "@/components/evaluation/EvaluationHistoryPanel";

export const metadata: Metadata = {
  title: "내 성적 기록",
};

export default async function EvaluationHistoryPage() {
  const user = await requireEvaluationUser();
  const scores = await getMyEvaluationScores(user.id);

  return <EvaluationHistoryPanel scores={scores} memberName={user.name} />;
}
