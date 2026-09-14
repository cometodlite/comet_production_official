"use server";

import { requireStaffGroup } from "@/lib/auth/current-user";
import { runSecurityScan } from "@/lib/security/scan";
import type { SecurityScanRun } from "@/lib/security/store";

/**
 * 이사회 전용: /security 페이지의 "지금 다시 스캔" 버튼에서 호출됩니다.
 */
export async function triggerSecurityScan(): Promise<{ run: SecurityScanRun } | { error: string }> {
  await requireStaffGroup("board");

  try {
    const run = await runSecurityScan("manual");
    return { run };
  } catch (e) {
    console.error("triggerSecurityScan error:", e);
    return { error: "스캔 중 오류가 발생했습니다." };
  }
}
