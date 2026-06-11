"use client";

import { useState, useTransition } from "react";
import type { EvaluationScore, EvaluationVerdict, WrittenGrade } from "@/lib/auth/store";
import { gradeWrittenAnswer } from "@/app/actions/grading";
import { saveEvaluationVerdict } from "@/app/actions/verdict";
import {
  REAL_EXAM_ANSWER_KEY,
  REAL_EXAM_DOCUMENT_ID,
} from "@/lib/evaluation/real-exam-questions";

// ── constants ─────────────────────────────────────────────────────────────────

const MC_VALUE_RE = /^[1-5]$/;
const HIDDEN_KEYS = new Set(["_leave_count", "_paste_count"]);

/** 선택지 응답(1-5)이면 false, 서술형 텍스트이면 true */
function isWritten(value: string) {
  return Boolean(value.trim()) && !MC_VALUE_RE.test(value.trim());
}

// ── CSV export ────────────────────────────────────────────────────────────────

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function computeMcScoreForExport(score: EvaluationScore): { correct: number; total: number } | null {
  if (score.documentId !== REAL_EXAM_DOCUMENT_ID) return null;
  const keys = Object.keys(REAL_EXAM_ANSWER_KEY).map(Number);
  let correct = 0;
  for (const qNum of keys) {
    if (score.responses[String(qNum)] === REAL_EXAM_ANSWER_KEY[qNum]) correct++;
  }
  return { correct, total: keys.length };
}

