import type { Metadata } from "next";
import { logout } from "@/app/actions/auth";
import { requireStaffUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "사원 페이지",
};

export default async function StaffPage() {
  const user = await requireStaffUser();
  const joinedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-4xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">사원 페이지</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          내부 구성원 전용 공간입니다. 추후 공지, 업무 자료, 지원자 관리 기능을 이곳에 연결할 수 있습니다.
        </p>

        <dl className="divide-y divide-white/10 rounded-lg border border-white/10">
          <InfoRow label="이름" value={user.name} />
          <InfoRow label="이메일" value={user.email} />
          <InfoRow label="계정 구분" value="사원" />
          <InfoRow label="가입일" value={joinedAt} />
        </dl>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["공지", "업무 자료", "관리 도구"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-5">
              <p className="text-sm font-semibold text-white">{item}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#86868b]">준비 중</p>
            </div>
          ))}
        </div>

        <form action={logout} className="mt-8">
          <button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white">
            로그아웃
          </button>
        </form>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 px-4 py-4 sm:grid-cols-[120px_1fr]">
      <dt className="text-sm text-[#86868b]">{label}</dt>
      <dd className="break-words text-sm font-medium text-white">{value}</dd>
    </div>
  );
}
