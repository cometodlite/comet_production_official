import type { Metadata } from "next";
import { getVerdictByApplicantName } from "@/lib/auth/store";
import ResultsLookup from "@/components/ResultsLookup";

export const metadata: Metadata = {
  title: "합격 여부 조회 | COMET",
  description: "응시자 이름을 입력해 COMET 역량평가 결과를 확인하세요.",
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const trimmed = name?.trim() ?? "";

  const results = trimmed ? await getVerdictByApplicantName(trimmed) : null;

  return <ResultsLookup initialName={trimmed} results={results} />;
}
