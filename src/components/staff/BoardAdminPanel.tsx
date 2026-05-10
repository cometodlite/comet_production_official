"use client";

import { useActionState } from "react";
import { changeStaffGroup, publishBoardNotice, type AuthFormState } from "@/app/actions/auth";
import StaffCodeResetForm from "@/components/auth/StaffCodeResetForm";
import type { BoardNotice, PublicUser } from "@/lib/auth/store";
import { STAFF_GROUP_OPTIONS, getStaffGroupLabel } from "@/lib/auth/staff-groups";

const initialState: AuthFormState = {};

export default function BoardAdminPanel({ staffUsers, notices }: { staffUsers: PublicUser[]; notices: BoardNotice[] }) {
  const [permissionState, permissionAction, permissionPending] = useActionState(changeStaffGroup, initialState);
  const [noticeState, noticeAction, noticePending] = useActionState(publishBoardNotice, initialState);

  return (
    <div className="mt-8 space-y-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">권한 관리</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#86868b]">사원 이메일 기준으로 접근 가능한 소속 공간을 변경합니다.</p>
          </div>
          <p className="text-xs font-semibold text-indigo-200/80">등록 사원 {staffUsers.length}명</p>
        </div>

        <form action={permissionAction} className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <Field
            id="permission-email"
            label="사원 이메일"
            name="email"
            type="email"
            placeholder="staff@kenet.co.kr"
            errors={permissionState.errors?.email}
          />
          <SelectField
            id="targetStaffGroup"
            label="변경할 권한"
            name="targetStaffGroup"
            errors={permissionState.errors?.targetStaffGroup}
          >
            <option value="">권한 선택</option>
            {STAFF_GROUP_OPTIONS.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </SelectField>
          <button
            type="submit"
            disabled={permissionPending}
            className="self-end rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {permissionPending ? "변경 중..." : "권한 변경"}
          </button>
        </form>
        <ActionMessage state={permissionState} />

        <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
          <div className="grid grid-cols-[1.2fr_1.5fr_1fr] bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/70">
            <span>이름</span>
            <span>이메일</span>
            <span>소속</span>
          </div>
          {staffUsers.length ? (
            staffUsers.map((staff) => (
              <div key={staff.id} className="grid grid-cols-[1.2fr_1.5fr_1fr] gap-3 border-t border-white/10 px-4 py-3 text-sm">
                <span className="break-words text-white">{staff.name}</span>
                <span className="break-words text-[#86868b]">{staff.email}</span>
                <span className="text-white/85">{getStaffGroupLabel(staff.staffGroup)}</span>
              </div>
            ))
          ) : (
            <p className="border-t border-white/10 px-4 py-4 text-sm text-[#86868b]">등록된 사원 계정이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="text-lg font-bold tracking-tight text-white">계정 초기화</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#86868b]">사원 개인 코드를 소속별 초회 코드 상태로 되돌립니다.</p>
        <div className="mt-5">
          <StaffCodeResetForm />
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="text-lg font-bold tracking-tight text-white">이사회 공지</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#86868b]">이사회 전용 공지를 작성하고 최근 공지를 확인합니다.</p>

        <form action={noticeAction} className="mt-5 space-y-4">
          <Field
            id="noticeTitle"
            label="공지 제목"
            name="noticeTitle"
            placeholder="공지 제목"
            errors={noticeState.errors?.noticeTitle}
          />
          <TextAreaField
            id="noticeBody"
            label="공지 내용"
            name="noticeBody"
            placeholder="이사회 공지 내용을 입력하세요."
            errors={noticeState.errors?.noticeBody}
          />
          <button
            type="submit"
            disabled={noticePending}
            className="w-full rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {noticePending ? "게시 중..." : "공지 게시"}
          </button>
        </form>
        <ActionMessage state={noticeState} />

        <div className="mt-5 space-y-3">
          {notices.length ? (
            notices.map((notice) => (
              <article key={notice.id} className="rounded-lg border border-white/10 bg-black/25 px-4 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
                  <time className="text-xs text-[#86868b]">{formatDate(notice.createdAt)}</time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#c7c7cc]">{notice.body}</p>
                <p className="mt-3 text-xs text-[#86868b]">게시자 {notice.authorEmail}</p>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 px-4 py-4 text-sm text-[#86868b]">아직 등록된 이사회 공지가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ActionMessage({ state }: { state: AuthFormState }) {
  if (state.errors?.form) {
    return <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.errors.form[0]}</p>;
  }

  if (state.success) {
    return <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{state.success}</p>;
  }

  return null;
}

function Field({
  id,
  label,
  errors,
  type = "text",
  ...props
}: {
  id: string;
  label: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 focus:bg-white/[0.09]"
        {...props}
      />
      <FieldErrors errors={errors} />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  errors,
  ...props
}: {
  id: string;
  label: string;
  errors?: string[];
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      <textarea
        id={id}
        required
        rows={5}
        className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 focus:bg-white/[0.09]"
        {...props}
      />
      <FieldErrors errors={errors} />
    </div>
  );
}

function SelectField({
  id,
  label,
  errors,
  children,
  ...props
}: {
  id: string;
  label: string;
  errors?: string[];
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/85">
        {label}
      </label>
      <select
        id={id}
        required
        className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/70 focus:bg-white/[0.09]"
        {...props}
      >
        {children}
      </select>
      <FieldErrors errors={errors} />
    </div>
  );
}

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors) return null;

  return (
    <div className="mt-2 space-y-1">
      {errors.map((error) => (
        <p key={error} className="text-xs text-red-300">
          {error}
        </p>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
