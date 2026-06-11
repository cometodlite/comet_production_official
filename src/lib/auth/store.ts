import "server-only";

import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { StaffGroup } from "@/lib/auth/staff-groups";
import type { ExamQuestionData, ExamSetMeta } from "@/lib/evaluation/exam-types";

const scrypt = promisify(scryptCallback);
const LOCAL_USERS_FILE = path.join(process.cwd(), ".data", "users.json");
const LOCAL_BOARD_NOTICES_FILE = path.join(process.cwd(), ".data", "board-notices.json");
const LOCAL_SCORES_FILE = path.join(process.cwd(), ".data", "evaluation-scores.json");
const LOCAL_EXAM_QUESTIONS_FILE = path.join(process.cwd(), ".data", "exam-questions.json");
const LOCAL_WRITTEN_GRADES_FILE = path.join(process.cwd(), ".data", "written-grades.json");
const VERCEL_USERS_FILE = "/tmp/comet-production-users.json";
const VERCEL_BOARD_NOTICES_FILE = "/tmp/comet-production-board-notices.json";
const VERCEL_SCORES_FILE = "/tmp/comet-evaluation-scores.json";
const VERCEL_EXAM_QUESTIONS_FILE = "/tmp/comet-exam-questions.json";
const VERCEL_WRITTEN_GRADES_FILE = "/tmp/comet-written-grades.json";
const USERS_FILE =
  process.env.AUTH_STORE_PATH || (process.env.VERCEL ? VERCEL_USERS_FILE : LOCAL_USERS_FILE);
const BOARD_NOTICES_FILE = process.env.BOARD_NOTICES_STORE_PATH || (process.env.VERCEL ? VERCEL_BOARD_NOTICES_FILE : LOCAL_BOARD_NOTICES_FILE);
const SCORES_FILE = process.env.SCORES_STORE_PATH || (process.env.VERCEL ? VERCEL_SCORES_FILE : LOCAL_SCORES_FILE);
const EXAM_QUESTIONS_FILE = process.env.EXAM_QUESTIONS_STORE_PATH || (process.env.VERCEL ? VERCEL_EXAM_QUESTIONS_FILE : LOCAL_EXAM_QUESTIONS_FILE);
const WRITTEN_GRADES_FILE = process.env.WRITTEN_GRADES_STORE_PATH || (process.env.VERCEL ? VERCEL_WRITTEN_GRADES_FILE : LOCAL_WRITTEN_GRADES_FILE);

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

export type EvaluationVerdict = "pass" | "fail";

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
  /** 이사회가 지정한 합불 결과. null = 미결정 */
  verdict?: EvaluationVerdict | null;
  /** 합불 결정 사유 메모 */
  verdictNote?: string | null;
  /** 합불 결정 시각 (ISO) */
  verdictAt?: string | null;
};

