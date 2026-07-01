import type { Metadata } from "next";
import { requireStaffUser } from "@/lib/auth/current-user";
import MessagesClient from "./MessagesClient";

export const metadata: Metadata = { title: "메시지" };

export default async function MessagesPage() {
  const user = await requireStaffUser();
  return <MessagesClient myId={user.id} myName={user.name} />;
}