export function exportEvaluationCsv(
  scores: EvaluationScore[],
  writtenGrades: WrittenGrade[],
) {
  if (scores.length === 0) return;

  // Build a grade lookup: `${scoreId}:${questionKey}` → WrittenGrade
  const gradeMap = new Map<string, WrittenGrade>();
  for (const g of writtenGrades) {
    gradeMap.set(`${g.evaluationScoreId}:${g.questionKey}`, g);
  }

  // Collect all question keys seen across every submission
  const allMcKeys = new Set<string>();
  const allWrittenKeys = new Set<string>();
  for (const s of scores) {
    for (const [key, val] of Object.entries(s.responses)) {
      if (!/^\d{1,2}$/.test(key) || HIDDEN_KEYS.has(key)) continue;
      if (MC_VALUE_RE.test(val.trim())) allMcKeys.add(key);
      else if (val.trim()) allWrittenKeys.add(key);
    }
  }
  const mcKeys     = [...allMcKeys    ].sort((a, b) => Number(a) - Number(b));
  const writtenKeys = [...allWrittenKeys].sort((a, b) => Number(a) - Number(b));

  // ── Header row ──
  const headers: string[] = [
    "이름", "응시자명", "트랙", "문서", "응시일", "제출일시",
    "객관식점수", "객관식만점",
    "서술형점수합계", "서술형만점합계",
    "총점", "총만점",
    "탭이탈횟수", "붙여넣기횟수",
    "최소응답시간_초", "빠른응답건수_10초미만",
    "합불결정", "결정사유",
  ];
  // Written: answer + grade interleaved
  for (const k of writtenKeys) {
    headers.push(`Q${k}_답안`, `Q${k}_점수`, `Q${k}_만점`, `Q${k}_코멘트`);
  }
  // MC answers
  for (const k of mcKeys) {
    headers.push(`Q${k}_선택`);
  }
  headers.push("채점자");

  // ── Data rows ──
  const rows = scores.map((s) => {
    const mc = computeMcScoreForExport(s);
    const gradesForScore = writtenGrades.filter((g) => g.evaluationScoreId === s.id);
    const writtenTotal   = gradesForScore.reduce((sum, g) => sum + g.score, 0);
    const writtenMaxTotal = gradesForScore.reduce((sum, g) => sum + g.maxScore, 0);
    const gradedBy = [...new Set(gradesForScore.map((g) => g.gradedBy))].join(" / ");
    const totalScore = (mc?.correct ?? 0) + writtenTotal;
    const totalMax   = (mc?.total ?? 0) + writtenMaxTotal;

    const cells: unknown[] = [
      s.memberName,
      s.applicantName,
      s.evaluationTrack,
      s.documentTitle,
      s.evaluationDate,
      new Date(s.submittedAt).toLocaleString("ko-KR"),
      mc ? mc.correct : "",
      mc ? mc.total   : "",
      gradesForScore.length > 0 ? writtenTotal    : "",
      gradesForScore.length > 0 ? writtenMaxTotal : "",
      (mc || gradesForScore.length > 0) ? totalScore : "",
      (mc || gradesForScore.length > 0) ? totalMax   : "",
      s.responses["_leave_count"]  ?? "",
      s.responses["_paste_count"]  ?? "",
      ...(() => {
        const timing = timingEntries(s.responses);
        if (timing.length === 0) return ["", ""];
        const minSecs = Math.min(...timing.map(([, t]) => t));
        const fastCount = timing.filter(([, t]) => t < 10).length;
        return [minSecs, fastCount];
      })(),
      s.verdict === "pass" ? "합격" : s.verdict === "fail" ? "불합격" : "",
      s.verdictNote ?? "",
    ];

    for (const k of writtenKeys) {
      const grade = gradeMap.get(`${s.id}:${k}`);
      cells.push(
        s.responses[k] ?? "",
        grade?.score  ?? "",
        grade?.maxScore ?? "",
        grade?.comment ?? "",
      );
    }
    for (const k of mcKeys) {
      cells.push(s.responses[k] ?? "");
    }
    cells.push(gradedBy);
    return cells;
  });

  // ── Build CSV string (UTF-8 BOM for Excel) ──
  const csvLines = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob(["﻿" + csvLines], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `comet-evaluation-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── helpers ───────────────────────────────────────────────────────────────────

/** responses에서 서술형 항목만 추출 (번호 오름차순) */
function writtenEntries(responses: Record<string, string>) {
  return Object.entries(responses)
    .filter(([key, val]) => /^\d{1,2}$/.test(key) && !HIDDEN_KEYS.has(key) && isWritten(val))
    .sort(([a], [b]) => Number(a) - Number(b));
}

/** responses에서 객관식 항목만 추출 */
function mcEntries(responses: Record<string, string>) {
  return Object.entries(responses)
    .filter(([key, val]) => /^\d{1,2}$/.test(key) && !HIDDEN_KEYS.has(key) && MC_VALUE_RE.test(val.trim()))
    .sort(([a], [b]) => Number(a) - Number(b));
}

/** responses에서 응답 시간 항목 추출: [qId, secondsSinceStart][] */
function timingEntries(responses: Record<string, string>): [string, number][] {
  return Object.entries(responses)
    .filter(([key]) => /^_t_\d{1,2}$/.test(key))
    .map(([key, val]): [string, number] => [key.slice(3), Number(val)])
    .sort(([a], [b]) => Number(a) - Number(b));
}

function formatSecs(s: number) {
  return s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`;
}

// ── AntiCheatBadge ─────────────────────────────────────────────────────────

function AntiCheatBadge({ label, value, warn }: { label: string; value: string; warn: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold ${
      warn
        ? "border-red-400/30 bg-red-500/10 text-red-300"
        : "border-white/10 bg-white/[0.04] text-white/40"
    }`}>
      {label}: {value}
    </span>
  );
}

// ── GradingRow ─────────────────────────────────────────────────────────────

function GradingRow({
  scoreId,
  questionKey,
  answerText,
  existing,
}: {
  scoreId: string;
  questionKey: string;
  answerText: string;
  existing: WrittenGrade | null;
}) {
  const [score, setScore] = useState(existing?.score ?? 0);
  const [maxScore, setMaxScore] = useState(existing?.maxScore ?? 10);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [editing, setEditing] = useState(!existing);
  const [localGrade, setLocalGrade] = useState<WrittenGrade | null>(existing);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    if (score < 0 || score > maxScore) {
      setError(`점수는 0–${maxScore} 사이여야 합니다.`);
      return;
    }
    startTransition(async () => {
      const result = await gradeWrittenAnswer({
        evaluationScoreId: scoreId,
        questionKey,
        score,
        maxScore,
        comment,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setLocalGrade({
        id: "",
        evaluationScoreId: scoreId,
        questionKey,
        score,
        maxScore,
        comment,
        gradedBy: "",
        gradedAt: new Date().toISOString(),
      });
      setEditing(false);
    });
  }

  const scorePct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const barColor = scorePct >= 70 ? "bg-emerald-400" : scorePct >= 40 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {/* Answer text */}
      <div className="px-4 py-3">
        <p className="mb-0.5 text-[10px] font-bold tracking-widest text-white/30">{questionKey}번 답안</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80 break-words">
          {answerText || <span className="italic text-white/25">미입력</span>}
        </p>
      </div>

      {/* Grade section */}
      <div className="border-t border-white/[0.06] bg-white/[0.015] px-4 py-3">
        {localGrade && !editing ? (
          // ── Graded view ──
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-black tabular-nums ${
                scorePct >= 70 ? "text-emerald-300" : scorePct >= 40 ? "text-amber-300" : "text-red-300"
              }`}>
                {localGrade.score}
              </span>
              <span className="text-sm text-white/40">/ {localGrade.maxScore}점</span>
            </div>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${scorePct}%` }}
              />
            </div>
            {localGrade.comment && (
              <span className="flex-1 text-xs text-white/50 italic">&ldquo;{localGrade.comment}&rdquo;</span>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="ml-auto text-[10px] font-semibold text-white/30 underline hover:text-white/60"
            >
              수정
            </button>
          </div>
        ) : (
          // ── Edit / grade form ──
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
                점수
                <input
                  type="number"
                  value={score}
                  min={0}
                  max={maxScore}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-16 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-sm font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </label>
              <span className="text-white/30">/</span>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
                만점
                <input
                  type="number"
                  value={maxScore}
                  min={1}
                  max={100}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-16 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </label>
              <span className="text-xs text-white/30">점</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="채점 코멘트 (선택 사항)"
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-200 disabled:opacity-50"
              >
                {isPending ? "저장 중..." : "채점 저장"}
              </button>
              {localGrade && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setScore(localGrade.score); setComment(localGrade.comment); }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/50 hover:text-white"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── VerdictRow ─────────────────────────────────────────────────────────────

function VerdictRow({
  scoreId,
  existing,
}: {
  scoreId: string;
  existing: { verdict: EvaluationVerdict | null; note: string | null };
}) {
  const [verdict, setVerdict] = useState<EvaluationVerdict | null>(existing.verdict);
  const [note, setNote] = useState(existing.note ?? "");
  const [saved, setSaved] = useState<EvaluationVerdict | null>(existing.verdict);
  const [editing, setEditing] = useState(existing.verdict === null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveEvaluationVerdict({
        evaluationScoreId: scoreId,
        verdict,
        note,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(verdict);
      setEditing(false);
    });
  }

  const VERDICT_LABELS: Record<EvaluationVerdict, string> = {
    pass: "합격",
    fail: "불합격",
  };

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3">
        <p className="mb-3 text-[10px] font-bold tracking-widest text-white/30">합불 결정</p>

        {saved && !editing ? (
          // ── Decided state ──
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-sm font-black tracking-wide ${
                saved === "pass"
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                  : "border-red-400/40 bg-red-500/15 text-red-300"
              }`}
            >
              {saved === "pass" ? "✓ 합격" : "✗ 불합격"}
            </span>
            {note && <span className="flex-1 text-xs italic text-white/40">&ldquo;{note}&rdquo;</span>}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="ml-auto text-[10px] font-semibold text-white/30 underline hover:text-white/60"
            >
              변경
            </button>
          </div>
        ) : (
          // ── Edit state ──
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["pass", "fail"] as EvaluationVerdict[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVerdict(v)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-bold transition ${
                    verdict === v
                      ? v === "pass"
                        ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                        : "border-red-400/50 bg-red-500/20 text-red-200"
                      : "border-white/10 bg-white/[0.04] text-white/40 hover:text-white/70"
                  }`}
                >
                  {v === "pass" ? "✓ 합격" : "✗ 불합격"}
                </button>
              ))}
              {saved && (
                <button
                  type="button"
                  onClick={() => setVerdict(null)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${
                    verdict === null
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 text-white/30 hover:text-white/50"
                  }`}
                  title="결정 취소"
                >
                  미결정
                </button>
              )}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="결정 사유 (선택, 최대 500자)"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || (!verdict && saved === null)}
                className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-200 disabled:opacity-50"
              >
                {isPending ? "저장 중..." : verdict ? `${VERDICT_LABELS[verdict]} 확정` : "결정 취소"}
              </button>
              {saved && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setVerdict(saved); setNote(existing.note ?? ""); }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/50 hover:text-white"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ScoreCard ──────────────────────────────────────────────────────────────

