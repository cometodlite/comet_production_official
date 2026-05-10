import "server-only";

import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { findPublicUserById } from "@/lib/auth/store";
import type { StaffGroup } from "@/lib/auth/staff-groups";

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  return findPublicUserById(session.userId);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStaffUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "staff") redirect("/staff/login");
  return user;
}

export async function requireStaffGroup(group: StaffGroup) {
  const user = await requireStaffUser();
  if (user.staffGroup !== group) redirect("/staff/unauthorized");
  return user;
}
