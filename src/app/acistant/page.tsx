import type { Metadata, Viewport } from "next";
import AcistantApp from "./AcistantApp";

export const viewport: Viewport = {
  themeColor: "#0D1631",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "ACistant — COMET 코딩 어시스턴트",
  description:
    "COMET PRODUCTION의 코딩 전용 AI 어시스턴트. 코드 작성·디버깅·리뷰를 대화로 돕습니다.",
  manifest: "/acistant.webmanifest",
  icons: {
    icon: [
      { url: "/acistant-favicon.ico", sizes: "any" },
      { url: "/acistant-icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/acistant-icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/acistant-icon-192.png", type: "image/png", sizes: "192x192" }],
  },
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
