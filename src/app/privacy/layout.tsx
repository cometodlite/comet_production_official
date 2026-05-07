import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "COMET PRODUCTION 개인정보처리방침 — 개인정보 보호법 제30조 기준으로 작성된 개인정보 처리 안내입니다.",
  openGraph: {
    title: "개인정보처리방침 | COMET PRODUCTION",
    description: "COMET PRODUCTION 개인정보처리방침 — 개인정보 보호법 제30조 기준",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
