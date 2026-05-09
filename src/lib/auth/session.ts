import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "comet_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  issuedAt: number;
};

function getSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.VERCEL) {
    throw new Error("AUTH_SECRET is required in Vercel environments.");
  }
  return "comet-production-local-auth-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createSessionToken(payload: SessionPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeEqual(sign(encoded), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    const isExpired = Date.now() - payload.issuedAt > SESSION_MAX_AGE * 1000;
    if (!payload.userId || !payload.email || isExpired) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: { id: string; email: string }) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: createSessionToken({
      userId: user.id,
      email: user.email,
      issuedAt: Date.now(),
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}
