import type { Metadata } from "next";
import Link from "next/link";
import StaffAreaShell from "@/components/staff/StaffAreaShell";
import { requireStaffGroup } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "COMET 이사회 공간",
};

export default async function StaffBoardPage() {
  const user = await requireStaffGroup("board");

  return (
    <StaffAreaShell
      eyebrow="COMET BOARD"
      title="COMET 이사회 공간"
      description="COMET 이사회 계정만 접근할 수 있는 내부 권한 공간입니다."
      group="board"
      user={user}
      items={["권한 관리", "계정 초기화", "이사회 공지"]}
    >
      <Link
        href="/staff/reset-code"
        className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200"
      >
        사원 코드 초기화
      </Link>
    </StaffAreaShell>
  );
}
