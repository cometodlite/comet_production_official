import type { Metadata } from "next";
import { logout } from "@/app/actions/auth";
import { requireCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "내 계정",
};

export default async function AccountPage() {
  const user = await requireCurrentUser();
  const joinedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-3xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-amber-400/80">COMET ACCOUNT</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">내 계정</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">
          로그인된 계정 정보입니다. 추후 멤버십, 지원 현황, 프로젝트 참여 기능을 이 공간에 연결할 수 있습니다.
        </p>

        <dl className="divide-y divide-white/10 rounded-lg border border-white/10">
          <InfoRow label="이름" value={user.name} />
          <InfoRow label="이메일" value={user.email} />
          <InfoRow label="가입일" value={joinedAt} />
        </dl>

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
