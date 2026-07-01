import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/current-user";
import { savePushSub, removePushSub } from "@/lib/messaging";

export async function POST(req: Request) {
  const user = await requireStaffUser();
  const sub = await req.json() as { endpoint: string; keys: { p256dh: string; auth: string } };
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }
  await savePushSub(user.id, { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await requireStaffUser();
  const { endpoint } = await req.json() as { endpoint: string };
  if (endpoint) await removePushSub(user.id, endpoint);
  return NextResponse.json({ ok: true });
}
