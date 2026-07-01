import { NextResponse } from "next/server";
import webpush from "web-push";
import { requireStaffUser } from "@/lib/auth/current-user";
import { getConversationMessages, sendMessage, markRead, getRecipientSubs } from "@/lib/messaging";

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:cometodlite@kenet.co.kr";

function setupVapid() {
  if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaffUser();
  const { id } = await params;
  const messages = await getConversationMessages(id, user.id);
  await markRead(id, user.id);
  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaffUser();
  const { id } = await params;
  const { content } = await req.json() as { content: string };

  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const message = await sendMessage(id, user.id, user.name, content.trim());
  if (!message) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Send web push to recipients (best-effort)
  setupVapid();
  const subs = await getRecipientSubs(id, user.id);
  const payload = JSON.stringify({
    title: `${user.name}`,
    body: content.trim().slice(0, 80),
    url: "/staff/messages",
  });
  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
    )
  );

  return NextResponse.json(message);
}
