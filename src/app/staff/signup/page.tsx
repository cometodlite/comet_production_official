import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "사원 계정 생성",
};

export default async function StaffSignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "staff" ? "/staff" : "/account");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 계정 생성</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          회사에서 발급한 가입 코드가 있는 구성원만 사원 계정을 만들 수 있습니다.
        </p>
        <AuthForm mode="staff-signup" />
      </section>
    </div>
  );
}
