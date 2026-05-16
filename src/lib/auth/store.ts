import "server-only";

import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { StaffGroup } from "@/lib/auth/staff-groups";

const scrypt = promisify(scryptCallback);
const LOCAL_USERS_FILE = path.join(process.cwd(), ".data", "users.json");
const LOCAL_BOARD_NOTICES_FILE = path.join(process.cwd(), ".data", "board-notices.json");
const LOCAL_SCORES_FILE = path.join(process.cwd(), ".data", "evaluation-scores.json");
const VERCEL_USERS_FILE = "/tmp/comet-production-users.json";
const VERCEL_BOARD_NOTICES_FILE = "/tmp/comet-production-board-notices.json";
const VERCEL_SCORES_FILE = "/tmp/comet-evaluation-scores.json";
const USERS_FILE =
  process.env.AUTH_STORE_PATH || (process.env.VERCEL ? VERCEL_USERS_FILE : LOCAL_USERS_FILE);
const BOARD_NOTICES_FILE = process.env.BOARD_NOTICES_STORE_PATH || (process.env.VERCEL ? VERCEL_BOARD_NOTICES_FILE : LOCAL_BOARD_NOTICES_FILE);
const SCORES_FILE = process.env.SCORES_STORE_PATH || (process.env.VERCEL ? VERCEL_SCORES_FILE : LOCAL_SCORES_FILE);

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let databaseReady: Promise<void> | null = null;

export type UserRole = "public" | "staff";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffGroup?: StaffGroup;
  staffCodeHash?: string;
  staffCodeSalt?: string;
  staffCodeChangedAt?: string | null;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffGroup?: StaffGroup;
  staffCodeChangedAt?: string | null;
  createdAt: string;
};

export type BoardNotice = {
  id: string;
  title: string;
  body: string;
  authorEmail: string;
  createdAt: string;
};

export type EvaluationScore = {
  id: string;
  memberId: string;
  memberName: string;
  evaluationTrack: string;
  documentId: string;
  documentTitle: string;
  applicantName: string;
  evaluationDate: string;
  responses: Record<string, string>;
  submittedAt: string;
};

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    staffGroup: user.staffGroup,
    staffCodeChangedAt: user.staffCodeChangedAt || null,
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

function normalizeStaffGroupValue(value: unknown): StaffGroup | undefined {
  return value === "entertainers" || value === "develops" || value === "board" ? value : undefined;
}

function mapTimestamp(value: unknown) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapDatabaseUser(row: Record<string, unknown>): UserRecord {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role === "staff" ? "staff" : "public",
    staffGroup: normalizeStaffGroupValue(row.staff_group),
    staffCodeHash: row.staff_code_hash ? String(row.staff_code_hash) : undefined,
    staffCodeSalt: row.staff_code_salt ? String(row.staff_code_salt) : undefined,
    staffCodeChangedAt: mapTimestamp(row.staff_code_changed_at),
    passwordHash: String(row.password_hash),
    salt: String(row.salt),
    createdAt,
  };
}

