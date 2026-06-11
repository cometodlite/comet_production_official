"use server";

import { readSession } from "@/lib/auth/session";
import { saveEvaluationScore } from "@/lib/auth/store";
import { getEvaluationDocument } from "@/lib/evaluation/documents";
import { sendEmail, getBoardEmails, makeNewSubmissionEmail } from "@/lib/email";

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

export async function submitRealExamScore(input: {
  documentId: string;
  documentTitle: string;
  applicantName: string;
  evaluationDate: string;
  responses: Record<string, string>;
  leaveCount?: number;
  pasteCount?: number;
}) {
  const session = await readSession();
  if (!session || session.role !== "evaluation" || !session.evaluationTrack) return;

  const ANTI_CHEAT_KEYS = new Set(["_leave_count", "_paste_count"]);

  const responses = Object.fromEntries(
    Object.entries(input.responses)
      .map(([key, value]) => [key, String(value || "").slice(0, MAX_RESPONSE_LENGTH)])
      .filter(([key]) => /^\d{1,2}$/.test(key) || ANTI_CHEAT_KEYS.has(key) || /^[a-zA-Z0-9_-]{1,40}$/.test(key)),
  );

  // Inject anti-cheat metrics as special response keys
  if (typeof input.leaveCount === "number") {
    responses["_leave_count"] = String(input.leaveCount);
  }
  if (typeof input.pasteCount === "number") {
    responses["_paste_count"] = String(input.pasteCount);
  }

  const submittedAt = new Date().toISOString();
  await saveEvaluationScore({
    memberId: session.userId,
    memberName: session.name || "평가 회원",
    evaluationTrack: session.evaluationTrack,
    documentId: String(input.documentId).slice(0, 100),
    documentTitle: String(input.documentTitle).slice(0, 200),
    applicantName: String(input.applicantName || "").slice(0, 100),
    evaluationDate: String(input.evaluationDate || "").slice(0, 20),
    responses,
  });

  // 이사회에 새 제출 알림 (비동기, 실패해도 제출 자체는 성공)
  const boardEmails = getBoardEmails();
  if (boardEmails.length > 0) {
    const { subject, html } = makeNewSubmissionEmail({
      memberName: session.name || "평가 회원",
      applicantName: String(input.applicantName || ""),
      evaluationTrack: session.evaluationTrack,
      submittedAt,
    });
    sendEmail({ to: boardEmails, subject, html }).catch(console.error);
  }
}
