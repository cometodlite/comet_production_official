import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회사 소개 | COMET PRODUCTION",
  description: "KE NETWORK 산하 COMET PRODUCTION의 설립 배경과 비전, 자회사 구조를 소개합니다.",
  openGraph: {
    title: "회사 소개 | COMET PRODUCTION",
    description: "KE NETWORK 산하 COMET PRODUCTION의 설립 배경과 비전을 소개합니다.",
    images: ["/logo-ke-comet.jpg"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
