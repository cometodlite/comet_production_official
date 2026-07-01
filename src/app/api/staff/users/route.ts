import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/current-user";
import { listStaffUsers } from "@/lib/auth/store";

export async function GET() {
  const me = await requireStaffUser();
  const users = await listStaffUsers();
  return NextResponse.json(
    users
      .filter((u) => u.id !== me.id)
      .map((u) => ({ id: u.id, name: u.name, staffGroup: u.staffGroup ?? null }))
  );
}
