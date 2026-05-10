import type { Metadata } from "next";
import StaffAreaShell from "@/components/staff/StaffAreaShell";
import { requireStaffGroup } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "ENTERTAINERS 사원 공간",
};

export default async function StaffEntertainersPage() {
  const user = await requireStaffGroup("entertainers");

  return (
    <StaffAreaShell
      eyebrow="COMET ENTERTAINERS"
      title="ENTERTAINERS 사원 공간"
      description="COMET ENTERTAINERS 소속 구성원만 접근할 수 있는 내부 공간입니다."
      group="entertainers"
      user={user}
      items={["아티스트 관리", "방송 자료", "엔터테인먼트 공지"]}
    />
  );
}
