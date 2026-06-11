"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNextPeriodChangeTime } from "@/lib/evaluation-schedule";
import type { ExamScheduleConfig } from "@/lib/evaluation-schedule";

// ── helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function computeCountdown(endsAt: number) {
  const remaining   = Math.max(0, endsAt - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600)  / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

// ── types ────────────────────────────────────────────────────────────────────

/** compact — 헤더 안에 들어가는 한 줄짜리 타이머
 *  default  — 대기 화면 안에 들어가는 큰 타이머 블록  */
export type CountdownVariant = "default" | "compact";

// ── main component ────────────────────────────────────────────────────────────

export default function PeriodCountdownBanner({
  variant = "default",
  scheduleConfig,
}: {
  variant?: CountdownVariant;
  scheduleConfig?: ExamScheduleConfig;
}) {
  const router = useRouter();

  // endsAt / label 은 마운트 시 한 번 계산 — 이후 interval 내에서만 re-calc
  const [{ endsAt, label }] = useState(() => getNextPeriodChangeTime(scheduleConfig));
  const [cd, setCd] = useState(() => computeCountdown(endsAt));

  useEffect(() => {
    const tick = () => {
      const next = computeCountdown(endsAt);
      setCd(next);
      if (next.totalSeconds === 0) {
        // 기간이 바뀌었으면 페이지 새로고침으로 서버 redirect 트리거
        router.refresh();
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, router]);

  if (cd.totalSeconds === 0) return null;

  // ── compact variant ───────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-white/35 lg:text-xs">{label}</span>
        <span className="font-mono text-[10px] font-bold tabular-nums text-white/55 lg:text-xs">
          {cd.days > 0 && `${cd.days}일 `}
          {pad(cd.hours)}:{pad(cd.minutes)}:{pad(cd.seconds)}
        </span>
      </div>
    );
  }

  // ── default (prominent) variant ───────────────────────────────────────────
  return (
    <div className="my-6 rounded-lg border border-indigo-500/20 bg-indigo-950/30 px-5 py-6">
      <p className="mb-4 text-center text-[11px] font-semibold tracking-[0.22em] text-indigo-300/60">
        {label}
      </p>
      <div className="flex items-end justify-center gap-2 lg:gap-4">
        {cd.days > 0 && (
          <>
            <TimeUnit value={cd.days} unit="일" bright />
            <Colon />
          </>
        )}
        <TimeUnit value={cd.hours}   unit="시간" bright={cd.days === 0} />
        <Colon />
        <TimeUnit value={cd.minutes} unit="분"   bright={cd.days === 0} />
        <Colon />
        <TimeUnit value={cd.seconds} unit="초"   bright={cd.days === 0} urgent={cd.days === 0 && cd.hours === 0 && cd.minutes < 10} />
      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function TimeUnit({
  value,
  unit,
  bright = false,
  urgent = false,
}: {
  value: number;
  unit: string;
  bright?: boolean;
  urgent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`font-mono text-3xl font-black tabular-nums tracking-tight lg:text-4xl ${
          urgent
            ? "text-red-300"
            : bright
            ? "text-white"
            : "text-white/50"
        }`}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] font-semibold tracking-widest text-white/35">{unit}</span>
    </div>
  );
}

function Colon() {
  return (
    <span className="mb-5 font-mono text-xl font-black text-white/20 lg:text-2xl">:</span>
  );
}
