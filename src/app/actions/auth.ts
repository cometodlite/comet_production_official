"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { authenticateUser, createUser, normalizeEmail } from "@/lib/auth/store";

export type AuthFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    form?: string[];
  };
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  const errors: string[] = [];
  if (password.length < 8) errors.push("비밀번호는 8자 이상이어야 합니다.");
  if (!/[A-Za-z]/.test(password)) errors.push("영문자를 1개 이상 포함해 주세요.");
  if (!/[0-9]/.test(password)) errors.push("숫자를 1개 이상 포함해 주세요.");
  return errors;
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  const errors: NonNullable<AuthFormState["errors"]> = {};
  if (name.length < 2) errors.name = ["이름은 2자 이상 입력해 주세요."];
  if (!validateEmail(email)) errors.email = ["올바른 이메일 주소를 입력해 주세요."];
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length) errors.password = passwordErrors;

  if (Object.keys(errors).length) return { errors };

  const result = await createUser({ name, email, password });
  if (result.error || !result.user) {
    return { errors: { form: [result.error || "회원가입에 실패했습니다."] } };
  }

  await setSessionCookie(result.user);
  redirect("/account");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  const errors: NonNullable<AuthFormState["errors"]> = {};
  if (!validateEmail(email)) errors.email = ["올바른 이메일 주소를 입력해 주세요."];
  if (!password) errors.password = ["비밀번호를 입력해 주세요."];
  if (Object.keys(errors).length) return { errors };

  const user = await authenticateUser(email, password);
  if (!user) {
    return { errors: { form: ["이메일 또는 비밀번호가 올바르지 않습니다."] } };
  }

  await setSessionCookie(user);
  redirect("/account");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
