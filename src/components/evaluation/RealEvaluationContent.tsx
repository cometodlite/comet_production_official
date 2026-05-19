"use client";

import { useLang } from "@/context/LanguageContext";
import type { EvaluationPeriod } from "@/lib/evaluation-schedule";

export default function RealEvaluationContent({ period }: { period: EvaluationPeriod }) {
  const { t } = useLang();

  const isRegistration = period === "registration";

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl items-center px-4 py-10 lg:px-6 lg:py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-10 text-center backdrop-blur-xl lg:p-12">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">
          COMET EVALUATION
        </p>

        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border bg-white/[0.03] ${
          isRegistration ? "border-amber-500/20" : "border-white/[0.08]"
        }`}>
          <span className="text-2xl">
            {isRegistration ? <span className="text-amber-400/40">⏳</span> : <span className="text-white/20">✦</span>}
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">
          {t("실전 역량평가", "Real Evaluation")}
        </h1>

        <div className="mx-auto my-6 h-px w-12 bg-white/10" />

        {isRegistration ? (
          <>
            <p className="text-sm font-semibold leading-relaxed text-amber-200/80">
              {t("실전 문제 등록 기간입니다.", "Real exam registration period.")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#86868b]">
              {t(
                "오늘은 실전 문제 등록 기간으로, 문제가 등록되어 있더라도 내일(확인 기간)까지 공개되지 않습니다.",
                "Today is the registration period. Even if questions have been registered, they will not be visible until tomorrow (exam day).",
              )}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#86868b]/50">
              {t("내일 다시 접속해 주세요.", "Please return tomorrow.")}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-[#86868b]">
              {t("현재 실전 문제가 준비되어 있지 않습니다.", "Real exam questions are not yet available.")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b]/50">
              {t("실전 평가는 별도 안내 후 진행됩니다.", "The real evaluation will be held after separate notice.")}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
