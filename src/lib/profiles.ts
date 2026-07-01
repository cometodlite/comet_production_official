import "server-only";
import { neon } from "@neondatabase/serverless";
import { findPublicUserById } from "@/lib/auth/store";
import { getStaffGroupLabel } from "@/lib/auth/staff-groups";
import { getArtistSlugByEmail } from "@/data/staff-artist-map";
import { artists } from "@/data/artists";

type SqlClient = ReturnType<typeof neon>;
let _sql: SqlClient | null = null;

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  _sql ||= neon(url);
  return _sql;
}

let tableReady: Promise<void> | null = null;

async function ensureTable(sql: SqlClient) {
  tableReady ||= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS comet_user_profiles (
        user_id TEXT PRIMARY KEY,
        display_name TEXT,
        role_title TEXT,
        bio TEXT,
        avatar_url TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })();
  await tableReady;
}

export type CustomProfile = {
  displayName: string | null;
  roleTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export type EffectiveProfile = {
  userId: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string | null;
  isCustom: boolean;
};

export async function getCustomProfile(userId: string): Promise<CustomProfile | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureTable(sql);
  const rows = await sql`
    SELECT display_name, role_title, bio, avatar_url
    FROM comet_user_profiles WHERE user_id = ${userId} LIMIT 1
  ` as Record<string, unknown>[];
  if (!rows.length) return null;
  const row = rows[0];
  return {
    displayName: (row.display_name as string | null) ?? null,
    roleTitle: (row.role_title as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
  };
}

export async function upsertCustomProfile(userId: string, input: CustomProfile): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureTable(sql);
  await sql`
    INSERT INTO comet_user_profiles (user_id, display_name, role_title, bio, avatar_url, updated_at)
    VALUES (${userId}, ${input.displayName || null}, ${input.roleTitle || null}, ${input.bio || null}, ${input.avatarUrl || null}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      role_title   = EXCLUDED.role_title,
      bio          = EXCLUDED.bio,
      avatar_url   = EXCLUDED.avatar_url,
      updated_at   = NOW()
  `;
}

export async function resetCustomProfile(userId: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureTable(sql);
  await sql`DELETE FROM comet_user_profiles WHERE user_id = ${userId}`;
}

export async function getEffectiveProfile(userId: string): Promise<EffectiveProfile | null> {
  const user = await findPublicUserById(userId);
  if (!user) return null;

  const custom = await getCustomProfile(userId);
  const artistSlug = getArtistSlugByEmail(user.email);
  const artist = artistSlug ? artists.find((a) => a.slug === artistSlug) : null;

  const name = custom?.displayName || artist?.name || user.name;
  const role = custom?.roleTitle || artist?.role || getStaffGroupLabel(user.staffGroup);
  const bio = custom?.bio ?? artist?.bio.ko ?? "";
  const avatarUrl = custom?.avatarUrl || artist?.image || null;

  return {
    userId,
    name,
    role,
    bio,
    avatarUrl,
    isCustom: Boolean(custom),
  };
}
