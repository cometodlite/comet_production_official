import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/current-user";
import { getEffectiveProfile } from "@/lib/profiles";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  await requireStaffUser();
  const { userId } = await params;
  const profile = await getEffectiveProfile(userId);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}
