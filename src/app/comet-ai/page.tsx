import type { Metadata } from "next";
import CometAiPageClient from "./CometAiPageClient";

export const metadata: Metadata = {
  title: "COMET AI",
  description: "학습을 돕는 Stutant와 일상을 돕는 DAILIA — 하나의 서비스, COMET AI.",
};

// Stutant's release string is "stutant:dailia:astera" — ASTERA is a
// staff-only internal tool and intentionally not shown on this public page.
const FALLBACK_STUTANT = "Beta 2.12";
const FALLBACK_DAILIA = "Beta 1.1";

async function getVersionLabels() {
  try {
    const res = await fetch("https://stutant.kenet.co.kr/api/app-version", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("bad status");
    const data = (await res.json()) as { release?: unknown };
    const parts = typeof data.release === "string" ? data.release.split(":") : [];
    const [stutant, dailia] = parts;
    return {
      stutantVersionLabel: stutant ? `Beta ${stutant}` : FALLBACK_STUTANT,
      dailiaVersionLabel: dailia ? `Beta ${dailia}` : FALLBACK_DAILIA,
    };
  } catch {
    return { stutantVersionLabel: FALLBACK_STUTANT, dailiaVersionLabel: FALLBACK_DAILIA };
  }
}

export default async function CometAiPage() {
  const { stutantVersionLabel, dailiaVersionLabel } = await getVersionLabels();
  return <CometAiPageClient stutantVersionLabel={stutantVersionLabel} dailiaVersionLabel={dailiaVersionLabel} />;
}