export type WrittenGrade = {
  id: string;
  evaluationScoreId: string;
  questionKey: string;   // "11", "19" 등 문항 번호 문자열
  score: number;
  maxScore: number;
  comment: string;
  gradedBy: string;      // 채점자 이름
  gradedAt: string;
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
      CREATE TABLE IF NOT EXISTS comet_exam_questions (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        question_type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        choices JSONB DEFAULT NULL,
        correct_answer TEXT DEFAULT NULL,
        explanation TEXT DEFAULT NULL,
        model_answer TEXT DEFAULT NULL,
        rows_hint INTEGER DEFAULT 6,
        is_fixed_last BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comet_exam_config (
        config_key TEXT PRIMARY KEY,
        config_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
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
    // 합불 컬럼 추가 (이미 존재하면 무시)
    await sql`ALTER TABLE comet_evaluation_scores ADD COLUMN IF NOT EXISTS verdict TEXT`;
    await sql`ALTER TABLE comet_evaluation_scores ADD COLUMN IF NOT EXISTS verdict_note TEXT`;
    await sql`ALTER TABLE comet_evaluation_scores ADD COLUMN IF NOT EXISTS verdict_at TIMESTAMPTZ`;

    await sql`
      CREATE TABLE IF NOT EXISTS comet_written_grades (
        id TEXT PRIMARY KEY,
        evaluation_score_id TEXT NOT NULL,
        question_key TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        max_score INTEGER NOT NULL DEFAULT 10,
        comment TEXT NOT NULL DEFAULT '',
        graded_by TEXT NOT NULL,
        graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (evaluation_score_id, question_key)
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

/** 회원 ID로 이메일 주소를 조회합니다 (이메일 알림용). */
export async function getMemberEmailById(memberId: string): Promise<string | null> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = await sql`SELECT email FROM comet_users WHERE id = ${memberId} LIMIT 1` as Record<string, unknown>[];
    return rows[0] ? String(rows[0].email) : null;
  }
  const users = await readUsers();
  return users.find((u) => u.id === memberId)?.email ?? null;
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
        evaluation_date, responses, submitted_at,
        verdict, verdict_note, verdict_at
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
      verdict: (row.verdict as EvaluationVerdict | null) ?? null,
      verdictNote: (row.verdict_note as string | null) ?? null,
      verdictAt: mapTimestamp(row.verdict_at) ?? null,
    }));
  }

  const scores = await readScores();
  return [...scores].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export async function getMyEvaluationScores(memberId: string): Promise<EvaluationScore[]> {
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        id, member_id, member_name, evaluation_track,
        document_id, document_title, applicant_name,
        evaluation_date, responses, submitted_at,
        verdict, verdict_note, verdict_at
      FROM comet_evaluation_scores
      WHERE member_id = ${memberId}
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
      verdict: (row.verdict as EvaluationVerdict | null) ?? null,
      verdictNote: (row.verdict_note as string | null) ?? null,
      verdictAt: mapTimestamp(row.verdict_at) ?? null,
    }));
  }

  const scores = await readScores();
  return scores
    .filter((s) => s.memberId === memberId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export type VerdictLookup = {
  applicantName: string;
  evaluationTrack: string;
  evaluationDate: string;
  documentTitle: string;
  verdict: EvaluationVerdict | null;
  verdictNote: string | null;
  verdictAt: string | null;
};

/**
 * 응시자 이름으로 합불 결과를 조회합니다 (공개 조회 페이지용).
 * 이름은 대소문자·공백 trim 무시 비교.
 */
export async function getVerdictByApplicantName(name: string): Promise<VerdictLookup[]> {
  const trimmed = name.trim();
  if (!trimmed) return [];

  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT
        applicant_name, evaluation_track, evaluation_date,
        document_title, verdict, verdict_note, verdict_at
      FROM comet_evaluation_scores
      WHERE LOWER(TRIM(applicant_name)) = LOWER(${trimmed})
      ORDER BY submitted_at DESC
    `) as Record<string, unknown>[];
    return rows.map((row) => ({
      applicantName: String(row.applicant_name),
      evaluationTrack: String(row.evaluation_track),
      evaluationDate: String(row.evaluation_date),
      documentTitle: String(row.document_title),
      verdict: (row.verdict as EvaluationVerdict | null) ?? null,
      verdictNote: (row.verdict_note as string | null) ?? null,
      verdictAt: mapTimestamp(row.verdict_at) ?? null,
    }));
  }

  const scores = await readScores();
  return scores
    .filter((s) => s.applicantName.trim().toLowerCase() === trimmed.toLowerCase())
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .map((s) => ({
      applicantName: s.applicantName,
      evaluationTrack: s.evaluationTrack,
      evaluationDate: s.evaluationDate,
      documentTitle: s.documentTitle,
      verdict: s.verdict ?? null,
      verdictNote: s.verdictNote ?? null,
      verdictAt: s.verdictAt ?? null,
    }));
}

/**
 * 이사회 전용: 특정 평가 답안의 합불 결과를 저장합니다.
 * verdict = null 이면 결정을 취소(미결정)합니다.
 */
