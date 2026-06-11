"use server";

import { requireStaffGroup } from "@/lib/auth/current-user";
import { setEvaluationVerdict, listEvaluationScores, getMemberEmailById } from "@/lib/auth/store";
import type { EvaluationVerdict } from "@/lib/auth/store";
import { sendEmail, makeVerdictEmail } from "@/lib/email";

/**
 * 이사회 전용: 특정 평가 답안의 합불 결과를 설정하고,
 * 결정 시 지원자에게 이메일로 결과를 통보합니다.
 * verdict = null 이면 결정을 취소(미결정, 이메일 없음)합니다.
 */
export async function saveEvaluationVerdict(input: {
  evaluationScoreId: string;
  verdict: EvaluationVerdict | null;
  note: string;
}): Promise<{ ok: true } | { error: string }> {
  await requireStaffGroup("board");

  if (input.verdict !== null && input.verdict !== "pass" && input.verdict !== "fail") {
    return { error: "verdict는 pass 또는 fail이어야 합니다." };
  }

  try {
    await setEvaluationVerdict({
      evaluationScoreId: String(input.evaluationScoreId).slice(0, 100),
      verdict: input.verdict,
      note: String(input.note ?? "").slice(0, 500),
    });

    // 합불 확정 시 지원자에게 이메일 통보 (비동기, 실패해도 저장은 성공)
    if (input.verdict) {
      const scoreId = String(input.evaluationScoreId).slice(0, 100);

      // 해당 score의 memberId로 이메일 조회
      const allScores = await listEvaluationScores();
      const score = allScores.find((s) => s.id === scoreId);
      if (score) {
        const email = await getMemberEmailById(score.memberId);
        if (email) {
          const { subject, html } = makeVerdictEmail({
            applicantName: score.applicantName || score.memberName,
            verdict: input.verdict,
            verdictNote: input.note || null,
          });
          sendEmail({ to: email, subject, html }).catch(console.error);
        }
      }
    }

    return { ok: true };
  } catch (e) {
    console.error("saveEvaluationVerdict error:", e);
    return { error: "저장 중 오류가 발생했습니다." };
  }
}
