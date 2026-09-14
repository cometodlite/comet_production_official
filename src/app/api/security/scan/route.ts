import { NextRequest, NextResponse } from "next/server";
import { runSecurityScan } from "@/lib/security/scan";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET이 설정되지 않았습니다." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 });
  }

  const run = await runSecurityScan("cron");
  return NextResponse.json({ ok: true, ranAt: run.ranAt, targets: run.results.length });
}
