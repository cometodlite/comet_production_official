"use server";

import { readSession } from "@/lib/auth/session";
import { saveEvaluationScore } from "@/lib/auth/store";

export async function submitEvaluationScore(input: {
  documentId: string;
  documentTitle: string;
  applicantName: string;
  evaluationDate: string;
  responses: Record<string, string>;
}) {
  const session = await readSession();
  if (!session || session.role !== "evaluation") return;

  await saveEvaluationScore({
    memberId: session.userId,
    memberName: session.name || "평가 회원",
    evaluationTrack: session.evaluationTrack || "unassigned",
    documentId: input.documentId,
    documentTitle: input.documentTitle,
    applicantName: input.applicantName,
    evaluationDate: input.evaluationDate,
    responses: input.responses,
  });
}
