"use server";

import { requireStaffGroup } from "@/lib/auth/current-user";
import {
  createExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  setExamConfig,
  deleteExamConfig,
  listExamQuestionsForSet,
} from "@/lib/auth/store";

/** Board-only: add a new question to a set. */
export async function addExamQuestion(input: {
  setId: string;
  type: "choice" | "written";
  text: string;
  choices?: [string, string, string, string, string];
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  rows?: number;
  fixedLast?: boolean;
  sortOrder?: number;
}) {
  await requireStaffGroup("board");
  if (!input.setId.trim() || !input.text.trim()) return { error: "세트 이름과 문제 내용을 입력해주세요." };
  if (input.type === "choice") {
    if (!input.choices || input.choices.some((c) => !c.trim())) return { error: "선택지 5개를 모두 입력해주세요." };
    if (!input.correctAnswer) return { error: "정답을 선택해주세요." };
  }
  const id = await createExamQuestion(input);
  return { id };
}

/** Board-only: update an existing question. */
export async function editExamQuestion(
  id: string,
  input: {
    text?: string;
    choices?: [string, string, string, string, string];
    correctAnswer?: string;
    explanation?: string;
    modelAnswer?: string;
    rows?: number;
    fixedLast?: boolean;
    sortOrder?: number;
  },
) {
  await requireStaffGroup("board");
  await updateExamQuestion(id, input);
}

/** Board-only: permanently remove a question. */
export async function removeExamQuestion(id: string) {
  await requireStaffGroup("board");
  await deleteExamQuestion(id);
}

/** Board-only: set a question set as the active live set. */
export async function activateExamSet(setId: string) {
  await requireStaffGroup("board");
  await setExamConfig("active_exam_set_id", setId);
}

/** Board-only: clear the active set (falls back to hardcoded Set A). */
export async function deactivateExamSet() {
  await requireStaffGroup("board");
  await deleteExamConfig("active_exam_set_id");
}

/** Board-only: load all questions for a given set (for client-side fetching). */
export async function loadExamQuestionsForSet(setId: string) {
  await requireStaffGroup("board");
  return listExamQuestionsForSet(setId);
}
