import type { Metadata } from "next";
import StaffAreaShell from "@/components/staff/StaffAreaShell";
import { requireStaffGroup } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "COMET Dev. 사원 공간",
};

export default async function StaffCometDevPage() {
  const user = await requireStaffGroup("comet-dev");

  return (
    <StaffAreaShell
      eyebrow="COMET Dev."
      title="COMET Dev. 사원 공간"
      description="정규 부서는 아니지만, COMET 운영에 크게 기여한 분께 특별히 부여되는 사원 자격입니다."
      group="comet-dev"
      user={user}
      items={["감사의 기록", "COMET 소식"]}
    />
  );
}
