import type { Metadata } from "next";
import BoardAdminPanel from "@/components/staff/BoardAdminPanel";
import EvaluationScoresPanel from "@/components/staff/EvaluationScoresPanel";
import { requireStaffGroup } from "@/lib/auth/current-user";
import { listBoardNotices, listEvaluationScores, listStaffUsers } from "@/lib/auth/store";

export const metadata: Metadata = {
  title: "COMET 이사회 공간",
};

export default async function StaffBoardPage() {
  const user = await requireStaffGroup("board");
  const [staffUsers, notices, scores] = await Promise.all([
    listStaffUsers(),
    listBoardNotices(),
    listEvaluationScores(),
  ]);

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-5xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET BOARD</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">COMET 이사회 공간</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          권한 관리, 계정 초기화, 이사회 공지를 처리하는 내부 운영 공간입니다.
        </p>

        <dl className="grid gap-3 sm:grid-cols-3">
          <InfoCard label="접속 계정" value={user.email} />
          <InfoCard label="권한" value="COMET 이사회" />
          <InfoCard label="운영 기능" value="4개 활성화" />
        </dl>

        <BoardAdminPanel staffUsers={staffUsers} notices={notices} />
        <div className="mt-5">
          <EvaluationScoresPanel scores={scores} />
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-xs font-semibold text-[#86868b]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
