import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COMET DEVELOPS",
  description: "게임 개발·관리·배급을 목표로 하는 COMET PRODUCTION 산하 자회사.",
  openGraph: {
    title: "COMET DEVELOPS",
    description: "게임 개발·관리 및 배급·KE 그룹 추가 지원을 담당하는 COMET PRODUCTION 자회사.",
    images: ["/logo-ke-comet.jpg"],
  },
};

export default function DevelopsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
