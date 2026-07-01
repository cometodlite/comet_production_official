import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/current-user";
import { getEffectiveProfile, getCustomProfile, upsertCustomProfile, resetCustomProfile } from "@/lib/profiles";

export async function GET() {
  const user = await requireStaffUser();
  const [effective, custom] = await Promise.all([
    getEffectiveProfile(user.id),
    getCustomProfile(user.id),
  ]);
  return NextResponse.json({ effective, custom });
}

export async function PUT(req: Request) {
  const user = await requireStaffUser();
  const body = await req.json() as { displayName?: string; roleTitle?: string; bio?: string; avatarUrl?: string };

  const MAX = { displayName: 40, roleTitle: 40, bio: 500, avatarUrl: 500 };
  if ((body.displayName?.length ?? 0) > MAX.displayName) return NextResponse.json({ error: "이름이 너무 깁니다." }, { status: 400 });
  if ((body.roleTitle?.length ?? 0) > MAX.roleTitle) return NextResponse.json({ error: "직함이 너무 깁니다." }, { status: 400 });
  if ((body.bio?.length ?? 0) > MAX.bio) return NextResponse.json({ error: "소개가 너무 깁니다." }, { status: 400 });
  if ((body.avatarUrl?.length ?? 0) > MAX.avatarUrl) return NextResponse.json({ error: "이미지 URL이 너무 깁니다." }, { status: 400 });

  await upsertCustomProfile(user.id, {
    displayName: body.displayName?.trim() || null,
    roleTitle: body.roleTitle?.trim() || null,
    bio: body.bio?.trim() || null,
    avatarUrl: body.avatarUrl?.trim() || null,
  });

  const effective = await getEffectiveProfile(user.id);
  return NextResponse.json({ effective });
}

export async function DELETE() {
  const user = await requireStaffUser();
  await resetCustomProfile(user.id);
  const effective = await getEffectiveProfile(user.id);
  return NextResponse.json({ effective });
}
