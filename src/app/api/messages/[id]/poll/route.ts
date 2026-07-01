import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/current-user";
import { pollNewMessages, markRead } from "@/lib/messaging";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaffUser();
  const { id } = await params;
  const since = new URL(req.url).searchParams.get("since") ?? new Date(Date.now() - 10000).toISOString();
  const messages = await pollNewMessages(id, user.id, since);
  if (messages.length > 0) await markRead(id, user.id);
  return NextResponse.json(messages);
}
