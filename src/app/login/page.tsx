import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "로그인",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "staff" ? "/staff" : user.role === "evaluation" ? "/evaluation" : "/account");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-amber-400/80">COMET ACCOUNT</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">로그인</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          COMET PRODUCTION 계정으로 로그인하여 멤버 전용 기능을 이용하세요.
        </p>
        <AuthForm mode="login" />
      </section>
    </div>
  );
}