async function ensureDatabase(sql: SqlClient) {
  databaseReady ||= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS comet_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'public',
        staff_group TEXT,
        staff_code_hash TEXT,
        staff_code_salt TEXT,
        staff_code_changed_at TIMESTAMPTZ,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comet_board_notices (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        author_email TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      ALTER TABLE comet_users
      ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'public'
    `;
    await sql`
      ALTER TABLE comet_users
      ADD COLUMN IF NOT EXISTS staff_group TEXT
    `;
    await sql`
      ALTER TABLE comet_users
      ADD COLUMN IF NOT EXISTS staff_code_hash TEXT
    `;
    await sql`
      ALTER TABLE comet_users
      ADD COLUMN IF NOT EXISTS staff_code_salt TEXT
    `;
    await sql`
      ALTER TABLE comet_users
      ADD COLUMN IF NOT EXISTS staff_code_changed_at TIMESTAMPTZ
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comet_evaluation_scores (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        member_name TEXT NOT NULL,
        evaluation_track TEXT NOT NULL,
        document_id TEXT NOT NULL,
        document_title TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        evaluation_date TEXT NOT NULL,
        responses JSONB NOT NULL,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (member_id, document_id)
      )
    `;
  })();
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

function normalizeUserRecord(user: UserRecord): UserRecord {
  return {
    ...user,
    role: user.role === "staff" ? "staff" : "public",
    staffGroup: normalizeStaffGroupValue(user.staffGroup),
    staffCodeChangedAt: user.staffCodeChangedAt || null,
  };
}

async function readUsers(): Promise<UserRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(USERS_FILE, "utf8");
  return (JSON.parse(raw) as UserRecord[]).map(normalizeUserRecord);
}

async function writeUsers(users: UserRecord[]) {
  await ensureStore();
  await fs.writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

async function ensureBoardNoticeStore() {
  await fs.mkdir(path.dirname(BOARD_NOTICES_FILE), { recursive: true });
  try {
    await fs.access(BOARD_NOTICES_FILE);
  } catch {
    await fs.writeFile(BOARD_NOTICES_FILE, "[]\n", "utf8");
  }
}

async function readBoardNotices(): Promise<BoardNotice[]> {
  await ensureBoardNoticeStore();
  const raw = await fs.readFile(BOARD_NOTICES_FILE, "utf8");
  return JSON.parse(raw) as BoardNotice[];
}

async function writeBoardNotices(notices: BoardNotice[]) {
  await ensureBoardNoticeStore();
  await fs.writeFile(BOARD_NOTICES_FILE, `${JSON.stringify(notices, null, 2)}\n`, "utf8");
}

async function hashSecret(secret: string, salt = randomBytes(16).toString("base64url")) {
  const derivedKey = (await scrypt(secret, salt, 64)) as Buffer;
  return {
    salt,
    hash: derivedKey.toString("base64url"),
  };
}

async function verifySecret(secret: string, hash: string, salt: string) {
  const result = await hashSecret(secret, salt);
  const left = Buffer.from(result.hash);
  const right = Buffer.from(hash);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function verifyPassword(password: string, user: UserRecord) {
  return verifySecret(password, user.passwordHash, user.salt);
}

async function verifyStaffCode(staffCode: string, user: UserRecord) {
  if (!user.staffCodeHash || !user.staffCodeSalt) return false;
  return verifySecret(staffCode, user.staffCodeHash, user.staffCodeSalt);
}

export async function findUserByEmail(email: string) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        role,
        staff_group,
        staff_code_hash,
        staff_code_salt,
        staff_code_changed_at,
        password_hash,
        salt,
        created_at
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
      SELECT
        id,
        name,
        email,
        role,
        staff_group,
        staff_code_hash,
        staff_code_salt,
        staff_code_changed_at,
        password_hash,
        salt,
        created_at
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

export async function listStaffUsers() {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        role,
        staff_group,
        staff_code_hash,
        staff_code_salt,
        staff_code_changed_at,
        password_hash,
        salt,
        created_at
      FROM comet_users
      WHERE role = 'staff'
      ORDER BY created_at DESC
    `) as Record<string, unknown>[];
    return rows.map((row) => toPublicUser(mapDatabaseUser(row)));
  }

  const users = await readUsers();
  return users.filter((user) => user.role === "staff").map(toPublicUser);
}

