import "server-only";

import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const LOCAL_USERS_FILE = path.join(process.cwd(), ".data", "users.json");
const VERCEL_USERS_FILE = "/tmp/comet-production-users.json";
const USERS_FILE =
  process.env.AUTH_STORE_PATH || (process.env.VERCEL ? VERCEL_USERS_FILE : LOCAL_USERS_FILE);

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let databaseReady: Promise<void> | null = null;

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

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  sqlClient ||= neon(databaseUrl);
  return sqlClient;
}

function mapDatabaseUser(row: Record<string, unknown>): UserRecord {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    salt: String(row.salt),
    createdAt,
  };
}

async function ensureDatabase(sql: SqlClient) {
  databaseReady ||= sql`
    CREATE TABLE IF NOT EXISTS comet_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `.then(() => undefined);
  await databaseReady;
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
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT id, name, email, password_hash, salt, created_at
      FROM comet_users
      WHERE email = ${email}
      LIMIT 1
    `) as Record<string, unknown>[];
    return rows[0] ? mapDatabaseUser(rows[0]) : null;
  }

  const users = await readUsers();
  return users.find((user) => user.email === email) || null;
}

export async function findPublicUserById(id: string) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT id, name, email, password_hash, salt, created_at
      FROM comet_users
      WHERE id = ${id}
      LIMIT 1
    `) as Record<string, unknown>[];
    return rows[0] ? toPublicUser(mapDatabaseUser(rows[0])) : null;
  }

  const users = await readUsers();
  const user = users.find((item) => item.id === id);
  return user ? toPublicUser(user) : null;
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const password = await hashPassword(input.password);
  const user: UserRecord = {
    id: randomBytes(16).toString("base64url"),
    name: input.name,
    email: input.email,
    ...password,
    createdAt: new Date().toISOString(),
  };

  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    try {
      await sql`
        INSERT INTO comet_users (id, name, email, password_hash, salt, created_at)
        VALUES (
          ${user.id},
          ${user.name},
          ${user.email},
          ${user.passwordHash},
          ${user.salt},
          ${user.createdAt}
        )
      `;
      return { user: toPublicUser(user) };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "23505") {
        return { error: "이미 가입된 이메일입니다." };
      }
      throw error;
    }
  }

  const users = await readUsers();
  if (users.some((item) => item.email === input.email)) {
    return { error: "이미 가입된 이메일입니다." };
  }

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
