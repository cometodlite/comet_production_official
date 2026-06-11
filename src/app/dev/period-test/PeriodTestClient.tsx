"use client";

/**
 * 개발용 — 평가 기간 시뮬레이터
 * /dev/period-test?day=24 로 접근
 */

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getEvaluationPeriod,
  getNextPeriodChangeTime,
  DEFAULT_SCHEDULE,
  EXAM_START_HOUR_KST,
} from "@/lib/evaluation-schedule";

const DAYS_LABEL: Record<string, string> = {
  registration: "📋 등록 기간",
  "real-exam":  "📝 실전 기간",
  practice:     "🏃 연습 기간",
};

const DAYS_COLOR: Record<string, string> = {
  registration: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  "real-exam":  "border-indigo-400/40 bg-indigo-500/15 text-indigo-200",
  practice:     "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return d > 0
    ? `${d}일 ${pad(h)}:${pad(m)}:${pad(sec)}`
    : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export default function PeriodTestClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dayParam = Number(searchParams.get("day") ?? 24);
  const hourParam = Number(searchParams.get("hour") ?? 12);
  const [simDay, setSimDay] = useState(dayParam);
  const [simHour, setSimHour] = useState(hourParam);

  // 이번 달 simDay·simHour 기준 KST timestamp
  // KST시각 h = UTC h - 9  →  UTC hour = KST hour - 9 (mod 24)
  function mockNow(day: number, hour: number = simHour): number {
    const real = new Date();
    const utcHour = ((hour - 9) + 24) % 24;
    // 자정 넘김(KST 0~8 → UTC 15~23 전날)은 day-1 처리
    const utcDay = hour < 9 ? day - 1 : day;
    return Date.UTC(real.getFullYear(), real.getMonth(), utcDay, utcHour, 0, 0, 0);
  }

  const now = mockNow(simDay);
  const period = getEvaluationPeriod(DEFAULT_SCHEDULE, now);
  const { endsAt, label } = getNextPeriodChangeTime(DEFAULT_SCHEDULE, now);
  const remaining = endsAt - now;

  // 날짜/시각 변경 시 URL 동기화
  useEffect(() => {
    router.replace(`/dev/period-test?day=${simDay}&hour=${simHour}`, { scroll: false });
  }, [simDay, simHour, router]);

  // 월별 날짜 배열
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-8">

        {/* 헤더 */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.3em] text-red-400/70 mb-2">
            ⚠ DEV ONLY — 평가 기간 시뮬레이터
          </p>
          <h1 className="text-3xl font-black">Period Test</h1>
          <p className="mt-1 text-sm text-white/40">
            날짜를 바꿔가며 평가 기간 로직과 카운트다운을 확인합니다.
          </p>
        </div>

        {/* 날짜 + 시각 선택 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <p className="text-xs font-bold tracking-widest text-white/40">시뮬레이션 날짜 (이번 달)</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              // 날짜 그리드 도트는 현재 선택된 simHour 기준으로 계산
              const p = getEvaluationPeriod(DEFAULT_SCHEDULE, mockNow(d, simHour));
              const dot = p === "registration" ? "bg-amber-400" : p === "real-exam" ? "bg-indigo-400" : "bg-emerald-400";
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSimDay(d)}
                  className={`relative rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    d === simDay
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {d}
                  <span className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${dot}`} />
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 text-[10px] text-white/30">
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mr-1" />등록·대기</span>
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 mr-1" />실전 오픈</span>
            <span><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />연습</span>
          </div>

          {/* 시각 선택 */}
          <div>
            <p className="mb-2 text-xs font-bold tracking-widest text-white/40">
              시뮬레이션 시각 (KST) — 실전일은 {EXAM_START_HOUR_KST}:00 기준 오픈
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[0, 6, 10, 11, 12, 13, 18, 23].map((h) => {
                const isExamBoundary = h === EXAM_START_HOUR_KST;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSimHour(h)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      h === simHour
                        ? "border-white bg-white text-black"
                        : isExamBoundary
                        ? "border-indigo-400/40 text-indigo-300/80 hover:border-indigo-400 hover:text-indigo-200"
                        : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {pad(h)}:00{isExamBoundary && " ★"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 결과 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <p className="text-xs font-bold tracking-widest text-white/40">계산 결과</p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl font-black">{simDay}일</span>
            <span className="text-2xl font-mono text-white/40">{pad(simHour)}:00</span>
            <span className={`rounded-full border px-3 py-1 text-sm font-bold ${DAYS_COLOR[period]}`}>
              {DAYS_LABEL[period]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-white/30 mb-1">다음 기간까지</p>
              <p className="font-mono font-bold text-lg">{formatCountdown(remaining)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-white/30 mb-1">카운트다운 레이블</p>
              <p className="font-semibold text-white/80">{label}</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs font-mono text-white/40 space-y-1">
            <p>period   = <span className="text-indigo-300">{period}</span></p>
            <p>endsAt   = <span className="text-white/60">{new Date(endsAt).toLocaleString("ko-KR")}</span></p>
            <p>mockNow  = <span className="text-white/60">{new Date(now).toLocaleString("ko-KR")}</span></p>
            <p>remaining = <span className="text-white/60">{Math.floor(remaining / 3600000)}h {Math.floor((remaining % 3600000) / 60000)}m</span></p>
          </div>
        </div>

        {/* 실제 화면 미리보기 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-4 text-xs font-bold tracking-widest text-white/40">실제 화면 동작</p>
          <div className="space-y-2 text-sm">
            <Row
              label="/evaluation 접근 시"
              value={
                period === "practice"
                  ? "✅ 연습 평가 워크스페이스 표시"
                  : "↩ /evaluation/real 로 redirect"
              }
              ok={period === "practice"}
            />
            <Row
              label="/evaluation/real 접근 시"
              value={
                period === "practice"
                  ? "↩ /evaluation 로 redirect"
                  : period === "registration"
                  ? "⏳ 등록 기간 안내 + 카운트다운 표시"
                  : "✅ 실전 시험 워크스페이스 표시"
              }
              ok={period !== "practice"}
            />
            <Row
              label="PeriodCountdownBanner"
              value={`"${label}" · ${formatCountdown(remaining)}`}
              ok
            />
          </div>
        </div>

        {/* 일정 설정 */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-xs text-white/30">
          <p className="font-bold tracking-widest mb-2">현재 적용된 DEFAULT_SCHEDULE</p>
          <p>등록일: {DEFAULT_SCHEDULE.registrationDays.join(", ")}일</p>
          <p>실전일: {DEFAULT_SCHEDULE.realExamDays.join(", ")}일</p>
          <p className="mt-2 text-white/20">※ DB에 설정된 일정이 있으면 실제 서비스는 DB 값을 우선합니다.</p>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="min-w-0 flex-1 text-white/40">{label}</span>
      <span className={`flex-shrink-0 font-semibold ${ok ? "text-emerald-300" : "text-amber-300"}`}>
        {value}
      </span>
    </div>
  );
}
