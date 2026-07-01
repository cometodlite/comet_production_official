import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/current-user";
import { getUserConversations, getOrCreateDM, createGroup } from "@/lib/messaging";
import { listStaffUsers } from "@/lib/auth/store";

export async function GET() {
  const user = await requireStaffUser();
  const conversations = await getUserConversations(user.id);
  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const user = await requireStaffUser();
  const body = await req.json() as {
    type: "direct" | "group";
    targetUserId?: string;
    name?: string;
    memberIds?: string[];
  };

  if (body.type === "direct") {
    if (!body.targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
    const allUsers = await listStaffUsers();
    const target = allUsers.find((u) => u.id === body.targetUserId);
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const id = await getOrCreateDM(user.id, user.name, target.id, target.name);
    return NextResponse.json({ id });
  }

  if (body.type === "group") {
    if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
    if (!body.memberIds?.length) return NextResponse.json({ error: "memberIds required" }, { status: 400 });
    const allUsers = await listStaffUsers();
    const members = body.memberIds
      .map((id) => allUsers.find((u) => u.id === id))
      .filter(Boolean)
      .map((u) => ({ id: u!.id, name: u!.name }));
    const id = await createGroup(body.name.trim(), user.id, user.name, members);
    return NextResponse.json({ id });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
