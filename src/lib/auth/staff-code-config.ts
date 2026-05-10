import "server-only";

import { timingSafeEqual } from "node:crypto";
import type { StaffGroup } from "@/lib/auth/staff-groups";

const STAFF_CODE_ENV: Record<StaffGroup, string> = {
  entertainers: "STAFF_CODE_ENTERTAINERS",
  develops: "STAFF_CODE_DEVELOPS",
  board: "STAFF_CODE_COMET_BOARD",
};

export function normalizeStaffCode(code: FormDataEntryValue | string | null | undefined) {
  return String(code || "").trim();
}

export function getInitialStaffCode(group: StaffGroup) {
  return process.env[STAFF_CODE_ENV[group]];
}

export function isInitialStaffCodeConfigured(group: StaffGroup) {
  return Boolean(getInitialStaffCode(group));
}

export function verifyInitialStaffCode(group: StaffGroup, code: string) {
  const expected = getInitialStaffCode(group);
  if (!expected) return false;

  const left = Buffer.from(code);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
