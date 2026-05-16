import type { Metadata } from "next";
import Link from "next/link";
import { getStaffGroupAreaHref, getStaffGroupLabel } from "@/lib/auth/staff-groups";
import { requireStaffUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "접근 권한 없음",
};

export default async function StaffUnauthorizedPage() {
  const user = await requireStaffUser();

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-red-300/80">ACCESS CONTROL</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">접근 권한 없음</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          현재 계정은 {getStaffGroupLabel(user.staffGroup)} 소속입니다. 다른 소속 또는 이사회 공간에는 접근할 수 없습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={getStaffGroupAreaHref(user.staffGroup)}
            className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200"
          >
            내 소속 공간
          </Link>
          <Link
            href="/staff"
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            사원 페이지
          </Link>
        </div>
      </section>
    </div>
  );
}
