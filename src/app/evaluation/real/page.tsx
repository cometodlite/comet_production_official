import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { getEvaluationPeriod } from "@/lib/evaluation-schedule";
import RealEvaluationContent from "@/components/evaluation/RealEvaluationContent";

export const metadata: Metadata = {
  title: "실전 평가 페이지",
};

export default async function RealEvaluationPage() {
  await requireEvaluationUser();

  const period = getEvaluationPeriod();

  // 연습 기간엔 실전 페이지 접근 불가 → 연습으로
  if (period === "practice") {
    redirect("/evaluation");
  }

  // 등록 기간(4·14·24일): 문제 비공개 안내
  // 실전 기간(5·15·25일): 실전 문제 (현재는 준비 중 안내)
  return <RealEvaluationContent period={period} />;
}
