import type { Metadata } from "next";
import Link from "next/link";
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
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 계정 생성</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          소속별로 발급된 초회 사원 코드가 있는 구성원만 사원 계정을 만들 수 있습니다.
        </p>
        <AuthForm mode="staff-signup" />
        <div className="mt-6 rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-4 py-3 text-sm leading-relaxed text-indigo-100/90">
          가입 코드가 없으신가요?{" "}
          <Link href="/contact?type=staff-code" className="font-semibold text-white underline underline-offset-4 hover:text-amber-200">
            사원 가입 코드 요청
          </Link>
          을 보내주세요.
        </div>
      </section>
    </div>
  );
}
