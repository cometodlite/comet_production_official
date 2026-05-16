/** 매월 실전 평가가 진행되는 날짜 */
export const REAL_EXAM_DAYS = [4, 5, 14, 15, 24, 25] as const;

/**
 * 현재 날짜가 실전 평가 기간인지 확인합니다.
 * 서버가 UTC로 실행되는 경우를 대비해 KST(UTC+9) 기준으로 판단합니다.
 */
export function isRealExamDay(): boolean {
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const day = kstDate.getUTCDate();
  return (REAL_EXAM_DAYS as readonly number[]).includes(day);
}
