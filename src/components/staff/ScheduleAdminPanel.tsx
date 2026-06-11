"use client";

import { useState, useTransition } from "react";
import type { ExamScheduleConfig } from "@/lib/auth/store";
import type { ExamSetMeta } from "@/lib/evaluation/exam-types";
import { saveExamSchedule, saveTrackActiveSet } from "@/app/actions/schedule";

// ── DayTagInput ──────────────────────────────────────────────────────────────

/** 날짜 배열을 태그 형태로 편집하는 인풋 */
function DayTagInput({
  label,
  days,
  onChange,
}: {
  label: string;
  days: number[];
  onChange: (days: number[]) => void;
}) {
  const [input, setInput] = useState("");
  const sorted = [...days].sort((a, b) => a - b);

  function add() {
    const val = Number(input.trim());
    if (!Number.isInteger(val) || val < 1 || val > 31) { setInput(""); return; }
    if (!days.includes(val)) onChange([...days, val]);
    setInput("");
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-white/60">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {sorted.map((d) => (
          <span
            key={d}
            className="flex items-center gap-1 rounded border border-indigo-400/35 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-200"
          >
            {d}일
            <button
              type="button"
              onClick={() => onChange(days.filter((x) => x !== d))}
              className="ml-0.5 text-indigo-400/60 hover:text-red-400 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        {days.length === 0 && (
          <span className="text-xs text-white/25 italic">날짜 없음</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={31}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="일 입력 후 추가"
          className="w-32 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition"
        >
          + 추가
        </button>
      </div>
    </div>
  );
}

// ── ScheduleSection ──────────────────────────────────────────────────────────

function ScheduleSection({
  title,
  initialConfig,
  track,
}: {
  title: string;
  initialConfig: ExamScheduleConfig;
  track?: string;
}) {
  const [config, setConfig] = useState<ExamScheduleConfig>(initialConfig);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveExamSchedule(config, track);
      if ("error" in result) { setError(result.error); return; }
      setSaved(true);
    });
  }

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 space-y-4">
      <p className="text-xs font-bold tracking-widest text-white/50">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <DayTagInput
          label="등록일 (실전 전날)"
          days={config.registrationDays}
          onChange={(days) => setConfig((c) => ({ ...c, registrationDays: days }))}
        />
        <DayTagInput
          label="실전일"
          days={config.realExamDays}
          onChange={(days) => setConfig((c) => ({ ...c, realExamDays: days }))}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-200 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "일정 저장"}
        </button>
        {saved && <span className="text-xs text-emerald-400">✓ 저장됐습니다</span>}
      </div>
    </div>
  );
}

// ── TrackSetSection ──────────────────────────────────────────────────────────

function TrackSetRow({
  track,
  sets,
  initialSetId,
}: {
  track: string;
  sets: ExamSetMeta[];
  initialSetId: string | null;
}) {
  const [selected, setSelected] = useState<string>(initialSetId ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveTrackActiveSet(track, selected || null);
      if ("error" in result) { setError(result.error); return; }
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="min-w-[80px] text-sm font-bold text-white">{track}</span>
      <select
        value={selected}
        onChange={(e) => { setSelected(e.target.value); setSaved(false); }}
        className="flex-1 min-w-[160px] rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
      >
        <option value="">글로벌 세트 사용</option>
        {sets.map((s) => (
          <option key={s.setId} value={s.setId}>
            {s.label} {s.isActive ? "(글로벌 활성)" : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white transition disabled:opacity-50"
      >
        {isPending ? "저장 중..." : "적용"}
      </button>
      {saved && <span className="text-xs text-emerald-400">✓</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function ScheduleAdminPanel({
  globalSchedule,
  tracks,
  trackSetIds,
  sets,
}: {
  globalSchedule: ExamScheduleConfig;
  tracks: string[];
  trackSetIds: Record<string, string | null>;
  sets: ExamSetMeta[];
}) {
  return (
    <section className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <h2 className="mb-1 text-lg font-bold tracking-tight text-white">평가 일정 관리</h2>
      <p className="mb-5 text-sm leading-relaxed text-[#86868b]">
        등록일·실전일 날짜를 설정합니다. 트랙별 일정을 별도로 지정할 수 있습니다.
      </p>

      {/* 글로벌 일정 */}
      <ScheduleSection
        title="글로벌 일정 (모든 트랙 기본값)"
        initialConfig={globalSchedule}
      />

      {/* 트랙별 문제 세트 지정 */}
      {tracks.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-[10px] font-bold tracking-widest text-indigo-300/70">트랙별 문제 세트</p>
          <div className="space-y-2">
            {tracks.map((track) => (
              <TrackSetRow
                key={track}
                track={track}
                sets={sets}
                initialSetId={trackSetIds[track] ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {tracks.length === 0 && (
        <p className="mt-4 text-xs text-white/30 italic">
          아직 응시 기록이 없어 트랙 목록이 비어 있습니다.
        </p>
      )}
    </section>
  );
}
