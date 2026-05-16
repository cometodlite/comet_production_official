import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EvaluationLoginForm from "@/components/auth/EvaluationLoginForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "평가 회원 인증",
};

export default async function StaffEvaluationPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "staff" ? "/staff" : user.role === "evaluation" ? "/evaluation" : "/account");

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">평가 회원 인증</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          입사 준비 중인 평가 회원은 회사에서 발급한 이름과 임의코드로 인증할 수 있습니다.
        </p>
        <EvaluationLoginForm />
      </section>
    </div>
  );
}
