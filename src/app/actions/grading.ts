"use server";

import { requireStaffGroup } from "@/lib/auth/current-user";
import { saveWrittenGrade } from "@/lib/auth/store";

/**
 * 이사회 전용: 서술형 답안 채점 결과를 저장합니다.
 */
export async function gradeWrittenAnswer(input: {
  evaluationScoreId: string;
  questionKey: string;
  score: number;
  maxScore: number;
  comment: string;
}): Promise<{ ok: true } | { error: string }> {
  const user = await requireStaffGroup("board");

  if (input.score < 0 || input.score > input.maxScore) {
    return { error: `점수는 0~${input.maxScore} 사이여야 합니다.` };
  }

  await saveWrittenGrade({
    evaluationScoreId: String(input.evaluationScoreId).slice(0, 100),
    questionKey: String(input.questionKey).slice(0, 10),
    score: Math.round(input.score),
    maxScore: Math.round(input.maxScore),
    comment: String(input.comment ?? "").slice(0, 500),
    gradedBy: user.name || user.email,
  });

  return { ok: true };
}
