/**
 * 매월 평가 기간 구분 (KST 기준)
 *
 * - registration (등록 기간) : 4·14·24일  — 연습·실전 문제 모두 비공개
 * - real-exam    (실전 기간) : 5·15·25일  — 연습 비공개, 실전 공개
 * - practice     (연습 기간) : 그 외 날짜 — 연습 공개, 실전 비공개
 */
export type EvaluationPeriod = "practice" | "registration" | "real-exam";

export const REGISTRATION_DAYS = [4, 14, 24] as const;
export const REAL_EXAM_DAYS    = [5, 15, 25] as const;

/**
 * 현재 날짜(KST)를 기준으로 평가 기간을 반환합니다.
 */
export function getEvaluationPeriod(): EvaluationPeriod {
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const day = kstDate.getUTCDate();
  if ((REGISTRATION_DAYS as readonly number[]).includes(day)) return "registration";
  if ((REAL_EXAM_DAYS    as readonly number[]).includes(day)) return "real-exam";
  return "practice";
}
