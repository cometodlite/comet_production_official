"use client";

import { useMemo, useState } from "react";
import type { EvaluationScore } from "@/lib/auth/store";
import {
  REAL_EXAM_ANSWER_KEY,
  REAL_EXAM_DOCUMENT_ID,
} from "@/lib/evaluation/real-exam-questions";

// ── helpers ───────────────────────────────────────────────────────────────────

const REAL_EXAM_MC_QUESTIONS = Object.keys(REAL_EXAM_ANSWER_KEY).map(Number);
const REAL_EXAM_MC_TOTAL = REAL_EXAM_MC_QUESTIONS.length; // 18

// 오늘 날짜(KST, YYYY-MM-DD) — 모듈 로드 시 1회 계산 (렌더 순수성 유지)
const TODAY_KST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

function isRealExamSubmission(s: EvaluationScore) {
  return "_leave_count" in s.responses || "_paste_count" in s.responses;
}

function computeMcScore(responses: Record<string, string>): number | null {
  let correct = 0;
  let counted = 0;
  for (const qNum of REAL_EXAM_MC_QUESTIONS) {
    const answer = REAL_EXAM_ANSWER_KEY[qNum];
    if (answer === undefined) continue;
    counted++;
    if (responses[String(qNum)] === answer) correct++;
  }
  return counted > 0 ? correct : null;
}

function hasAntiCheat(s: EvaluationScore) {
  return (
    Number(s.responses["_leave_count"] ?? 0) > 0 ||
    Number(s.responses["_paste_count"] ?? 0) > 0
  );
}

