import "server-only";

import { timingSafeEqual } from "node:crypto";
import { getInitialStaffCode, normalizeStaffCode } from "@/lib/auth/staff-code-config";
import type { StaffGroup } from "@/lib/auth/staff-groups";

type EvaluationMember = {
  id: string;
  name: string;
  group: StaffGroup;
  codePrefix: string;
};

export type EvaluationMemberAccess = {
  id: string;
  name: string;
  group: StaffGroup;
};

const EVALUATION_MEMBERS: EvaluationMember[] = [
  {
    id: "redo",
    name: "레도",
    group: "entertainers",
    codePrefix: "5037",
  },
];

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function normalizeName(value: FormDataEntryValue | string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/님$/, "");
}

function buildEvaluationCode(member: EvaluationMember) {
  const initialCode = getInitialStaffCode(member.group);
  return initialCode ? `${member.codePrefix}-${initialCode}` : null;
}

export function verifyEvaluationMember(input: { name: FormDataEntryValue | string | null; code: FormDataEntryValue | string | null }) {
  const name = normalizeName(input.name);
  const code = normalizeStaffCode(input.code);

  const member = EVALUATION_MEMBERS.find((item) => normalizeName(item.name) === name || item.id === name);
  if (!member) return null;

  const expectedCode = buildEvaluationCode(member);
  if (!expectedCode || !safeEqual(code, expectedCode)) return null;

  return {
    id: member.id,
    name: member.name,
    group: member.group,
  } satisfies EvaluationMemberAccess;
}
