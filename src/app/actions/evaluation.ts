"use server";

import { readSession } from "@/lib/auth/session";
import { saveEvaluationScore } from "@/lib/auth/store";
import { getEvaluationDocument } from "@/lib/evaluation/documents";

const MAX_RESPONSE_LENGTH = 4000;

export async function submitEvaluationScore(input: {
  documentId: string;
  documentTitle: string;
  applicantName: string;
  evaluationDate: string;
  responses: Record<string, string>;
}) {
  const session = await readSession();
  if (!session || session.role !== "evaluation" || !session.evaluationTrack) return;

  const document = getEvaluationDocument(input.documentId, session.evaluationTrack);
  if (!document) return;

  const responses = Object.fromEntries(
    Object.entries(input.responses)
      .map(([key, value]) => [key, String(value || "").slice(0, MAX_RESPONSE_LENGTH)])
      .filter(([key]) => /^\d{1,2}$/.test(key)),
  );

  await saveEvaluationScore({
    memberId: session.userId,
    memberName: session.name || "평가 회원",
    evaluationTrack: session.evaluationTrack,
    documentId: document.id,
    documentTitle: document.title,
    applicantName: String(input.applicantName || "").slice(0, 100),
    evaluationDate: String(input.evaluationDate || "").slice(0, 20),
    responses,
  });
}
