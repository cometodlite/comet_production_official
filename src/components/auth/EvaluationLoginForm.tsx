"use client";

import Link from "next/link";
import { useActionState } from "react";
import { evaluationLogin, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export default function EvaluationLoginForm() {
  const [state, action, pending] = useActionState(evaluationLogin, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.errors?.form && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.errors.form[0]}
        </div>
      )}

      {state.success && (
        <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm leading-relaxed text-emerald-100">
          {state.success}
        </div>
      )}

      <Field
        id="evaluationName"
        label="평가 회원 이름"
        name="evaluationName"
        autoComplete="name"
        placeholder="레도"
        errors={state.errors?.evaluationName}
      />

      <Field
        id="evaluationCode"
        label="평가 회원 코드"
        name="evaluationCode"
        type="password"
        autoComplete="off"
        placeholder="회사에서 발급받은 코드"
        errors={state.errors?.evaluationCode}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "확인 중..." : "평가 회원 인증"}
      </button>

      <p className="text-center text-xs text-[#86868b]/70">
        <Link href="/staff/login" className="hover:text-white">
          사원 로그인으로 돌아가기
        </Link>
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  errors,
  type = "text",
  ...props
}: {
  id: string;
  label: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 focus:bg-white/[0.09]"
        {...props}
      />
      {errors && (
        <div className="mt-2 space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-xs text-red-300">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