export async function setEvaluationVerdict(input: {
  evaluationScoreId: string;
  verdict: EvaluationVerdict | null;
  note: string;
}): Promise<void> {
  const verdictAt = input.verdict ? new Date().toISOString() : null;
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    await sql`
      UPDATE comet_evaluation_scores
      SET
        verdict      = ${input.verdict ?? null},
        verdict_note = ${input.note || null},
        verdict_at   = ${verdictAt}
      WHERE id = ${input.evaluationScoreId}
    `;
    return;
  }

  // File-based fallback
  const scores = await readScores();
  const idx = scores.findIndex((s) => s.id === input.evaluationScoreId);
  if (idx >= 0) {
    scores[idx] = {
      ...scores[idx],
      verdict: input.verdict ?? null,
      verdictNote: input.note || null,
      verdictAt,
    };
    await writeScores(scores);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exam question management
// ─────────────────────────────────────────────────────────────────────────────

type ExamQuestionsFile = {
  questions: (ExamQuestionData & { setId: string; sortOrder: number })[];
  config: Record<string, string>;
};

async function ensureExamQuestionsStore() {
  await fs.mkdir(path.dirname(EXAM_QUESTIONS_FILE), { recursive: true });
  try { await fs.access(EXAM_QUESTIONS_FILE); } catch {
    await fs.writeFile(EXAM_QUESTIONS_FILE, JSON.stringify({ questions: [], config: {} }, null, 2) + "\n", "utf8");
  }
}

async function readExamQuestionsFile(): Promise<ExamQuestionsFile> {
  await ensureExamQuestionsStore();
  const raw = await fs.readFile(EXAM_QUESTIONS_FILE, "utf8");
  return JSON.parse(raw) as ExamQuestionsFile;
}

async function writeExamQuestionsFile(data: ExamQuestionsFile) {
  await ensureExamQuestionsStore();
  await fs.writeFile(EXAM_QUESTIONS_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function mapDbRowToQuestion(row: Record<string, unknown>): ExamQuestionData & { setId: string; sortOrder: number } {
  return {
    id: String(row.id),
    setId: String(row.set_id),
    type: row.question_type === "written" ? "written" : "choice",
    text: String(row.question_text),
    choices: Array.isArray(row.choices) && row.choices.length === 5
      ? row.choices as [string, string, string, string, string]
      : undefined,
    correctAnswer: row.correct_answer ? String(row.correct_answer) : undefined,
    explanation: row.explanation ? String(row.explanation) : undefined,
    modelAnswer: row.model_answer ? String(row.model_answer) : undefined,
    rows: row.rows_hint ? Number(row.rows_hint) : 6,
    fixedLast: Boolean(row.is_fixed_last),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

// ── 평가 일정 설정 ─────────────────────────────────────────────────────────────

export type ExamScheduleConfig = {
  registrationDays: number[];
  realExamDays: number[];
};

export async function getExamScheduleConfig(track?: string): Promise<ExamScheduleConfig> {
  const [regRaw, examRaw] = await Promise.all([
    track
      ? getExamConfig(`schedule_registration_days:${track}`).then((v) => v ?? getExamConfig("schedule_registration_days"))
      : getExamConfig("schedule_registration_days"),
    track
      ? getExamConfig(`schedule_real_exam_days:${track}`).then((v) => v ?? getExamConfig("schedule_real_exam_days"))
      : getExamConfig("schedule_real_exam_days"),
  ]);
  return {
    registrationDays: regRaw ? (JSON.parse(regRaw) as number[]) : [4, 14, 24],
    realExamDays:     examRaw ? (JSON.parse(examRaw) as number[]) : [5, 15, 25],
  };
}

export async function setExamScheduleConfig(
  config: ExamScheduleConfig,
  track?: string,
): Promise<void> {
  const regKey  = track ? `schedule_registration_days:${track}` : "schedule_registration_days";
  const examKey = track ? `schedule_real_exam_days:${track}`    : "schedule_real_exam_days";
  await Promise.all([
    setExamConfig(regKey,  JSON.stringify(config.registrationDays)),
    setExamConfig(examKey, JSON.stringify(config.realExamDays)),
  ]);
}

// ── 트랙 관리 ───────────────────────────────────────────────────────────────────

/** 현재 존재하는 모든 평가 트랙 이름을 반환합니다. */
export async function listEvaluationTracks(): Promise<string[]> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = await sql`
      SELECT DISTINCT evaluation_track FROM comet_evaluation_scores ORDER BY evaluation_track
    ` as Record<string, unknown>[];
    return rows.map((r) => String(r.evaluation_track));
  }
  const scores = await readScores();
  return [...new Set(scores.map((s) => s.evaluationTrack))].sort();
}

/** 특정 트랙에 활성 문제 세트를 지정합니다. null 이면 글로벌 세트 사용. */
export async function setTrackActiveSet(track: string, setId: string | null): Promise<void> {
  const key = `active_exam_set_id:${track}`;
  if (setId) {
    await setExamConfig(key, setId);
  } else {
    await deleteExamConfig(key);
  }
}

export async function getExamConfig(key: string): Promise<string | null> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = await sql`SELECT config_value FROM comet_exam_config WHERE config_key = ${key} LIMIT 1` as Record<string, unknown>[];
    return rows[0] ? String(rows[0].config_value) : null;
  }
  const data = await readExamQuestionsFile();
  return data.config[key] ?? null;
}

export async function setExamConfig(key: string, value: string) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      INSERT INTO comet_exam_config (config_key, config_value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = NOW()
    `;
    return;
  }
  const data = await readExamQuestionsFile();
  data.config[key] = value;
  await writeExamQuestionsFile(data);
}

export async function deleteExamConfig(key: string) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`DELETE FROM comet_exam_config WHERE config_key = ${key}`;
    return;
  }
  const data = await readExamQuestionsFile();
  delete data.config[key];
  await writeExamQuestionsFile(data);
}

export async function listExamQuestionSets(): Promise<ExamSetMeta[]> {
  const activeSetId = await getExamConfig("active_exam_set_id");
  const sql = getSqlClient();

  if (sql) {
    await ensureDatabase(sql);
    const rows = await sql`
      SELECT set_id, COUNT(*) as total,
        SUM(CASE WHEN question_type = 'choice' THEN 1 ELSE 0 END) as mc_count,
        SUM(CASE WHEN question_type = 'written' THEN 1 ELSE 0 END) as written_count
      FROM comet_exam_questions
      GROUP BY set_id
      ORDER BY MIN(created_at) DESC
    ` as Record<string, unknown>[];
    return rows.map((r) => ({
      setId: String(r.set_id),
      label: String(r.set_id),
      questionCount: Number(r.total),
      mcCount: Number(r.mc_count),
      writtenCount: Number(r.written_count),
      isActive: String(r.set_id) === activeSetId,
    }));
  }

  const data = await readExamQuestionsFile();
  const bySet = new Map<string, { mc: number; written: number }>();
  for (const q of data.questions) {
    const cur = bySet.get(q.setId) ?? { mc: 0, written: 0 };
    if (q.type === "choice") cur.mc++;
    else cur.written++;
    bySet.set(q.setId, cur);
  }
  return Array.from(bySet.entries()).map(([setId, counts]) => ({
    setId,
    label: setId,
    questionCount: counts.mc + counts.written,
    mcCount: counts.mc,
    writtenCount: counts.written,
    isActive: setId === activeSetId,
  }));
}

export async function listExamQuestionsForSet(setId: string): Promise<(ExamQuestionData & { setId: string; sortOrder: number })[]> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = await sql`
      SELECT * FROM comet_exam_questions WHERE set_id = ${setId} ORDER BY sort_order ASC, created_at ASC
    ` as Record<string, unknown>[];
    return rows.map(mapDbRowToQuestion);
  }
  const data = await readExamQuestionsFile();
  return data.questions.filter((q) => q.setId === setId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createExamQuestion(input: {
  setId: string;
  type: "choice" | "written";
  text: string;
  choices?: [string, string, string, string, string];
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  rows?: number;
  fixedLast?: boolean;
  sortOrder?: number;
}) {
  const id = randomBytes(12).toString("base64url");
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      INSERT INTO comet_exam_questions
        (id, set_id, question_type, question_text, choices, correct_answer, explanation, model_answer, rows_hint, is_fixed_last, sort_order)
      VALUES (
        ${id}, ${input.setId}, ${input.type}, ${input.text},
        ${input.choices ? JSON.stringify(input.choices) : null},
        ${input.correctAnswer || null}, ${input.explanation || null},
        ${input.modelAnswer || null}, ${input.rows || 6},
        ${input.fixedLast ?? input.type === "written"},
        ${input.sortOrder ?? 0}
      )
    `;
    return id;
  }
  const data = await readExamQuestionsFile();
  data.questions.push({
    id, setId: input.setId, type: input.type, text: input.text,
    choices: input.choices, correctAnswer: input.correctAnswer,
    explanation: input.explanation, modelAnswer: input.modelAnswer,
    rows: input.rows || 6,
    fixedLast: input.fixedLast ?? input.type === "written",
    sortOrder: input.sortOrder ?? 0,
  });
  await writeExamQuestionsFile(data);
  return id;
}

