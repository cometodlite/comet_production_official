import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const USERS_FILE = path.join(process.cwd(), ".data", "users.json");

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function normalizeEmail(email: FormDataEntryValue | null) {
  return String(email || "").trim().toLowerCase();
}

async function ensureStore() {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]\n", "utf8");
  }
}

async function readUsers(): Promise<UserRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(USERS_FILE, "utf8");
  return JSON.parse(raw) as UserRecord[];
}

async function writeUsers(users: UserRecord[]) {
  await ensureStore();
  await fs.writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

async function hashPassword(password: string, salt = randomBytes(16).toString("base64url")) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return {
    salt,
    passwordHash: derivedKey.toString("base64url"),
  };
}

async function verifyPassword(password: string, user: UserRecord) {
  const { passwordHash } = await hashPassword(password, user.salt);
  const left = Buffer.from(passwordHash);
  const right = Buffer.from(user.passwordHash);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((user) => user.email === email) || null;
}

export async function findPublicUserById(id: string) {
  const users = await readUsers();
  const user = users.find((item) => item.id === id);
  return user ? toPublicUser(user) : null;
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const users = await readUsers();
  if (users.some((user) => user.email === input.email)) {
    return { error: "이미 가입된 이메일입니다." };
  }

  const password = await hashPassword(input.password);
  const user: UserRecord = {
    id: randomBytes(16).toString("base64url"),
    name: input.name,
    email: input.email,
    ...password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return { user: toPublicUser(user) };
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const isValid = await verifyPassword(password, user);
  return isValid ? toPublicUser(user) : null;
}
