import type { Metadata } from "next";
import AcistantApp from "./AcistantApp";

export const metadata: Metadata = {
  title: "ACistant — COMET 코딩 어시스턴트",
  description:
    "COMET PRODUCTION의 코딩 전용 AI 어시스턴트. 코드 작성·디버깅·리뷰를 대화로 돕습니다.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "ACistant",
    description: "COMET PRODUCTION의 코딩 전용 AI 어시스턴트",
    type: "website",
  },
};

export default function AcistantPage() {
  return <AcistantApp />;
}
