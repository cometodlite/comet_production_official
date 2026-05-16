import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "사원 로그인",
};

export default async function StaffLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "staff" ? "/staff" : user.role === "evaluation" ? "/evaluation" : "/account");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 로그인</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          이메일, 비밀번호, 사원 코드로 내부 구성원 전용 계정에 로그인합니다.
        </p>
        <AuthForm mode="staff-login" />
      </section>
    </div>
  );
}
