import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "채용",
  description: "COMET PRODUCTION과 함께할 인재를 모집합니다.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
