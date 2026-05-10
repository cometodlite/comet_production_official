import Link from "next/link";
import type { PublicUser } from "@/lib/auth/store";
import type { StaffGroup } from "@/lib/auth/staff-groups";
import { getStaffGroupLabel } from "@/lib/auth/staff-groups";

type StaffAreaShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  group: StaffGroup;
  user: PublicUser;
  items: string[];
  children?: React.ReactNode;
};

export default function StaffAreaShell({ eyebrow, title, description, group, user, items, children }: StaffAreaShellProps) {
  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-4xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">{eyebrow}</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#86868b]">{description}</p>

        <dl className="mb-8 divide-y divide-white/10 rounded-lg border border-white/10">
          <InfoRow label="접속 계정" value={user.email} />
          <InfoRow label="허용 소속" value={getStaffGroupLabel(group)} />
          <InfoRow label="현재 소속" value={getStaffGroupLabel(user.staffGroup)} />
        </dl>

        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-5">
              <p className="text-sm font-semibold text-white">{item}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#86868b]">준비 중</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/staff"
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            사원 페이지
          </Link>
          <Link
            href="/staff/settings"
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            설정
          </Link>
          {children}
        </div>
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
