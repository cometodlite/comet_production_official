import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COMET ENTERTAINERS",
  description: "엔터테인먼트·아티스트 관리·지원을 목표로 하는 COMET PRODUCTION 산하 자회사. _Talent. Care. Knowledge. Connection",
  openGraph: {
    title: "COMET ENTERTAINERS",
    description: "_Talent. Care. Knowledge. Connection — Ingenium atque labor lux veritatis",
    images: ["/logo-entertainers.jpg"],
  },
};

export default function EntertainersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
