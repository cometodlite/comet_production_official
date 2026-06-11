import type { Metadata } from "next";
import Link from "next/link";
import BoardAdminPanel from "@/components/staff/BoardAdminPanel";
import EvaluationScoresPanel from "@/components/staff/EvaluationScoresPanel";
import EvaluationDashboard from "@/components/staff/EvaluationDashboard";
import { requireStaffGroup } from "@/lib/auth/current-user";
import {
  listBoardNotices, listEvaluationScores, listStaffUsers, listAllWrittenGrades,
  getExamScheduleConfig, listEvaluationTracks, getExamConfig, listExamQuestionSets,
} from "@/lib/auth/store";
import ScheduleAdminPanel from "@/components/staff/ScheduleAdminPanel";

export const metadata: Metadata = {
  title: "COMET 이사회 공간",
};

export default async function StaffBoardPage() {
  const user = await requireStaffGroup("board");
  const [staffUsers, notices, scores, writtenGrades, globalSchedule, tracks, sets] = await Promise.all([
    listStaffUsers(),
    listBoardNotices(),
    listEvaluationScores(),
    listAllWrittenGrades(),
    getExamScheduleConfig(),
    listEvaluationTracks(),
    listExamQuestionSets(),
  ]);

  // 트랙별 활성 세트 ID 조회
  const trackSetIds: Record<string, string | null> = {};
  await Promise.all(
    tracks.map(async (track) => {
      trackSetIds[track] = await getExamConfig(`active_exam_set_id:${track}`);
    }),
  );

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
          <InfoCard label="운영 기능" value="5개 활성화" />
        </dl>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/staff/board/questions"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-900/20 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-900/40"
          >
            <span>📝</span>
            실전 문제 등록 관리
          </Link>
        </div>

        <BoardAdminPanel staffUsers={staffUsers} notices={notices} />
        <ScheduleAdminPanel
          globalSchedule={globalSchedule}
          tracks={tracks}
          trackSetIds={trackSetIds}
          sets={sets}
        />
        <div className="mt-5 space-y-5">
          <EvaluationDashboard scores={scores} />
          <EvaluationScoresPanel scores={scores} writtenGrades={writtenGrades} />
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