/** group submissions by KST calendar date string YYYY-MM-DD */
function toKstDate(isoString: string): string {
  const d = new Date(new Date(isoString).getTime() + 9 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function last14Days(): string[] {
  const result: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() + 9 * 60 * 60 * 1000 - i * 86400000);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

// ── sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "indigo" | "amber" | "red" | "emerald";
}) {
  const valueColor = {
    default: "text-white",
    indigo: "text-indigo-300",
    amber: "text-amber-300",
    red: "text-red-300",
    emerald: "text-emerald-300",
  }[accent];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[10px] font-semibold tracking-widest text-white/40">{label}</p>
      <p className={`mt-2 text-3xl font-black tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="mt-1 text-[10px] text-white/30">{sub}</p>}
    </div>
  );
}

function ScoreBar({
  label,
  count,
  max,
  accent = "indigo",
}: {
  label: string;
  count: number;
  max: number;
  accent?: "indigo" | "amber" | "emerald" | "red";
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const barColor = {
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
  }[accent];

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 flex-shrink-0 text-right text-xs font-semibold tabular-nums text-white/50">
        {label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-2.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 flex-shrink-0 text-right text-xs font-bold tabular-nums text-white/60">
        {count}
      </span>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function EvaluationDashboard({ scores }: { scores: EvaluationScore[] }) {
  const [expanded, setExpanded] = useState(true);

  const stats = useMemo(() => {
    const realExam = scores.filter(isRealExamSubmission);
    const practice = scores.filter((s) => !isRealExamSubmission(s));

    // Unique members by memberId
    const allMembers = new Set(scores.map((s) => s.memberId));
    const realMembers = new Set(realExam.map((s) => s.memberId));
    const practiceMembers = new Set(practice.map((s) => s.memberId));

    // Anti-cheat
    const flagged = realExam.filter(hasAntiCheat);

    // MC scores for Set A
    const setAScores = realExam
      .filter((s) => s.documentId === REAL_EXAM_DOCUMENT_ID)
      .map((s) => computeMcScore(s.responses))
      .filter((n): n is number => n !== null);

    const avgScore =
      setAScores.length > 0
        ? (setAScores.reduce((a, b) => a + b, 0) / setAScores.length).toFixed(1)
        : null;

    // Score distribution bands
    const bands = [
      { label: "0–5",   min: 0,  max: 5,  count: 0, accent: "red"     as const },
      { label: "6–10",  min: 6,  max: 10, count: 0, accent: "amber"   as const },
      { label: "11–14", min: 11, max: 14, count: 0, accent: "indigo"  as const },
      { label: "15–18", min: 15, max: 18, count: 0, accent: "emerald" as const },
    ];
    for (const sc of setAScores) {
      const band = bands.find((b) => sc >= b.min && sc <= b.max);
      if (band) band.count++;
    }

    // Per-track
    const trackMap = new Map<string, { real: number; practice: number }>();
    for (const s of scores) {
      const t = s.evaluationTrack || "미지정";
      const cur = trackMap.get(t) ?? { real: 0, practice: 0 };
      if (isRealExamSubmission(s)) cur.real++;
      else cur.practice++;
      trackMap.set(t, cur);
    }

    // Daily activity (last 14 days KST)
    const days = last14Days();
    const dayMap = new Map<string, number>(days.map((d) => [d, 0]));
    for (const s of scores) {
      const d = toKstDate(s.submittedAt);
      if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    }
    const dailyMax = Math.max(...Array.from(dayMap.values()), 1);
    const daily = days.map((d) => ({ date: d, count: dayMap.get(d) ?? 0 }));

    return {
      total: scores.length,
      realExamCount: realExam.length,
      practiceCount: practice.length,
      uniqueMembers: allMembers.size,
      realMembers: realMembers.size,
      practiceMembers: practiceMembers.size,
      flaggedCount: flagged.length,
      avgScore,
      setACount: setAScores.length,
      mcTotal: REAL_EXAM_MC_TOTAL,
      bands,
      tracks: Array.from(trackMap.entries()).map(([track, counts]) => ({ track, ...counts })),
      daily,
      dailyMax,
    };
  }, [scores]);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">평가 통계 대시보드</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
            응시 현황, 점수 분포, 부정행위 집계를 한눈에 확인합니다.
          </p>
        </div>
        <span className="flex-shrink-0 text-sm text-white/40">{expanded ? "↑" : "↓"}</span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* ── 1. Overview cards ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="총 제출" value={stats.total} sub={`응시자 ${stats.uniqueMembers}명`} />
            <StatCard label="실전 시험" value={stats.realExamCount} sub={`${stats.realMembers}명`} accent="indigo" />
            <StatCard label="연습 문제" value={stats.practiceCount} sub={`${stats.practiceMembers}명`} accent="amber" />
            <StatCard
              label="이상 행동"
              value={stats.flaggedCount}
              sub={stats.realExamCount > 0 ? `실전 응시의 ${Math.round((stats.flaggedCount / stats.realExamCount) * 100)}%` : "—"}
              accent={stats.flaggedCount > 0 ? "red" : "default"}
            />
          </div>

          {/* ── 2. 실전 점수 분포 (Set A) ── */}
          {stats.setACount > 0 && (
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold tracking-widest text-indigo-300/80">
                  실전 점수 분포 (Set A · 객관식 {stats.mcTotal}문항)
                </p>
                <div className="text-right">
                  <span className="text-xs font-semibold text-white/40">평균 </span>
                  <span className="font-mono text-sm font-black text-white">
                    {stats.avgScore}
                  </span>
                  <span className="text-xs text-white/40"> / {stats.mcTotal}</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {stats.bands.map((b) => (
                  <ScoreBar
                    key={b.label}
                    label={b.label}
                    count={b.count}
                    max={stats.setACount}
                    accent={b.accent}
                  />
                ))}
              </div>
              <p className="mt-3 text-[10px] text-white/25">
                {stats.setACount}명 채점 완료 · 주관식 별도 검토
              </p>
            </div>
          )}

          {/* ── 3. 트랙별 응시 현황 ── */}
          {stats.tracks.length > 0 && (
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="mb-3 text-[11px] font-semibold tracking-widest text-indigo-300/80">
                트랙별 응시 현황
              </p>
              <div className="overflow-hidden rounded-lg border border-white/[0.07]">
                <div className="grid grid-cols-[1fr_auto_auto] bg-white/[0.04] px-4 py-2.5 text-[10px] font-semibold text-white/50">
                  <span>트랙</span>
                  <span className="px-4 text-center">실전</span>
                  <span className="px-4 text-center">연습</span>
                </div>
                {stats.tracks.map(({ track, real, practice }) => (
                  <div
                    key={track}
                    className="grid grid-cols-[1fr_auto_auto] items-center border-t border-white/[0.05] px-4 py-3 text-sm"
                  >
                    <span className="break-all text-white/80">{track}</span>
                    <span className="px-4 text-center font-mono font-bold text-indigo-300">
                      {real}
                    </span>
                    <span className="px-4 text-center font-mono font-bold text-amber-300/70">
                      {practice}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. 최근 14일 제출 활동 ── */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="mb-4 text-[11px] font-semibold tracking-widest text-indigo-300/80">
              최근 14일 제출 활동
            </p>
            <div className="flex items-end gap-1" style={{ height: "60px" }}>
              {stats.daily.map(({ date, count }) => {
                const heightPct =
                  stats.dailyMax > 0 ? Math.max(4, Math.round((count / stats.dailyMax) * 100)) : 4;
                const day = date.slice(5); // MM-DD
                const isToday = date === TODAY_KST;
                return (
                  <div
                    key={date}
                    className="group relative flex flex-1 flex-col items-center justify-end gap-1"
                  >
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full mb-1.5 hidden rounded bg-black/80 px-2 py-1 text-[10px] font-semibold text-white group-hover:block whitespace-nowrap z-10">
                      {date}: {count}건
                    </div>
                    <div
                      className={`w-full rounded-sm transition-all ${
                        count === 0
                          ? "bg-white/[0.05]"
                          : isToday
                          ? "bg-indigo-400"
                          : "bg-indigo-500/60"
                      }`}
                      style={{ height: `${count === 0 ? 4 : heightPct}%` }}
                    />
                    {/* Date label: only show every 2nd */}
                    <span className="hidden text-[8px] text-white/25 lg:block">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-white/20">
              <span>{stats.daily[0]?.date.slice(5)}</span>
              <span className="text-white/35">오늘</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
