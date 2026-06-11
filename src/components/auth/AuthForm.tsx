"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, staffLogin, staffSignup, type AuthFormState } from "@/app/actions/auth";
import { STAFF_GROUP_OPTIONS } from "@/lib/auth/staff-groups";

type Mode = "login" | "signup" | "staff-login" | "staff-signup";

const initialState: AuthFormState = {};

export default function AuthForm({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup" || mode === "staff-signup";
  const isStaff = mode === "staff-login" || mode === "staff-signup";
  const actionMap = {
    login,
    signup,
    "staff-login": staffLogin,
    "staff-signup": staffSignup,
  };
  const [state, action, pending] = useActionState(actionMap[mode], initialState);

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

      {mode === "staff-signup" && (
        <SelectField id="staffGroup" label="소속" name="staffGroup" errors={state.errors?.staffGroup}>
          <option value="">소속을 선택하세요</option>
          {STAFF_GROUP_OPTIONS.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </SelectField>
      )}

      {isStaff && (
        <Field
          id="staffCode"
          label={mode === "staff-signup" ? "초회 사원 코드" : "사원 코드"}
          name="staffCode"
          type="password"
          autoComplete="off"
          placeholder={mode === "staff-signup" ? "소속별 발급 코드" : "개인 사원 코드"}
          errors={state.errors?.staffCode}
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
        {pending ? "처리 중..." : isStaff ? (isSignup ? "사원 계정 생성" : "사원 로그인") : isSignup ? "회원가입" : "로그인"}
      </button>

      <p className="text-center text-sm text-[#86868b]">
        {isSignup ? "이미 계정이 있으신가요?" : isStaff ? "사원 계정이 필요하신가요?" : "아직 계정이 없으신가요?"}{" "}
        <Link
          href={isStaff ? (isSignup ? "/staff/login" : "/staff/signup") : isSignup ? "/login" : "/signup"}
          className="font-semibold text-white hover:text-amber-300"
        >
          {isSignup ? "로그인" : "회원가입"}
        </Link>
      </p>

      <p className="text-center text-xs text-[#86868b]/70">
        {isStaff ? (
          <Link href="/login" className="hover:text-white">
            일반 회원 로그인으로 이동
          </Link>
        ) : (
          <Link href="/staff/login" className="hover:text-white">
            사원 로그인으로 이동
          </Link>
        )}
      </p>

      {mode === "staff-login" && (
        <div className="space-y-2 text-center text-xs text-[#86868b]/70">
          <p>
            <Link href="/staff/evaluation" className="hover:text-white">
              입사 준비중이신가요? 평가 회원으로 이동
            </Link>
          </p>
          <p>
            <Link href="/contact?type=staff-code" className="hover:text-white">
              사원 코드를 잊으셨나요? 초기화 요청
            </Link>
          </p>
        </div>
      )}
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
        className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/[0.28] focus:border-indigo-400/70 focus:bg-white/[0.09]"
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

function SelectField({
  id,
  label,
  errors,
  children,
  ...props
}: {
  id: string;
  label: string;
  errors?: string[];
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      <select
        id={id}
        required
        className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/70 focus:bg-white/[0.09]"
        {...props}
      >
        {children}
      </select>
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
