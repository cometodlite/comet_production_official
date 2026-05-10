"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, readSession, setSessionCookie } from "@/lib/auth/session";
import { normalizeStaffGroup } from "@/lib/auth/staff-groups";
import {
  isInitialStaffCodeConfigured,
  isStaffEmailAllowListConfigured,
  isStaffSignupEmailAllowed,
  normalizeStaffCode,
  verifyInitialStaffCode,
} from "@/lib/auth/staff-code-config";
import {
  authenticateStaffUser,
  authenticateUser,
  createUser,
  findPublicUserById,
  normalizeEmail,
  resetStaffCodeToInitial,
  updateStaffCode,
} from "@/lib/auth/store";

export type AuthFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    staffGroup?: string[];
    staffCode?: string[];
    currentStaffCode?: string[];
    newStaffCode?: string[];
    confirmStaffCode?: string[];
    form?: string[];
  };
  success?: string;
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

function validateStaffCodeFormat(code: string) {
  const errors: string[] = [];
  if (code.length < 6) errors.push("사원 코드는 6자 이상이어야 합니다.");
  if (code.length > 64) errors.push("사원 코드는 64자 이하로 입력해 주세요.");
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

  const result = await createUser({ name, email, password, role: "public" });
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

  const user = await authenticateUser(email, password, "public");
  if (!user) {
    return { errors: { form: ["이메일 또는 비밀번호가 올바르지 않습니다."] } };
  }

  await setSessionCookie(user);
  redirect("/account");
}

export async function staffSignup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const staffGroup = normalizeStaffGroup(formData.get("staffGroup"));
  const staffCode = normalizeStaffCode(formData.get("staffCode"));

  const errors: NonNullable<AuthFormState["errors"]> = {};
  if (name.length < 2) errors.name = ["이름은 2자 이상 입력해 주세요."];
  if (!validateEmail(email)) errors.email = ["올바른 이메일 주소를 입력해 주세요."];
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length) errors.password = passwordErrors;
  if (!staffGroup) {
    errors.staffGroup = ["소속을 선택해 주세요."];
  } else if (!isInitialStaffCodeConfigured(staffGroup)) {
    errors.staffCode = ["해당 소속의 사원 코드가 아직 설정되지 않았습니다."];
  } else if (!verifyInitialStaffCode(staffGroup, staffCode)) {
    errors.staffCode = ["소속 또는 사원 코드가 올바르지 않습니다."];
  } else if (staffGroup === "board" && !isStaffEmailAllowListConfigured(staffGroup)) {
    errors.email = ["이사회 허용 이메일 목록이 아직 설정되지 않았습니다."];
  } else if (!isStaffSignupEmailAllowed(staffGroup, email)) {
    errors.email = ["해당 이메일은 선택한 소속 가입 권한이 없습니다."];
  }

  if (Object.keys(errors).length) return { errors };

  const result = await createUser({ name, email, password, role: "staff", staffGroup, staffCode });
  if (result.error || !result.user) {
    return { errors: { form: [result.error || "사원 계정 생성에 실패했습니다."] } };
  }

  await setSessionCookie(result.user);
  redirect("/staff");
}

export async function staffLogin(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const staffCode = normalizeStaffCode(formData.get("staffCode"));

  const errors: NonNullable<AuthFormState["errors"]> = {};
  if (!validateEmail(email)) errors.email = ["올바른 이메일 주소를 입력해 주세요."];
  if (!password) errors.password = ["비밀번호를 입력해 주세요."];
  if (!staffCode) errors.staffCode = ["사원 코드를 입력해 주세요."];
  if (Object.keys(errors).length) return { errors };

  const user = await authenticateStaffUser(email, password, staffCode);
  if (!user) {
    return { errors: { form: ["이메일, 비밀번호 또는 사원 코드가 올바르지 않습니다."] } };
  }

  await setSessionCookie(user);
  redirect("/staff");
}

export async function changeStaffCode(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const session = await readSession();
  if (!session || session.role !== "staff") {
    return { errors: { form: ["사원 로그인이 필요합니다."] } };
  }

  const currentStaffCode = normalizeStaffCode(formData.get("currentStaffCode"));
  const newStaffCode = normalizeStaffCode(formData.get("newStaffCode"));
  const confirmStaffCode = normalizeStaffCode(formData.get("confirmStaffCode"));
  const errors: NonNullable<AuthFormState["errors"]> = {};

  if (!currentStaffCode) errors.currentStaffCode = ["현재 사원 코드를 입력해 주세요."];
  const newCodeErrors = validateStaffCodeFormat(newStaffCode);
  if (newCodeErrors.length) errors.newStaffCode = newCodeErrors;
  if (newStaffCode !== confirmStaffCode) errors.confirmStaffCode = ["새 사원 코드가 서로 일치하지 않습니다."];
  if (currentStaffCode && newStaffCode && currentStaffCode === newStaffCode) {
    errors.newStaffCode = ["현재 코드와 다른 코드로 변경해 주세요."];
  }

  if (Object.keys(errors).length) return { errors };

  const result = await updateStaffCode(session.userId, currentStaffCode, newStaffCode);
  if (result.error) {
    return { errors: { form: [result.error] } };
  }

  revalidatePath("/staff");
  revalidatePath("/staff/settings");
  return { success: "사원 코드가 변경되었습니다. 다음 로그인부터 새 코드를 사용해 주세요." };
}

export async function resetStaffCode(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const session = await readSession();
  if (!session || session.role !== "staff") {
    return { errors: { form: ["이사회 로그인이 필요합니다."] } };
  }

  const actor = await findPublicUserById(session.userId);
  if (!actor || actor.role !== "staff" || actor.staffGroup !== "board") {
    return { errors: { form: ["사원 코드 초기화는 이사회 계정만 사용할 수 있습니다."] } };
  }

  const email = normalizeEmail(formData.get("email"));
  const staffGroup = normalizeStaffGroup(formData.get("staffGroup"));
  const staffCode = normalizeStaffCode(formData.get("staffCode"));
  const errors: NonNullable<AuthFormState["errors"]> = {};

  if (!validateEmail(email)) errors.email = ["초기화할 사원 이메일을 입력해 주세요."];
  if (!staffGroup) {
    errors.staffGroup = ["소속을 선택해 주세요."];
  } else if (!isInitialStaffCodeConfigured(staffGroup)) {
    errors.staffCode = ["해당 소속의 초회 코드가 아직 설정되지 않았습니다."];
  } else if (!verifyInitialStaffCode(staffGroup, staffCode)) {
    errors.staffCode = ["소속 또는 초회 코드가 올바르지 않습니다."];
  }

  if (Object.keys(errors).length || !staffGroup) return { errors };

  const result = await resetStaffCodeToInitial({ email, staffGroup, initialCode: staffCode });
  if (result.error) {
    return { errors: { form: [result.error] } };
  }

  revalidatePath("/staff");
  return { success: "사원 코드가 초회 코드로 초기화되었습니다. 이제 사원 로그인에서 해당 코드를 사용할 수 있습니다." };
}

export async function logout() {
  const session = await readSession();
  await clearSessionCookie();
  redirect(session?.role === "staff" ? "/staff/login" : "/login");
}
