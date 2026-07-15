import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { findUserByEmail, normalizeEmail } from "@/lib/auth/store";

function isAuthorized(request: Request): boolean {
  const expected = process.env.STUTANT_INTEGRATION_KEY;
  if (!expected) return false;

  const header = request.headers.get("authorization") || "";
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) return false;

  const provided = Buffer.from(match[1]);
  const expectedBuf = Buffer.from(expected);
  if (provided.length !== expectedBuf.length) return false;
  return timingSafeEqual(provided, expectedBuf);
}

/**
 * Server-to-server only (Stutant → COMET PRODUCTION). Verifies whether an
 * email belongs to an active COMET PRODUCTION staff account. Never leaks
 * password hashes or any field beyond verified/staffGroup.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || user.role !== "staff") {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({ verified: true, staffGroup: user.staffGroup ?? null });
}
