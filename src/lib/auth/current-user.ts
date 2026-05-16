import "server-only";

import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { findPublicUserById } from "@/lib/auth/store";
import type { EvaluationTrack } from "@/lib/auth/evaluation-tracks";
import type { StaffGroup } from "@/lib/auth/staff-groups";

export type EvaluationUser = {
  id: string;
  name: string;
  email: string;
  role: "evaluation";
  staffGroup?: StaffGroup;
  evaluationTrack?: EvaluationTrack;
};

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  if (session.role === "evaluation") {
    return {
      id: session.userId,
      name: session.name || "평가 회원",
      email: session.email,
      role: "evaluation",
      staffGroup: session.staffGroup,
      evaluationTrack: session.evaluationTrack,
    } satisfies EvaluationUser;
  }
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

export async function requireEvaluationUser() {
  const session = await readSession();
  if (!session || session.role !== "evaluation") redirect("/staff/evaluation");

  return {
    id: session.userId,
    name: session.name || "평가 회원",
    email: session.email,
    role: "evaluation",
    staffGroup: session.staffGroup,
    evaluationTrack: session.evaluationTrack,
  } satisfies EvaluationUser;
}
