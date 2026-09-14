"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { triggerSecurityScan } from "@/app/actions/security";
import type { SecurityScanRun } from "@/lib/security/store";
import type { Severity } from "@/lib/security/checks";

const SEVERITY_STYLE: Record<Severity, { label: string; className: string }> = {
  critical: { label: "심각", className: "border-red-500/40 bg-red-500/10 text-red-300" },
  high: { label: "높음", className: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
  medium: { label: "중간", className: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  low: { label: "낮음", className: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  info: { label: "정상", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
};

const CATEGORY_LABEL: Record<string, string> = {
  tls: "SSL/TLS",
  headers: "보안 헤더",
  exposure: "민감 정보 노출",
  dns: "DNS/도메인",
};

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return new Date(iso).toLocaleString("ko-KR");
}

export default function SecurityScanPanel({ initialRun }: { initialRun: SecurityScanRun | null }) {
  const [run, setRun] = useState(initialRun);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    setError(null);
    startTransition(async () => {
      const result = await triggerSecurityScan();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setRun(result.run);
      router.refresh();
    });
  };

  const allFindings = run?.results.flatMap((r) => r.findings.map((f) => ({ ...f, target: r.targetLabel }))) ?? [];
  const severityCounts = SEVERITY_ORDER.reduce<Record<Severity, number>>(
    (acc, sev) => ({ ...acc, [sev]: allFindings.filter((f) => f.severity === sev).length }),
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#86868b]">
            {run ? (
              <>
                마지막 스캔: <span className="text-white">{formatRelativeTime(run.ranAt)}</span>
                {" · "}
                {run.trigger === "manual" ? "수동 실행" : "자동 실행 (매시간)"}
              </>
            ) : (
              "아직 스캔 기록이 없습니다."
            )}
          </p>
          {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className="rounded-lg border border-indigo-500/30 bg-indigo-900/20 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "스캔 중..." : "지금 다시 스캔"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {SEVERITY_ORDER.map((sev) => (
          <div key={sev} className={`rounded-lg border px-3 py-3 text-center ${SEVERITY_STYLE[sev].className}`}>
            <p className="text-2xl font-black">{severityCounts[sev]}</p>
            <p className="text-xs font-semibold">{SEVERITY_STYLE[sev].label}</p>
          </div>
        ))}
      </div>

      {run && (
        <div className="space-y-5">
          {run.results.map((result) => (
            <div key={result.targetId} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-3 text-base font-bold text-white">{result.targetLabel}</h3>
              {result.erroredAt ? (
                <p className="text-sm text-red-400">스캔 실패: {result.erroredAt}</p>
              ) : (
                <ul className="space-y-2">
                  {[...result.findings]
                    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
                    .map((finding, idx) => (
                      <li key={idx} className="flex flex-col gap-1 rounded-md border border-white/5 bg-black/20 p-3 sm:flex-row sm:items-start sm:gap-3">
                        <span
                          className={`inline-flex w-fit shrink-0 items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEVERITY_STYLE[finding.severity].className}`}
                        >
                          {SEVERITY_STYLE[finding.severity].label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            <span className="mr-2 text-[11px] font-normal text-[#86868b]">
                              [{CATEGORY_LABEL[finding.category] ?? finding.category}]
                            </span>
                            {finding.title}
                          </p>
                          <p className="mt-1 break-words text-xs leading-relaxed text-[#86868b]">{finding.detail}</p>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
