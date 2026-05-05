import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의 | COMET PRODUCTION",
  description: "COMET PRODUCTION 및 산하 브랜드에 대한 문의를 남겨주세요.",
  openGraph: {
    title: "문의 | COMET PRODUCTION",
    description: "COMET PRODUCTION, COMET ENTERTAINERS, COMET DEVELOPS에 대한 문의.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
