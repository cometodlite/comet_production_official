/**
 * 매월 평가 기간 구분 (KST 기준)
 *
 * - registration (등록 기간) : 등록일  — 연습·실전 문제 모두 비공개
 * - real-exam    (실전 기간) : 실전일  — 연습 비공개, 실전 공개
 * - practice     (연습 기간) : 그 외 날짜 — 연습 공개, 실전 비공개
 */
export type EvaluationPeriod = "practice" | "registration" | "real-exam";

export type ExamScheduleConfig = {
  registrationDays: number[]; // e.g. [4, 14, 24]
  realExamDays: number[];     // e.g. [5, 15, 25]
};

/** 하드코딩 기본값 — DB 설정이 없을 때 fallback */
export const DEFAULT_SCHEDULE: ExamScheduleConfig = {
  registrationDays: [4, 14, 24],
  realExamDays:     [5, 15, 25],
};

// 하위 호환성을 위해 유지
export const REGISTRATION_DAYS = DEFAULT_SCHEDULE.registrationDays as readonly number[];
export const REAL_EXAM_DAYS    = DEFAULT_SCHEDULE.realExamDays    as readonly number[];

/** 실전 시험 시작 시각 (KST 기준 시) */
export const EXAM_START_HOUR_KST = 12;

/**
 * 현재 날짜(KST)를 기준으로 평가 기간을 반환합니다.
 * config를 전달하면 해당 일정 기준, 전달하지 않으면 기본값 사용.
 *
 * 실전일에는 KST 12:00 이후부터 "real-exam" — 그 이전은 "registration" 대기 상태.
 */
export function getEvaluationPeriod(config?: ExamScheduleConfig, now?: number): EvaluationPeriod {
  const schedule = config ?? DEFAULT_SCHEDULE;
  const kstDate = new Date((now ?? Date.now()) + 9 * 60 * 60 * 1000);
  const day  = kstDate.getUTCDate();
  const hour = kstDate.getUTCHours(); // KST 시각 (0–23)
  if (schedule.registrationDays.includes(day)) return "registration";
  if (schedule.realExamDays.includes(day))     return hour >= EXAM_START_HOUR_KST ? "real-exam" : "registration";
  return "practice";
}

/**
 * 현재 평가 기간이 끝나는 시점(UTC ms)과 다음 기간 정보를 반환합니다.
 * 순수 계산 함수 — 서버/클라이언트 양쪽에서 호출 가능합니다.
 */
export function getNextPeriodChangeTime(config?: ExamScheduleConfig, now?: number): {
  endsAt: number;
  nextPeriod: EvaluationPeriod;
  label: string;
} {
  const schedule = config ?? DEFAULT_SCHEDULE;
  const kstDate = new Date((now ?? Date.now()) + 9 * 60 * 60 * 1000);
  const kstDay   = kstDate.getUTCDate();
  const kstYear  = kstDate.getUTCFullYear();
  const kstMonth = kstDate.getUTCMonth(); // 0-indexed

  // 자정 KST (= UTC - 9h)
  const midnightKst = (y: number, m: number, d: number) =>
    Date.UTC(y, m, d) - 9 * 60 * 60 * 1000;

  // 정오 KST = UTC 03:00
  const noonKst = (y: number, m: number, d: number) =>
    Date.UTC(y, m, d, 3, 0, 0, 0);

  const currentPeriod = getEvaluationPeriod(schedule, now);

  if (currentPeriod === "registration") {
    // 실전일 당일 오전(12:00 이전) → 오늘 12:00에 시험 시작
    if (schedule.realExamDays.includes(kstDay)) {
      return {
        endsAt: noonKst(kstYear, kstMonth, kstDay),
        nextPeriod: "real-exam",
        label: "오늘 12:00 시험 시작까지",
      };
    }
    // 등록일 → 내일 12:00에 시험 시작
    return {
      endsAt: noonKst(kstYear, kstMonth, kstDay + 1),
      nextPeriod: "real-exam",
      label: "내일 12:00 시험 시작까지",
    };
  }

  if (currentPeriod === "real-exam") {
    return {
      endsAt: midnightKst(kstYear, kstMonth, kstDay + 1),
      nextPeriod: "practice",
      label: "실전 평가 마감까지",
    };
  }

  // 연습 기간: 다음 등록 기간 자정 KST 계산
  const sortedRegDays = [...schedule.registrationDays].sort((a, b) => a - b);
  let targetDay   = sortedRegDays.find((d) => d > kstDay) ?? null;
  let targetYear  = kstYear;
  let targetMonth = kstMonth;

  if (targetDay === null) {
    // 이번 달 등록일이 모두 지남 → 다음 달 첫 번째 등록일
    targetDay   = sortedRegDays[0] ?? 4;
    targetMonth += 1;
    if (targetMonth > 11) { targetMonth = 0; targetYear += 1; }
  }

  return {
    endsAt: midnightKst(targetYear, targetMonth, targetDay),
    nextPeriod: "registration",
    label: "다음 실전 시험까지",
  };
}
