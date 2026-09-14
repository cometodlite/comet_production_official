import "server-only";

import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { SecurityFinding } from "@/lib/security/checks";

export type TargetScanResult = {
  targetId: string;
  targetLabel: string;
  findings: SecurityFinding[];
  erroredAt?: string;
};

export type SecurityScanRun = {
  id: string;
  ranAt: string;
  trigger: "cron" | "manual";
  results: TargetScanResult[];
};

const LOCAL_FILE = path.join(process.cwd(), ".data", "security-scans.json");
const VERCEL_FILE = "/tmp/comet-security-scans.json";
const SCANS_FILE = process.env.SECURITY_SCANS_STORE_PATH || (process.env.VERCEL ? VERCEL_FILE : LOCAL_FILE);
const MAX_RETAINED_RUNS = 30;

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let databaseReady: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  sqlClient ||= neon(databaseUrl);
  return sqlClient;
}

async function ensureDatabase(sql: SqlClient) {
  databaseReady ||= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS comet_security_scans (
        id TEXT PRIMARY KEY,
        ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        trigger TEXT NOT NULL DEFAULT 'cron',
        results JSONB NOT NULL
      )
    `;
  })();
  await databaseReady;
}

async function ensureLocalStore() {
  await fs.mkdir(path.dirname(SCANS_FILE), { recursive: true });
  try {
    await fs.access(SCANS_FILE);
  } catch {
    await fs.writeFile(SCANS_FILE, "[]\n", "utf8");
  }
}

async function readLocalRuns(): Promise<SecurityScanRun[]> {
  await ensureLocalStore();
  const raw = await fs.readFile(SCANS_FILE, "utf8");
  return JSON.parse(raw) as SecurityScanRun[];
}

async function writeLocalRuns(runs: SecurityScanRun[]) {
  await ensureLocalStore();
  await fs.writeFile(SCANS_FILE, `${JSON.stringify(runs, null, 2)}\n`, "utf8");
}

export async function saveSecurityScanRun(input: {
  trigger: "cron" | "manual";
  results: TargetScanResult[];
}): Promise<SecurityScanRun> {
  const run: SecurityScanRun = {
    id: randomBytes(12).toString("base64url"),
    ranAt: new Date().toISOString(),
    trigger: input.trigger,
    results: input.results,
  };

  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    await sql`
      INSERT INTO comet_security_scans (id, ran_at, trigger, results)
      VALUES (${run.id}, ${run.ranAt}, ${run.trigger}, ${JSON.stringify(run.results)})
    `;
    await sql`
      DELETE FROM comet_security_scans
      WHERE id NOT IN (
        SELECT id FROM comet_security_scans ORDER BY ran_at DESC LIMIT ${MAX_RETAINED_RUNS}
      )
    `;
    return run;
  }

  const runs = await readLocalRuns();
  runs.unshift(run);
  await writeLocalRuns(runs.slice(0, MAX_RETAINED_RUNS));
  return run;
}

export async function getLatestSecurityScan(): Promise<SecurityScanRun | null> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT id, ran_at, trigger, results
      FROM comet_security_scans
      ORDER BY ran_at DESC
      LIMIT 1
    `) as Record<string, unknown>[];
    if (!rows[0]) return null;
    return {
      id: String(rows[0].id),
      ranAt: rows[0].ran_at instanceof Date ? rows[0].ran_at.toISOString() : String(rows[0].ran_at),
      trigger: rows[0].trigger === "manual" ? "manual" : "cron",
      results: rows[0].results as TargetScanResult[],
    };
  }

  const runs = await readLocalRuns();
  return runs[0] || null;
}

export async function listRecentSecurityScans(limit = 10): Promise<SecurityScanRun[]> {
  const sql = getSqlClient();
  if (sql) {
    await ensureDatabase(sql);
    const rows = (await sql`
      SELECT id, ran_at, trigger, results
      FROM comet_security_scans
      ORDER BY ran_at DESC
      LIMIT ${limit}
    `) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: String(row.id),
      ranAt: row.ran_at instanceof Date ? row.ran_at.toISOString() : String(row.ran_at),
      trigger: row.trigger === "manual" ? "manual" : "cron",
      results: row.results as TargetScanResult[],
    }));
  }

  const runs = await readLocalRuns();
  return runs.slice(0, limit);
}
