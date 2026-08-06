import "server-only";

import { timingSafeEqual } from "node:crypto";
import type { StaffGroup } from "@/lib/auth/staff-groups";

const STAFF_CODE_ENV: Record<StaffGroup, string> = {
  entertainers: "STAFF_CODE_ENTERTAINERS",
  develops: "STAFF_CODE_DEVELOPS",
  board: "STAFF_CODE_COMET_BOARD",
  "comet-dev": "STAFF_CODE_COMET_DEV",
};

const STAFF_ALLOWED_EMAILS_ENV: Record<StaffGroup, string> = {
  entertainers: "STAFF_ALLOWED_EMAILS_ENTERTAINERS",
  develops: "STAFF_ALLOWED_EMAILS_DEVELOPS",
  board: "STAFF_ALLOWED_EMAILS_COMET_BOARD",
  "comet-dev": "STAFF_ALLOWED_EMAILS_COMET_DEV",
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

function getAllowedEmails(group: StaffGroup) {
  return (process.env[STAFF_ALLOWED_EMAILS_ENV[group]] || "")
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isStaffEmailAllowListConfigured(group: StaffGroup) {
  return getAllowedEmails(group).length > 0;
}

export function isStaffSignupEmailAllowed(group: StaffGroup, email: string) {
  const allowedEmails = getAllowedEmails(group);
  if (!allowedEmails.length) return group !== "board";
  return allowedEmails.includes(email.toLowerCase());
}
