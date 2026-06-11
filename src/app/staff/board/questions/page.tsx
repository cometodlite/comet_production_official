import type { Metadata } from "next";
import Link from "next/link";
import { requireStaffGroup } from "@/lib/auth/current-user";
import { listExamQuestionSets } from "@/lib/auth/store";
import ExamQuestionManager from "@/components/staff/ExamQuestionManager";

export const metadata: Metadata = {
  title: "문제 등록 관리 — COMET 이사회",
};

export default async function ExamQuestionsPage() {
  await requireStaffGroup("board");

  const sets = await listExamQuestionSets();

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-5xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">
              COMET BOARD
            </p>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-white">
              실전 문제 등록 관리
            </h1>
            <p className="text-sm leading-relaxed text-[#86868b]">
              문제 세트를 생성하고 관리합니다. 활성화된 세트가 실전 시험에 출제되며, 없으면 하드코딩 Set A를 사용합니다.
            </p>
          </div>
          <Link
            href="/staff/board"
            className="shrink-0 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            ← 이사회 공간
          </Link>
        </div>

        <ExamQuestionManager initialSets={sets} />
      </section>
    </div>
  );
}
