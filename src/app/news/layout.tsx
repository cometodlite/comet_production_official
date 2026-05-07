import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "뉴스",
  description: "COMET PRODUCTION, COMET ENTERTAINERS, COMET DEVELOPS의 최신 소식을 확인하세요.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
