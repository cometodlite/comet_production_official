"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetStaffCode, type AuthFormState } from "@/app/actions/auth";
import { STAFF_GROUP_OPTIONS } from "@/lib/auth/staff-groups";

const initialState: AuthFormState = {};

export default function StaffCodeResetForm() {
  const [state, action, pending] = useActionState(resetStaffCode, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.errors?.form && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.errors.form[0]}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}{" "}
          <Link href="/staff/login" className="font-semibold text-white underline underline-offset-4">
            로그인하기
          </Link>
        </div>
      )}

      <Field
        id="email"
        label="사원 이메일"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@comet.co.kr"
        errors={state.errors?.email}
      />

      <SelectField id="staffGroup" label="소속" name="staffGroup" errors={state.errors?.staffGroup}>
        <option value="">소속을 선택하세요</option>
        {STAFF_GROUP_OPTIONS.map((group) => (
          <option key={group.value} value={group.value}>
            {group.label}
          </option>
        ))}
      </SelectField>

      <Field
        id="staffCode"
        label="초회 사원 코드"
        name="staffCode"
        type="password"
        autoComplete="off"
        placeholder="소속별 초회 코드"
        errors={state.errors?.staffCode}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "초기화 중..." : "사원 코드 초기화"}
      </button>
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