export async function updateExamQuestion(id: string, input: {
  text?: string;
  choices?: [string, string, string, string, string];
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  rows?: number;
  fixedLast?: boolean;
  sortOrder?: number;
}) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      UPDATE comet_exam_questions SET
        question_text   = COALESCE(${input.text ?? null}, question_text),
        choices         = COALESCE(${input.choices ? JSON.stringify(input.choices) : null}::jsonb, choices),
        correct_answer  = COALESCE(${input.correctAnswer ?? null}, correct_answer),
        explanation     = COALESCE(${input.explanation ?? null}, explanation),
        model_answer    = COALESCE(${input.modelAnswer ?? null}, model_answer),
        rows_hint       = COALESCE(${input.rows ?? null}, rows_hint),
        is_fixed_last   = COALESCE(${input.fixedLast ?? null}, is_fixed_last),
        sort_order      = COALESCE(${input.sortOrder ?? null}, sort_order)
      WHERE id = ${id}
    `;
    return;
  }
  const data = await readExamQuestionsFile();
  const idx = data.questions.findIndex((q) => q.id === id);
  if (idx >= 0) {
    data.questions[idx] = { ...data.questions[idx], ...input };
    await writeExamQuestionsFile(data);
  }
}

export async function deleteExamQuestion(id: string) {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`DELETE FROM comet_exam_questions WHERE id = ${id}`;
    return;
  }
  const data = await readExamQuestionsFile();
  data.questions = data.questions.filter((q) => q.id !== id);
  await writeExamQuestionsFile(data);
}

/**
 * Returns questions for the currently active set, or null if no active set
 * (caller should fall back to hardcoded Set A).
 */
export async function getActiveExamQuestions(track?: string): Promise<ExamQuestionData[] | null> {
  // 트랙별 세트 → 글로벌 세트 순으로 fallback
  let activeSetId: string | null = null;
  if (track) {
    activeSetId = await getExamConfig(`active_exam_set_id:${track}`);
  }
  if (!activeSetId) {
    activeSetId = await getExamConfig("active_exam_set_id");
  }
  if (!activeSetId) return null;
  const questions = await listExamQuestionsForSet(activeSetId);
  if (questions.length === 0) return null;
  return questions;
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

// ── Written grade helpers (file fallback) ────────────────────────────────────

async function ensureWrittenGradesStore() {
  await fs.mkdir(path.dirname(WRITTEN_GRADES_FILE), { recursive: true });
  try {
    await fs.access(WRITTEN_GRADES_FILE);
  } catch {
    await fs.writeFile(WRITTEN_GRADES_FILE, "[]\n", "utf8");
  }
}

async function readWrittenGrades(): Promise<WrittenGrade[]> {
  await ensureWrittenGradesStore();
  const raw = await fs.readFile(WRITTEN_GRADES_FILE, "utf8");
  return JSON.parse(raw) as WrittenGrade[];
}

async function writeWrittenGrades(grades: WrittenGrade[]) {
  await ensureWrittenGradesStore();
  await fs.writeFile(WRITTEN_GRADES_FILE, `${JSON.stringify(grades, null, 2)}\n`, "utf8");
}

function mapGradeRow(row: Record<string, unknown>): WrittenGrade {
  return {
    id: String(row.id),
    evaluationScoreId: String(row.evaluation_score_id),
    questionKey: String(row.question_key),
    score: Number(row.score),
    maxScore: Number(row.max_score),
    comment: String(row.comment ?? ""),
    gradedBy: String(row.graded_by),
    gradedAt: mapTimestamp(row.graded_at) || new Date().toISOString(),
  };
}

// ── Public store functions ───────────────────────────────────────────────────

/**
 * 서술형 답안 채점 결과를 저장합니다. (같은 문항은 덮어씁니다)
 */
export async function saveWrittenGrade(input: {
  evaluationScoreId: string;
  questionKey: string;
  score: number;
  maxScore: number;
  comment: string;
  gradedBy: string;
}): Promise<void> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      INSERT INTO comet_written_grades
        (id, evaluation_score_id, question_key, score, max_score, comment, graded_by, graded_at)
      VALUES (
        ${randomBytes(12).toString("base64url")},
        ${input.evaluationScoreId}, ${input.questionKey},
        ${input.score}, ${input.maxScore}, ${input.comment},
        ${input.gradedBy}, ${new Date().toISOString()}
      )
      ON CONFLICT (evaluation_score_id, question_key)
      DO UPDATE SET
        score     = EXCLUDED.score,
        max_score = EXCLUDED.max_score,
        comment   = EXCLUDED.comment,
        graded_by = EXCLUDED.graded_by,
        graded_at = EXCLUDED.graded_at
    `;
    return;
  }
  const grades = await readWrittenGrades();
  const idx = grades.findIndex(
    (g) => g.evaluationScoreId === input.evaluationScoreId && g.questionKey === input.questionKey,
  );
  const record: WrittenGrade = {
    id: randomBytes(12).toString("base64url"),
    ...input,
    gradedAt: new Date().toISOString(),
  };
  if (idx >= 0) { grades[idx] = record; } else { grades.push(record); }
  await writeWrittenGrades(grades);
}

/**
 * 모든 서술형 채점 결과를 반환합니다. (이사회 전용)
 */
export async function listAllWrittenGrades(): Promise<WrittenGrade[]> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT * FROM comet_written_grades ORDER BY graded_at DESC
    `) as Record<string, unknown>[];
    return rows.map(mapGradeRow);
  }
  return readWrittenGrades();
}
