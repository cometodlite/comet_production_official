"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthFormState } from "@/app/actions/auth";

type Mode = "login" | "signup";

const initialState: AuthFormState = {};

export default function AuthForm({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState(isSignup ? signup : login, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.errors?.form && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.errors.form[0]}
        </div>
      )}

      {isSignup && (
        <Field
          id="name"
          label="이름"
          name="name"
          autoComplete="name"
          placeholder="홍길동"
          errors={state.errors?.name}
        />
      )}

      <Field
        id="email"
        label="이메일"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@comet.co.kr"
        errors={state.errors?.email}
      />

      <Field
        id="password"
        label="비밀번호"
        name="password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder={isSignup ? "영문, 숫자 포함 8자 이상" : "비밀번호"}
        errors={state.errors?.password}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
      </button>

      <p className="text-center text-sm text-[#86868b]">
        {isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-white hover:text-amber-300">
          {isSignup ? "로그인" : "회원가입"}
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
