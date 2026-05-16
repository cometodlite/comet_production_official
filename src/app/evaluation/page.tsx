import type { Metadata } from "next";
import EvaluationWorkspace from "@/components/evaluation/EvaluationWorkspace";
import { requireEvaluationUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "평가 페이지",
};

export default async function EvaluationPage() {
  const user = await requireEvaluationUser();

  return <EvaluationWorkspace memberName={user.name} />;
}
