"use server";

import { requireStaffGroup } from "@/lib/auth/current-user";
import { setExamScheduleConfig, setTrackActiveSet } from "@/lib/auth/store";
import type { ExamScheduleConfig } from "@/lib/auth/store";

/**
 * 이사회 전용: 평가 일정(등록일·실전일)을 저장합니다.
 * track 지정 시 해당 트랙 전용 일정, 없으면 글로벌 일정.
 */
export async function saveExamSchedule(
  config: ExamScheduleConfig,
  track?: string,
): Promise<{ ok: true } | { error: string }> {
  await requireStaffGroup("board");

  const validate = (days: number[], label: string) => {
    if (!Array.isArray(days) || days.length === 0)
      return `${label}은(는) 최소 1개 이상의 날짜가 필요합니다.`;
    for (const d of days) {
      if (!Number.isInteger(d) || d < 1 || d > 31)
        return `${label}의 날짜는 1-31 사이 정수여야 합니다.`;
    }
    return null;
  };

  const regErr  = validate(config.registrationDays, "등록일");
  const examErr = validate(config.realExamDays,     "실전일");
  if (regErr)  return { error: regErr };
  if (examErr) return { error: examErr };

  try {
    await setExamScheduleConfig(
      {
        registrationDays: config.registrationDays.map(Number),
        realExamDays:     config.realExamDays.map(Number),
      },
      track,
    );
    return { ok: true };
  } catch (e) {
    console.error("saveExamSchedule error:", e);
    return { error: "저장 중 오류가 발생했습니다." };
  }
}

/**
 * 이사회 전용: 특정 트랙에 활성 문제 세트를 지정합니다.
 */
export async function saveTrackActiveSet(
  track: string,
  setId: string | null,
): Promise<{ ok: true } | { error: string }> {
  await requireStaffGroup("board");
  try {
    await setTrackActiveSet(track, setId);
    return { ok: true };
  } catch (e) {
    console.error("saveTrackActiveSet error:", e);
    return { error: "저장 중 오류가 발생했습니다." };
  }
}
