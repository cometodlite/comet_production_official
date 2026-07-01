"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type EffectiveProfile = {
  userId: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string | null;
  isCustom: boolean;
};

type CustomProfile = {
  displayName: string | null;
  roleTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export default function ProfileModal({
  userId,
  isMe,
  onClose,
}: {
  userId: string;
  isMe: boolean;
  onClose: () => void;
}) {
  const [effective, setEffective] = useState<EffectiveProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const loadFromCustom = useCallback((custom: CustomProfile | null) => {
    setDisplayName(custom?.displayName ?? "");
    setRoleTitle(custom?.roleTitle ?? "");
    setBio(custom?.bio ?? "");
    setAvatarUrl(custom?.avatarUrl ?? "");
  }, []);

  useEffect(() => {
    setLoading(true);
    setEditing(false);
    setError("");
    const url = isMe ? "/api/profile/me" : `/api/profile/${userId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (isMe) {
          setEffective(data.effective);
          loadFromCustom(data.custom);
        } else {
          setEffective(data);
        }
      })
      .catch(() => setError("프로필을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [userId, isMe, loadFromCustom]);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, roleTitle, bio, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setEffective(data.effective);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile/me", { method: "DELETE" });
      const data = await res.json();
      setEffective(data.effective);
      loadFromCustom(null);
      setEditing(false);
    } catch {
      setError("초기화에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#0a0a14] shadow-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <p className="text-center text-xs text-white/30 py-16">불러오는 중…</p>
        ) : !effective ? (
          <p className="text-center text-xs text-white/30 py-16">프로필을 찾을 수 없습니다.</p>
        ) : editing ? (
          <>
            <h3 className="text-base font-bold text-white mb-5">내 프로필 수정</h3>
            <div className="space-y-3">
              <Field label="표시 이름">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={effective.name}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50"
                  style={{ fontSize: "16px" }}
                />
              </Field>
              <Field label="직함">
                <input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder={effective.role}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50"
                  style={{ fontSize: "16px" }}
                />
              </Field>
              <Field label="소개">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="자기소개를 입력하세요"
                  className="w-full resize-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50"
                  style={{ fontSize: "16px" }}
                />
              </Field>
              <Field label="프로필 이미지 URL">
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50"
                  style={{ fontSize: "16px" }}
                />
              </Field>
            </div>

            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.10] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 disabled:opacity-40 text-sm font-semibold text-white transition"
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
            {effective.isCustom && (
              <button
                onClick={resetToDefault}
                disabled={saving}
                className="w-full mt-2 py-2 text-xs text-white/30 hover:text-white/55 transition disabled:opacity-40"
              >
                기본 프로필로 되돌리기
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-400/30 shrink-0 mb-4 bg-indigo-500/10 flex items-center justify-center">
                {effective.avatarUrl ? (
                  <Image src={effective.avatarUrl} alt={effective.name} width={96} height={96} unoptimized className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-indigo-300">{effective.name.charAt(0)}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">{effective.name}</h3>
              <p className="text-indigo-300/70 text-xs tracking-widest mt-1">{effective.role}</p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase mb-2">소개</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {effective.bio || "아직 소개가 없습니다."}
              </p>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.10] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition"
              >
                닫기
              </button>
              {isMe && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-sm font-semibold text-white transition"
                >
                  프로필 수정
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-white/40 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