async function findUserRecordById(id: string) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        role,
        staff_group,
        staff_code_hash,
        staff_code_salt,
        staff_code_changed_at,
        password_hash,
        salt,
        created_at
      FROM comet_users
      WHERE id = ${id}
      LIMIT 1
    `) as Record<string, unknown>[];
    return rows[0] ? mapDatabaseUser(rows[0]) : null;
  }

  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  staffGroup?: StaffGroup;
  staffCode?: string;
}) {
  const password = await hashSecret(input.password);
  const staffCode = input.role === "staff" && input.staffCode ? await hashSecret(input.staffCode) : null;
  const user: UserRecord = {
    id: randomBytes(16).toString("base64url"),
    name: input.name,
    email: input.email,
    role: input.role || "public",
    staffGroup: input.role === "staff" ? input.staffGroup : undefined,
    staffCodeHash: staffCode?.hash,
    staffCodeSalt: staffCode?.salt,
    staffCodeChangedAt: null,
    passwordHash: password.hash,
    salt: password.salt,
    createdAt: new Date().toISOString(),
  };

  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    try {
      await sql`
        INSERT INTO comet_users (
          id,
          name,
          email,
          role,
          staff_group,
          staff_code_hash,
          staff_code_salt,
          staff_code_changed_at,
          password_hash,
          salt,
          created_at
        )
        VALUES (
          ${user.id},
          ${user.name},
          ${user.email},
          ${user.role},
          ${user.staffGroup || null},
          ${user.staffCodeHash || null},
          ${user.staffCodeSalt || null},
          ${user.staffCodeChangedAt || null},
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

export async function authenticateUser(email: string, password: string, role: UserRole = "public") {
  const user = await findUserByEmail(email);
  if (!user || user.role !== role) return null;
  const isValid = await verifyPassword(password, user);
  return isValid ? toPublicUser(user) : null;
}

export async function authenticateStaffUser(email: string, password: string, staffCode: string) {
  const user = await findUserByEmail(email);
  if (!user || user.role !== "staff") return null;
  const [passwordValid, staffCodeValid] = await Promise.all([
    verifyPassword(password, user),
    verifyStaffCode(staffCode, user),
  ]);
  return passwordValid && staffCodeValid ? toPublicUser(user) : null;
}

export async function updateStaffCode(userId: string, currentCode: string, newCode: string) {
  const user = await findUserRecordById(userId);
  if (!user || user.role !== "staff") {
    return { error: "사원 계정을 찾을 수 없습니다." };
  }

  const currentCodeValid = await verifyStaffCode(currentCode, user);
  if (!currentCodeValid) {
    return { error: "현재 사원 코드가 올바르지 않습니다." };
  }

  const nextCode = await hashSecret(newCode);
  const changedAt = new Date().toISOString();
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    await sql`
      UPDATE comet_users
      SET
        staff_code_hash = ${nextCode.hash},
        staff_code_salt = ${nextCode.salt},
        staff_code_changed_at = ${changedAt}
      WHERE id = ${userId} AND role = 'staff'
    `;
    return { user: toPublicUser({ ...user, staffCodeHash: nextCode.hash, staffCodeSalt: nextCode.salt, staffCodeChangedAt: changedAt }) };
  }

  const users = await readUsers();
  const nextUsers = users.map((item) =>
    item.id === userId && item.role === "staff"
      ? { ...item, staffCodeHash: nextCode.hash, staffCodeSalt: nextCode.salt, staffCodeChangedAt: changedAt }
      : item
  );
  await writeUsers(nextUsers);
  return { user: toPublicUser({ ...user, staffCodeHash: nextCode.hash, staffCodeSalt: nextCode.salt, staffCodeChangedAt: changedAt }) };
}

export async function resetStaffCodeToInitial(input: { email: string; staffGroup: StaffGroup; initialCode: string }) {
  const user = await findUserByEmail(input.email);
  if (!user || user.role !== "staff") {
    return { error: "대상 사원 계정을 찾을 수 없습니다." };
  }

  if (user.staffGroup && user.staffGroup !== input.staffGroup) {
    return { error: "선택한 소속이 사원 계정 정보와 일치하지 않습니다." };
  }

  const initialStaffCode = await hashSecret(input.initialCode);
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    await sql`
      UPDATE comet_users
      SET
        staff_group = ${input.staffGroup},
        staff_code_hash = ${initialStaffCode.hash},
        staff_code_salt = ${initialStaffCode.salt},
        staff_code_changed_at = NULL
      WHERE id = ${user.id} AND role = 'staff'
    `;
    return { user: toPublicUser({ ...user, staffGroup: input.staffGroup, staffCodeHash: initialStaffCode.hash, staffCodeSalt: initialStaffCode.salt, staffCodeChangedAt: null }) };
  }

  const users = await readUsers();
  const nextUsers = users.map((item) =>
    item.id === user.id && item.role === "staff"
      ? {
          ...item,
          staffGroup: input.staffGroup,
          staffCodeHash: initialStaffCode.hash,
          staffCodeSalt: initialStaffCode.salt,
          staffCodeChangedAt: null,
        }
      : item
  );
  await writeUsers(nextUsers);
  return { user: toPublicUser({ ...user, staffGroup: input.staffGroup, staffCodeHash: initialStaffCode.hash, staffCodeSalt: initialStaffCode.salt, staffCodeChangedAt: null }) };
}

