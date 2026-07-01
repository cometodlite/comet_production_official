import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getStaffGroupAreaHref, getStaffGroupLabel } from "@/lib/auth/staff-groups";
import { requireStaffUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "사원 페이지",
};

export default async function StaffPage() {
  const user = await requireStaffUser();
  const joinedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(user.createdAt));
  const codeStatus = user.staffCodeChangedAt ? "개인 코드 사용 중" : "초회 코드 사용 중";
  const areaHref = getStaffGroupAreaHref(user.staffGroup);
  const canResetCodes = user.staffGroup === "board";

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-4xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 페이지</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          내부 구성원 전용 공간입니다. 소속별 업무 공간은 해당 소속 계정만 접근할 수 있습니다.
        </p>

        <dl className="divide-y divide-white/10 rounded-lg border border-white/10">
          <InfoRow label="이름" value={user.name} />
          <InfoRow label="이메일" value={user.email} />
          <InfoRow label="계정 구분" value="사원" />
          <InfoRow label="소속" value={getStaffGroupLabel(user.staffGroup)} />
          <InfoRow label="코드 상태" value={codeStatus} />
          <InfoRow label="가입일" value={joinedAt} />
        </dl>

        <div className={`mt-8 grid gap-3 ${canResetCodes ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
          <Link href={areaHref} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-5 transition hover:border-white/25 hover:bg-white/[0.07]">
            <p className="text-sm font-semibold text-white">내 소속 공간</p>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b]">{getStaffGroupLabel(user.staffGroup)} 전용</p>
          </Link>
          <Link href="/staff/messages" className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-5 transition hover:border-white/25 hover:bg-white/[0.07]">
            <p className="text-sm font-semibold text-white">메시지</p>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b]">사내 1:1 · 그룹 채팅</p>
          </Link>
          <Link href="/staff/settings" className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-5 transition hover:border-white/25 hover:bg-white/[0.07]">
            <p className="text-sm font-semibold text-white">설정</p>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b]">개인 사원 코드 변경</p>
          </Link>
          {canResetCodes && (
            <Link href="/staff/reset-code" className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-5 transition hover:border-white/25 hover:bg-white/[0.07]">
              <p className="text-sm font-semibold text-white">코드 초기화</p>
              <p className="mt-2 text-xs leading-relaxed text-[#86868b]">이사회 전용 권한</p>
            </Link>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/staff/settings"
            className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200"
          >
            설정
          </Link>
          {canResetCodes && (
            <Link
              href="/staff/reset-code"
              className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              코드 초기화
            </Link>
          )}
        </div>

        <form action={logout} className="mt-3">
          <button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white">
            로그아웃
          </button>
        </form>
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
