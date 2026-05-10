import type { Metadata } from "next";
import StaffAreaShell from "@/components/staff/StaffAreaShell";
import { requireStaffGroup } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "DEVELOPS 사원 공간",
};

export default async function StaffDevelopsPage() {
  const user = await requireStaffGroup("develops");

  return (
    <StaffAreaShell
      eyebrow="COMET DEVELOPS"
      title="DEVELOPS 사원 공간"
      description="COMET DEVELOPS 소속 구성원만 접근할 수 있는 내부 공간입니다."
      group="develops"
      user={user}
      items={["프로젝트 관리", "개발 자료", "DEVELOPS 공지"]}
    />
  );
}
