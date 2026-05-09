import "server-only";

import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { findPublicUserById } from "@/lib/auth/store";

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
