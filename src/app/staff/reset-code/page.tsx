import type { Metadata } from "next";
import StaffCodeResetForm from "@/components/auth/StaffCodeResetForm";
import { requireStaffGroup } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "사원 코드 초기화",
};

export default async function StaffResetCodePage() {
  await requireStaffGroup("board");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 코드 초기화</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          이사회 권한으로 사원 개인 코드를 소속별 초회 코드 상태로 되돌립니다.
        </p>
        <StaffCodeResetForm />
      </section>
    </div>
  );
}