function ScoreCard({
  score,
  gradesForScore,
}: {
  score: EvaluationScore;
  gradesForScore: WrittenGrade[];
}) {
  const [open, setOpen] = useState(false);

  const leaveCount = score.responses["_leave_count"];
  const pasteCount = score.responses["_paste_count"];
  const hasAntiCheat = leaveCount !== undefined || pasteCount !== undefined;

  const written = writtenEntries(score.responses);
  const mc = mcEntries(score.responses);
  const timing = timingEntries(score.responses);
  const fastAnswers = timing.filter(([, s]) => s < 10);

  // Total written score
  const totalGraded = gradesForScore.reduce((sum, g) => sum + g.score, 0);
  const totalMax = gradesForScore.reduce((sum, g) => sum + g.maxScore, 0);
  const gradedCount = gradesForScore.length;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* ── Collapsed header ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.03] transition"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-white">
            {score.applicantName || score.memberName}
          </span>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-indigo-300">
            {score.documentTitle}
          </span>
          <span className="text-xs text-[#86868b]">{score.evaluationDate}</span>
          {hasAntiCheat && (
            <span className="flex items-center gap-1.5">
              {leaveCount !== undefined && (
                <AntiCheatBadge label="이탈" value={`${leaveCount}회`} warn={Number(leaveCount) > 0} />
              )}
              {pasteCount !== undefined && (
                <AntiCheatBadge label="붙여넣기" value={`${pasteCount}회`} warn={Number(pasteCount) > 0} />
              )}
            </span>
          )}
          {fastAnswers.length > 0 && (
            <AntiCheatBadge label="⚡빠른응답" value={`${fastAnswers.length}건`} warn={true} />
          )}
          {/* Verdict badge */}
          {score.verdict && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wide ${
                score.verdict === "pass"
                  ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                  : "border-red-400/35 bg-red-500/10 text-red-300"
              }`}
            >
              {score.verdict === "pass" ? "✓ 합격" : "✗ 불합격"}
            </span>
          )}
          {!score.verdict && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold text-white/25">
              미결정
            </span>
          )}
          {/* Grading progress badge */}
          {written.length > 0 && (
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
              gradedCount === written.length
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : gradedCount > 0
                ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/[0.04] text-white/35"
            }`}>
              서술형 {gradedCount}/{written.length}채점
              {gradedCount === written.length && totalMax > 0 && ` · ${totalGraded}/${totalMax}점`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:block text-[10px] text-white/30">
            제출 {new Date(score.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-white/40 text-sm">{open ? "↑" : "↓"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-5 space-y-6">

          {/* ── 합불 결정 ── */}
          <VerdictRow
            scoreId={score.id}
            existing={{ verdict: score.verdict ?? null, note: score.verdictNote ?? null }}
          />

          {/* ── 감독 기록 ── */}
          {hasAntiCheat && (
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-widest text-red-400/70">감독 기록</p>
              <div className="flex flex-wrap gap-3">
                {leaveCount !== undefined && (
                  <div className={`flex-1 min-w-[120px] rounded-lg border px-4 py-3 ${
                    Number(leaveCount) > 0 ? "border-red-400/30 bg-red-500/[0.07]" : "border-white/[0.07] bg-white/[0.02]"
                  }`}>
                    <p className="text-[10px] font-semibold text-white/40">탭 이탈 횟수</p>
                    <p className={`mt-1 text-2xl font-black ${Number(leaveCount) > 0 ? "text-red-300" : "text-white/30"}`}>
                      {leaveCount}<span className="ml-1 text-sm font-semibold">회</span>
                    </p>
                  </div>
                )}
                {pasteCount !== undefined && (
                  <div className={`flex-1 min-w-[120px] rounded-lg border px-4 py-3 ${
                    Number(pasteCount) > 0 ? "border-amber-400/30 bg-amber-500/[0.07]" : "border-white/[0.07] bg-white/[0.02]"
                  }`}>
                    <p className="text-[10px] font-semibold text-white/40">서술형 붙여넣기</p>
                    <p className={`mt-1 text-2xl font-black ${Number(pasteCount) > 0 ? "text-amber-300" : "text-white/30"}`}>
                      {pasteCount}<span className="ml-1 text-sm font-semibold">회</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 응답 시간 패턴 ── */}
          {timing.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-widest text-violet-400/70">응답 시간 패턴</p>
              <div className="flex flex-wrap gap-2">
                {timing.map(([qId, secs]) => {
                  const fast = secs < 10;
                  const borderline = secs >= 10 && secs < 20;
                  return (
                    <div
                      key={qId}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
                        fast
                          ? "border-red-400/30 bg-red-500/[0.07]"
                          : borderline
                          ? "border-amber-400/25 bg-amber-500/[0.05]"
                          : "border-white/[0.06] bg-white/[0.02]"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white/40">{qId}번</span>
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          fast ? "text-red-300" : borderline ? "text-amber-300" : "text-white/55"
                        }`}
                      >
                        {formatSecs(secs)}
                      </span>
                      {fast && <span className="text-[9px] text-red-400/60">⚠</span>}
                    </div>
                  );
                })}
              </div>
              {fastAnswers.length > 0 && (
                <p className="mt-2 text-[10px] leading-relaxed text-red-400/60">
                  ⚠ {fastAnswers.length}개 문항이 10초 미만에 응답됐습니다 — 사전에 답을 알고 있을 가능성이 있습니다.
                </p>
              )}
            </div>
          )}

          {/* ── 객관식 답안 ── */}
          {mc.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-widest text-indigo-300/80">객관식 답안</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {mc.map(([key, value]) => (
                  <div key={key} className="flex gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <span className="text-xs font-bold text-white/40">{key}번</span>
                    <span className="text-sm font-bold text-indigo-300">{value}번</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 서술형 채점 ── */}
          {written.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold tracking-widest text-amber-300/80">
                  서술형 채점 ({gradedCount}/{written.length}완료)
                </p>
                {gradedCount === written.length && totalMax > 0 && (
                  <span className="text-xs font-bold text-emerald-300">
                    합계 {totalGraded} / {totalMax}점
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {written.map(([key, value]) => {
                  const existing = gradesForScore.find((g) => g.questionKey === key) ?? null;
                  return (
                    <GradingRow
                      key={key}
                      scoreId={score.id}
                      questionKey={key}
                      answerText={value}
                      existing={existing}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────

export default function EvaluationScoresPanel({
  scores,
  writtenGrades,
}: {
  scores: EvaluationScore[];
  writtenGrades: WrittenGrade[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const members = Array.from(new Set(scores.map((s) => s.memberName)));

  const filtered = filter === "all" ? scores : scores.filter((s) => s.memberName === filter);

  // Index grades by scoreId for O(1) lookup
  const gradesByScore = new Map<string, WrittenGrade[]>();
  for (const g of writtenGrades) {
    const arr = gradesByScore.get(g.evaluationScoreId) ?? [];
    arr.push(g);
    gradesByScore.set(g.evaluationScoreId, arr);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">평가 답안 기록</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
            평가 회원이 제출한 답안을 열람하고 서술형을 채점합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-semibold text-indigo-200/80">총 {scores.length}건</span>
          {scores.length > 0 && (
            <button
              type="button"
              onClick={() => exportEvaluationCsv(scores, writtenGrades)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/40"
            >
              ↓ CSV 내보내기
            </button>
          )}
        </div>
      </div>

      {/* 멤버 필터 */}
      {members.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === "all"
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-white/15 text-white/50 hover:text-white"
            }`}
          >
            전체
          </button>
          {members.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                filter === m
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-white/15 text-white/50 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
          <p className="text-sm text-white/30">
            {scores.length === 0 ? "아직 제출된 답안이 없습니다." : "선택한 회원의 제출 기록이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((score) => (
            <ScoreCard
              key={`${score.memberId}-${score.documentId}`}
              score={score}
              gradesForScore={gradesByScore.get(score.id) ?? []}
            />
          ))}
        </div>
      )}
    </section>
  );
}
