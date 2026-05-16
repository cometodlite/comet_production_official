import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "회원가입",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "staff" ? "/staff" : "/account");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-amber-400/80">COMET ACCOUNT</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">회원가입</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          간단한 정보로 COMET PRODUCTION 계정을 생성합니다.
        </p>
        <AuthForm mode="signup" />
      </section>
    </div>
  );
}
