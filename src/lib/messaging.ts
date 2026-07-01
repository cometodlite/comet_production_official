import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

type SqlClient = ReturnType<typeof neon>;
let _sql: SqlClient | null = null;

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  _sql ||= neon(url);
  return _sql;
}

let tablesReady: Promise<void> | null = null;

async function ensureTables(sql: SqlClient) {
  tablesReady ||= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS comet_conversations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'direct',
        name TEXT,
        created_by TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comet_conversation_members (
        conversation_id TEXT NOT NULL REFERENCES comet_conversations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (conversation_id, user_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comet_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES comet_conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comet_push_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, endpoint)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_conv_member_user ON comet_conversation_members(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_msg_conv_time ON comet_messages(conversation_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_push_user ON comet_push_subscriptions(user_id)`;
  })();
  await tablesReady;
}

export type ConvMember = { id: string; name: string };

export type Conversation = {
  id: string;
  type: "direct" | "group";
  name: string | null;
  members: ConvMember[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSender: string | null;
  unread: boolean;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export type PushSub = { endpoint: string; p256dh: string; auth: string };

// ── Conversation helpers ───────────────────────────────────────────────────────

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables(sql);

  const rows = await sql`
    SELECT
      c.id, c.type, c.name, c.updated_at,
      cm_me.last_read_at,
      (SELECT m.content     FROM comet_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
      (SELECT m.created_at  FROM comet_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
      (SELECT m.sender_name FROM comet_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_sender
    FROM comet_conversations c
    JOIN comet_conversation_members cm_me ON cm_me.conversation_id = c.id AND cm_me.user_id = ${userId}
    ORDER BY COALESCE(
      (SELECT m.created_at FROM comet_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
      c.created_at
    ) DESC
  ` as Record<string, unknown>[];

  if (!rows.length) return [];

  const ids = rows.map((r) => String(r.id));
  const memberRows = await sql`
    SELECT conversation_id, user_id, user_name
    FROM comet_conversation_members
    WHERE conversation_id = ANY(${ids})
  ` as Record<string, unknown>[];

  return rows.map((row) => {
    const members = memberRows
      .filter((m) => String(m.conversation_id) === String(row.id))
      .map((m) => ({ id: String(m.user_id), name: String(m.user_name) }));
    const readAt = row.last_read_at ? new Date(row.last_read_at as string).getTime() : 0;
    const msgAt = row.last_message_at ? new Date(row.last_message_at as string).getTime() : 0;
    return {
      id: String(row.id),
      type: row.type === "group" ? "group" : "direct",
      name: row.name ? String(row.name) : null,
      members,
      lastMessage: row.last_message ? String(row.last_message) : null,
      lastMessageAt: row.last_message_at ? new Date(row.last_message_at as string).toISOString() : null,
      lastSender: row.last_sender ? String(row.last_sender) : null,
      unread: msgAt > readAt,
    } satisfies Conversation;
  });
}

export async function getConversationMessages(convId: string, userId: string, limit = 60): Promise<Message[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables(sql);
  const check = await sql`SELECT 1 FROM comet_conversation_members WHERE conversation_id = ${convId} AND user_id = ${userId} LIMIT 1` as unknown[];
  if (!check.length) return [];
  const rows = await sql`
    SELECT id, conversation_id, sender_id, sender_name, content, created_at
    FROM comet_messages WHERE conversation_id = ${convId}
    ORDER BY created_at ASC LIMIT ${limit}
  ` as Record<string, unknown>[];
  return rows.map(mapMsg);
}

export async function pollNewMessages(convId: string, userId: string, since: string): Promise<Message[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables(sql);
  const check = await sql`SELECT 1 FROM comet_conversation_members WHERE conversation_id = ${convId} AND user_id = ${userId} LIMIT 1` as unknown[];
  if (!check.length) return [];
  const rows = await sql`
    SELECT id, conversation_id, sender_id, sender_name, content, created_at
    FROM comet_messages WHERE conversation_id = ${convId} AND created_at > ${since}
    ORDER BY created_at ASC
  ` as Record<string, unknown>[];
  return rows.map(mapMsg);
}

export async function sendMessage(convId: string, senderId: string, senderName: string, content: string): Promise<Message | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables(sql);
  const check = await sql`SELECT 1 FROM comet_conversation_members WHERE conversation_id = ${convId} AND user_id = ${senderId} LIMIT 1` as unknown[];
  if (!check.length) return null;
  const id = randomBytes(12).toString("base64url");
  const now = new Date().toISOString();
  await sql`INSERT INTO comet_messages (id, conversation_id, sender_id, sender_name, content, created_at) VALUES (${id}, ${convId}, ${senderId}, ${senderName}, ${content}, ${now})`;
  await sql`UPDATE comet_conversations SET updated_at = ${now} WHERE id = ${convId}`;
  return { id, conversationId: convId, senderId, senderName, content, createdAt: now };
}

export async function markRead(convId: string, userId: string) {
  const sql = getSql();
  if (!sql) return;
  await ensureTables(sql);
  await sql`UPDATE comet_conversation_members SET last_read_at = NOW() WHERE conversation_id = ${convId} AND user_id = ${userId}`;
}

export async function getOrCreateDM(u1: string, n1: string, u2: string, n2: string): Promise<string> {
  const sql = getSql();
  if (!sql) throw new Error("No DB");
  await ensureTables(sql);
  const existing = await sql`
    SELECT c.id FROM comet_conversations c
    JOIN comet_conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = ${u1}
    JOIN comet_conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = ${u2}
    WHERE c.type = 'direct'
      AND (SELECT COUNT(*) FROM comet_conversation_members WHERE conversation_id = c.id) = 2
    LIMIT 1
  ` as Record<string, unknown>[];
  if (existing.length) return String(existing[0].id);
  const id = randomBytes(12).toString("base64url");
  await sql`INSERT INTO comet_conversations (id, type, name, created_by) VALUES (${id}, 'direct', NULL, ${u1})`;
  await sql`INSERT INTO comet_conversation_members (conversation_id, user_id, user_name) VALUES (${id}, ${u1}, ${n1}), (${id}, ${u2}, ${n2})`;
  return id;
}

export async function createGroup(name: string, creatorId: string, creatorName: string, members: ConvMember[]): Promise<string> {
  const sql = getSql();
  if (!sql) throw new Error("No DB");
  await ensureTables(sql);
  const id = randomBytes(12).toString("base64url");
  await sql`INSERT INTO comet_conversations (id, type, name, created_by) VALUES (${id}, 'group', ${name}, ${creatorId})`;
  const all = [{ id: creatorId, name: creatorName }, ...members.filter((m) => m.id !== creatorId)];
  for (const m of all) {
    await sql`INSERT INTO comet_conversation_members (conversation_id, user_id, user_name) VALUES (${id}, ${m.id}, ${m.name}) ON CONFLICT DO NOTHING`;
  }
  return id;
}

export async function getConvMembers(convId: string): Promise<ConvMember[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables(sql);
  const rows = await sql`SELECT user_id, user_name FROM comet_conversation_members WHERE conversation_id = ${convId}` as Record<string, unknown>[];
  return rows.map((r) => ({ id: String(r.user_id), name: String(r.user_name) }));
}

// ── Push subscription helpers ──────────────────────────────────────────────────

export async function savePushSub(userId: string, sub: PushSub) {
  const sql = getSql();
  if (!sql) return;
  await ensureTables(sql);
  await sql`
    INSERT INTO comet_push_subscriptions (id, user_id, endpoint, p256dh, auth_key)
    VALUES (${randomBytes(12).toString("base64url")}, ${userId}, ${sub.endpoint}, ${sub.p256dh}, ${sub.auth})
    ON CONFLICT (user_id, endpoint) DO NOTHING
  `;
}

export async function removePushSub(userId: string, endpoint: string) {
  const sql = getSql();
  if (!sql) return;
  await ensureTables(sql);
  await sql`DELETE FROM comet_push_subscriptions WHERE user_id = ${userId} AND endpoint = ${endpoint}`;
}

export async function getRecipientSubs(convId: string, excludeUserId: string): Promise<PushSub[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables(sql);
  const rows = await sql`
    SELECT ps.endpoint, ps.p256dh, ps.auth_key
    FROM comet_push_subscriptions ps
    JOIN comet_conversation_members cm ON cm.user_id = ps.user_id
    WHERE cm.conversation_id = ${convId} AND ps.user_id != ${excludeUserId}
  ` as Record<string, unknown>[];
  return rows.map((r) => ({ endpoint: String(r.endpoint), p256dh: String(r.p256dh), auth: String(r.auth_key) }));
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function mapMsg(r: Record<string, unknown>): Message {
  return {
    id: String(r.id),
    conversationId: String(r.conversation_id),
    senderId: String(r.sender_id),
    senderName: String(r.sender_name),
    content: String(r.content),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}
