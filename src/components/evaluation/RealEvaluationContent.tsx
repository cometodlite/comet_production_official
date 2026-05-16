"use client";

import { useLang } from "@/context/LanguageContext";

export default function RealEvaluationContent() {
  const { t } = useLang();

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl items-center px-6 py-20">
      <section className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-12 text-center backdrop-blur-xl">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">
          COMET EVALUATION
        </p>

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
          <span className="text-2xl text-white/20">✦</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">
          {t("실전 역량평가", "Real Evaluation")}
        </h1>

        <div className="mx-auto my-6 h-px w-12 bg-white/10" />

        <p className="text-sm leading-relaxed text-[#86868b]">
          {t("현재 실전 문제가 준비되어 있지 않습니다.", "Real exam questions are not yet available.")}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[#86868b]/50">
          {t("실전 평가는 별도 안내 후 진행됩니다.", "The real evaluation will be held after separate notice.")}
        </p>
      </section>
    </div>
  );
}
