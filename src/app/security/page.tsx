import type { Metadata } from "next";
import { requireStaffGroup } from "@/lib/auth/current-user";
import { getLatestSecurityScan } from "@/lib/security/store";
import { SECURITY_TARGETS } from "@/lib/security/targets";
import SecurityScanPanel from "@/components/staff/SecurityScanPanel";

export const metadata: Metadata = {
  title: "COMET SECURITY",
};

export default async function SecurityPage() {
  const user = await requireStaffGroup("board");
  const latestRun = await getLatestSecurityScan();

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-5xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET SECURITY</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">보안 점검 대시보드</h1>
        <p className="mb-2 text-sm leading-relaxed text-[#86868b]">
          COMET PRODUCTION 운영 도메인의 SSL/TLS, 보안 헤더, 민감 정보 노출, DNS 상태를 매시간 자동으로
          점검합니다.
        </p>
        <p className="mb-8 text-xs leading-relaxed text-[#86868b]">
          점검 대상: {SECURITY_TARGETS.map((t) => t.label).join(", ")} · 접속 계정: {user.email}
        </p>

        <SecurityScanPanel initialRun={latestRun} />
      </section>
    </div>
  );
}
