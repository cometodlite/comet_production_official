import type { Metadata } from "next";
import Link from "next/link";
import StaffCodeSettingsForm from "@/components/auth/StaffCodeSettingsForm";
import { getStaffGroupAreaHref, getStaffGroupLabel } from "@/lib/auth/staff-groups";
import { requireStaffUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "사원 설정",
};

export default async function StaffSettingsPage() {
  const user = await requireStaffUser();
  const codeStatus = user.staffCodeChangedAt ? "개인 코드 사용 중" : "초회 코드 사용 중";
  const canResetCodes = user.staffGroup === "board";

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-3xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 설정</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          사원 코드를 개인 코드로 변경하면, 기존 소속별 초회 코드로는 이 계정에 로그인할 수 없습니다.
        </p>

        <dl className="mb-8 divide-y divide-white/10 rounded-lg border border-white/10">
          <InfoRow label="이메일" value={user.email} />
          <InfoRow label="소속" value={getStaffGroupLabel(user.staffGroup)} />
          <InfoRow label="코드 상태" value={codeStatus} />
        </dl>

        <StaffCodeSettingsForm />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={getStaffGroupAreaHref(user.staffGroup)}
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            내 소속 공간
          </Link>
          {canResetCodes && (
            <Link
              href="/staff/reset-code"
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/35 hover:text-white"
            >
              코드 초기화
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 px-4 py-4 sm:grid-cols-[120px_1fr]">
      <dt className="text-sm text-[#86868b]">{label}</dt>
      <dd className="break-words text-sm font-medium text-white">{value}</dd>
    </div>
  );
}