export async function updateStaffGroupByEmail(input: { email: string; staffGroup: StaffGroup }) {
  const user = await findUserByEmail(input.email);
  if (!user || user.role !== "staff") {
    return { error: "대상 사원 계정을 찾을 수 없습니다." };
  }

  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      UPDATE comet_users
      SET staff_group = ${input.staffGroup}
      WHERE id = ${user.id} AND role = 'staff'
    `;
    return { user: toPublicUser({ ...user, staffGroup: input.staffGroup }) };
  }

  const users = await readUsers();
  const nextUsers = users.map((item) =>
    item.id === user.id && item.role === "staff" ? { ...item, staffGroup: input.staffGroup } : item
  );
  await writeUsers(nextUsers);
  return { user: toPublicUser({ ...user, staffGroup: input.staffGroup }) };
}

export async function createBoardNotice(input: { title: string; body: string; authorEmail: string }) {
  const notice: BoardNotice = {
    id: randomBytes(16).toString("base64url"),
    title: input.title,
    body: input.body,
    authorEmail: input.authorEmail,
    createdAt: new Date().toISOString(),
  };

  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      INSERT INTO comet_board_notices (
        id,
        title,
        body,
        author_email,
        created_at
      )
      VALUES (
        ${notice.id},
        ${notice.title},
        ${notice.body},
        ${notice.authorEmail},
        ${notice.createdAt}
      )
    `;
    return { notice };
  }

  const notices = await readBoardNotices();
  await writeBoardNotices([notice, ...notices]);
  return { notice };
}

async function ensureScoreStore() {
  await fs.mkdir(path.dirname(SCORES_FILE), { recursive: true });
  try {
    await fs.access(SCORES_FILE);
  } catch {
    await fs.writeFile(SCORES_FILE, "[]\n", "utf8");
  }
}

async function readScores(): Promise<EvaluationScore[]> {
  await ensureScoreStore();
  const raw = await fs.readFile(SCORES_FILE, "utf8");
  return JSON.parse(raw) as EvaluationScore[];
}

async function writeScores(scores: EvaluationScore[]) {
  await ensureScoreStore();
  await fs.writeFile(SCORES_FILE, `${JSON.stringify(scores, null, 2)}\n`, "utf8");
}

export async function saveEvaluationScore(
  input: Omit<EvaluationScore, "id" | "submittedAt">,
) {
  const submittedAt = new Date().toISOString();
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    await sql`
      INSERT INTO comet_evaluation_scores (
        id, member_id, member_name, evaluation_track,
        document_id, document_title, applicant_name,
        evaluation_date, responses, submitted_at
      ) VALUES (
        ${randomBytes(12).toString("base64url")},
        ${input.memberId}, ${input.memberName}, ${input.evaluationTrack},
        ${input.documentId}, ${input.documentTitle}, ${input.applicantName},
        ${input.evaluationDate}, ${JSON.stringify(input.responses)}, ${submittedAt}
      )
      ON CONFLICT (member_id, document_id)
      DO UPDATE SET
        member_name      = EXCLUDED.member_name,
        applicant_name   = EXCLUDED.applicant_name,
        evaluation_date  = EXCLUDED.evaluation_date,
        responses        = EXCLUDED.responses,
        submitted_at     = EXCLUDED.submitted_at
    `;
    return;
  }

  const scores = await readScores();
  const idx = scores.findIndex(
    (s) => s.memberId === input.memberId && s.documentId === input.documentId,
  );
  const record: EvaluationScore = {
    id: randomBytes(12).toString("base64url"),
    ...input,
    submittedAt,
  };
  if (idx >= 0) {
    scores[idx] = record;
  } else {
    scores.push(record);
  }
  await writeScores(scores);
}

export async function listEvaluationScores(): Promise<EvaluationScore[]> {
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        id, member_id, member_name, evaluation_track,
        document_id, document_title, applicant_name,
        evaluation_date, responses, submitted_at
      FROM comet_evaluation_scores
      ORDER BY submitted_at DESC
    `) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: String(row.id),
      memberId: String(row.member_id),
      memberName: String(row.member_name),
      evaluationTrack: String(row.evaluation_track),
      documentId: String(row.document_id),
      documentTitle: String(row.document_title),
      applicantName: String(row.applicant_name),
      evaluationDate: String(row.evaluation_date),
      responses: row.responses as Record<string, string>,
      submittedAt: mapTimestamp(row.submitted_at) || new Date().toISOString(),
    }));
  }

  const scores = await readScores();
  return [...scores].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export async function listBoardNotices() {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        id,
        title,
        body,
        author_email,
        created_at
      FROM comet_board_notices
      ORDER BY created_at DESC
      LIMIT 10
    `) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      body: String(row.body),
      authorEmail: String(row.author_email),
      createdAt: mapTimestamp(row.created_at) || new Date().toISOString(),
    }));
  }

  const notices = await readBoardNotices();
  return notices.slice(0, 10);
}
