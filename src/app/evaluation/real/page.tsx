import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { isRealExamDay } from "@/lib/evaluation-schedule";
import RealEvaluationContent from "@/components/evaluation/RealEvaluationContent";

export const metadata: Metadata = {
  title: "실전 평가 페이지",
};

export default async function RealEvaluationPage() {
  await requireEvaluationUser();

  if (!isRealExamDay()) {
    redirect("/evaluation");
  }

  return <RealEvaluationContent />;
}
