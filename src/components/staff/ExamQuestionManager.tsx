"use client";

import { useState, useTransition } from "react";
import type { ExamSetMeta, ExamQuestionData } from "@/lib/evaluation/exam-types";
import {
  addExamQuestion,
  editExamQuestion,
  removeExamQuestion,
  activateExamSet,
  deactivateExamSet,
  loadExamQuestionsForSet,
} from "@/app/actions/exam-questions";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type QuestionWithMeta = ExamQuestionData & { setId: string; sortOrder: number };

type AddFormState = {
  type: "choice" | "written";
  text: string;
  choices: [string, string, string, string, string];
  correctAnswer: string;
  explanation: string;
  modelAnswer: string;
  rows: number;
  fixedLast: boolean;
  sortOrder: number;
};

const BLANK_FORM: AddFormState = {
  type: "choice",
  text: "",
  choices: ["", "", "", "", ""],
  correctAnswer: "1",
  explanation: "",
  modelAnswer: "",
  rows: 6,
  fixedLast: false,
  sortOrder: 0,
};

const CIRCLE_LABELS = ["①", "②", "③", "④", "⑤"] as const;

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export default function ExamQuestionManager({
  initialSets,
}: {
  initialSets: ExamSetMeta[];
}) {
  const [sets, setSets] = useState<ExamSetMeta[]>(initialSets);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(
    initialSets.find((s) => s.isActive)?.setId ?? initialSets[0]?.setId ?? null,
  );
  const [questions, setQuestions] = useState<QuestionWithMeta[]>([]);
  const [loadedSetId, setLoadedSetId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddFormState>(BLANK_FORM);
  const [newSetId, setNewSetId] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AddFormState>>({});
  const [editError, setEditError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // ── Load questions for a set ──────────────────
  function handleSelectSet(setId: string) {
    setSelectedSetId(setId);
    setShowAddForm(false);
    setAddError(null);
    setAddSuccess(null);
    if (loadedSetId === setId) return;

    startTransition(async () => {
      setLoadError(null);
      try {
        const qs = await loadExamQuestionsForSet(setId);
        setQuestions(qs);
        setLoadedSetId(setId);
      } catch {
        setLoadError("문제 목록을 불러오는 데 실패했습니다.");
      }
    });
  }

  // ── Activate / Deactivate ────────────────────
  function handleActivate(setId: string) {
    startTransition(async () => {
      await activateExamSet(setId);
      setSets((prev) => prev.map((s) => ({ ...s, isActive: s.setId === setId })));
    });
  }

  function handleDeactivate() {
    startTransition(async () => {
      await deactivateExamSet();
      setSets((prev) => prev.map((s) => ({ ...s, isActive: false })));
    });
  }

  // ── Add question ─────────────────────────────
  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    const targetSetId = newSetId.trim() || selectedSetId;
    if (!targetSetId) {
      setAddError("세트 ID를 입력하거나 세트를 선택해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await addExamQuestion({
        setId: targetSetId,
        type: form.type,
        text: form.text,
        choices: form.type === "choice" ? form.choices : undefined,
        correctAnswer: form.type === "choice" ? form.correctAnswer : undefined,
        explanation: form.explanation || undefined,
        modelAnswer: form.type === "written" ? form.modelAnswer || undefined : undefined,
        rows: form.type === "written" ? form.rows : undefined,
        fixedLast: form.fixedLast,
        sortOrder: form.sortOrder,
      });

      if (result && "error" in result) {
        setAddError(result.error ?? "오류가 발생했습니다.");
        return;
      }

      setAddSuccess(`문제가 세트 "${targetSetId}"에 등록되었습니다.`);
      setForm(BLANK_FORM);
      setNewSetId("");

      // Refresh question list if we're viewing this set
      if (loadedSetId === targetSetId) {
        const qs = await loadExamQuestionsForSet(targetSetId);
        setQuestions(qs);
      }
      // Update count in sets list (optimistic)
      const addedType = form.type;
      setSets((prev) => {
        const exists = prev.some((s) => s.setId === targetSetId);
        if (exists) {
          return prev.map((s) =>
            s.setId === targetSetId
              ? {
                  ...s,
                  questionCount: s.questionCount + 1,
                  mcCount: addedType === "choice" ? s.mcCount + 1 : s.mcCount,
                  writtenCount: addedType === "written" ? s.writtenCount + 1 : s.writtenCount,
                }
              : s,
          );
        }
        return [
          ...prev,
          {
            setId: targetSetId,
            label: targetSetId,
            questionCount: 1,
            mcCount: addedType === "choice" ? 1 : 0,
            writtenCount: addedType === "written" ? 1 : 0,
            isActive: false,
          },
        ];
      });
    });
  }

  // ── Edit question ────────────────────────────
  function startEdit(q: QuestionWithMeta) {
    setEditingId(q.id);
    setEditError(null);
    setEditForm({
      text: q.text,
      choices: q.choices ? [...q.choices] as [string, string, string, string, string] : ["", "", "", "", ""],
      correctAnswer: q.correctAnswer ?? "1",
      explanation: q.explanation ?? "",
      modelAnswer: q.modelAnswer ?? "",
      rows: q.rows ?? 6,
      fixedLast: q.fixedLast,
      sortOrder: q.sortOrder ?? 0,
    });
  }

  async function handleSaveEdit(id: string) {
    setEditError(null);
    startTransition(async () => {
      await editExamQuestion(id, {
        text: editForm.text,
        choices: editForm.choices,
        correctAnswer: editForm.correctAnswer,
        explanation: editForm.explanation || undefined,
        modelAnswer: editForm.modelAnswer || undefined,
        rows: editForm.rows,
        fixedLast: editForm.fixedLast,
        sortOrder: editForm.sortOrder,
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                text: editForm.text ?? q.text,
                choices: editForm.choices ?? q.choices,
                correctAnswer: editForm.correctAnswer ?? q.correctAnswer,
                explanation: editForm.explanation ?? q.explanation,
                modelAnswer: editForm.modelAnswer ?? q.modelAnswer,
                rows: editForm.rows ?? q.rows,
                fixedLast: editForm.fixedLast ?? q.fixedLast,
                sortOrder: editForm.sortOrder ?? q.sortOrder,
              }
            : q,
        ),
      );
      setEditingId(null);
    });
  }

  // ── Delete question ──────────────────────────
  async function handleDelete(id: string, setId: string, type: "choice" | "written") {
    if (!window.confirm("이 문제를 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      await removeExamQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setSets((prev) =>
        prev.map((s) =>
          s.setId === setId
            ? {
                ...s,
                questionCount: Math.max(0, s.questionCount - 1),
                mcCount: type === "choice" ? Math.max(0, s.mcCount - 1) : s.mcCount,
                writtenCount: type === "written" ? Math.max(0, s.writtenCount - 1) : s.writtenCount,
              }
            : s,
        ),
      );
    });
  }

  const activeSet = sets.find((s) => s.isActive);
  const questionsToShow = loadedSetId === selectedSetId ? questions : null;

  return (
    <div className="mt-8 space-y-5">
      {/* ── Set list ── */}
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">문제 세트 목록</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
              활성 세트의 문제가 실전 시험에 출제됩니다. 없으면 하드코딩 Set A를 사용합니다.
            </p>
          </div>
          {activeSet ? (
            <button
              onClick={handleDeactivate}
              disabled={isPending}
              className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-900/40 disabled:opacity-50"
            >
              활성화 해제
            </button>
          ) : (
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              ⚠ 활성 세트 없음 — Set A 사용 중
            </span>
          )}
        </div>

        {sets.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-[#86868b]">
            등록된 세트가 없습니다. 아래에서 문제를 추가하면 세트가 생성됩니다.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/70">
              <span>세트 ID</span>
              <span className="px-3 text-center">총</span>
              <span className="px-3 text-center">객관식</span>
              <span className="px-3 text-center">주관식</span>
              <span className="px-3 text-center">관리</span>
            </div>
            {sets.map((s) => (
              <div
                key={s.setId}
                onClick={() => handleSelectSet(s.setId)}
                className={`grid cursor-pointer grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 border-t border-white/10 px-4 py-3 text-sm transition hover:bg-white/[0.03] ${
                  selectedSetId === s.setId ? "bg-white/[0.04]" : ""
                }`}
              >
                <span className="flex items-center gap-2 break-all text-white">
                  {s.isActive && (
                    <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      ACTIVE
                    </span>
                  )}
                  {s.setId}
                </span>
                <span className="px-3 text-center font-mono text-white/80">{s.questionCount}</span>
                <span className="px-3 text-center font-mono text-indigo-300/80">{s.mcCount}</span>
                <span className="px-3 text-center font-mono text-amber-300/80">{s.writtenCount}</span>
                <div
                  className="flex gap-2 px-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!s.isActive && (
                    <button
                      onClick={() => handleActivate(s.setId)}
                      disabled={isPending}
                      className="rounded-md bg-emerald-600/80 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      활성화
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectSet(s.setId)}
                    className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    {selectedSetId === s.setId && loadedSetId === s.setId ? "보는 중" : "보기"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Question list for selected set ── */}
      {selectedSetId && (
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                문제 목록 —{" "}
                <span className="font-mono text-indigo-300">{selectedSetId}</span>
              </h2>
              <p className="mt-1 text-sm text-[#86868b]">
                {questionsToShow ? `${questionsToShow.length}문항` : "로딩 중..."}
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm((v) => !v);
                setAddError(null);
                setAddSuccess(null);
              }}
              className="self-start rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-200 sm:self-auto"
            >
              {showAddForm ? "취소" : "+ 문제 추가"}
            </button>
          </div>

          {loadError && (
            <p className="mb-4 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              {loadError}
            </p>
          )}

          {isPending && loadedSetId !== selectedSetId && (
            <p className="mb-4 text-sm text-[#86868b]">로딩 중...</p>
          )}

          {questionsToShow && questionsToShow.length > 0 && (
            <div className="space-y-3">
              {questionsToShow.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  idx={idx}
                  isEditing={editingId === q.id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  editError={editError}
                  onEdit={() => startEdit(q)}
                  onSaveEdit={() => handleSaveEdit(q.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => handleDelete(q.id, q.setId, q.type)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {questionsToShow && questionsToShow.length === 0 && (
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-[#86868b]">
              이 세트에 등록된 문제가 없습니다. 아래 폼에서 추가하세요.
            </p>
          )}

          {/* ── Add question form ── */}
          {showAddForm && (
            <AddQuestionForm
              defaultSetId={selectedSetId}
              newSetId={newSetId}
              setNewSetId={setNewSetId}
              form={form}
              setForm={setForm}
              onSubmit={handleAddQuestion}
              isPending={isPending}
              error={addError}
              success={addSuccess}
            />
          )}
        </section>
      )}

      {/* ── Standalone add form when no set selected ── */}
      {!selectedSetId && (
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="mb-3 text-lg font-bold tracking-tight text-white">문제 추가</h2>
          <p className="mb-5 text-sm text-[#86868b]">새 세트 ID를 입력하고 첫 번째 문제를 등록하세요.</p>
          <AddQuestionForm
            defaultSetId=""
            newSetId={newSetId}
            setNewSetId={setNewSetId}
            form={form}
            setForm={setForm}
            onSubmit={handleAddQuestion}
            isPending={isPending}
            error={addError}
            success={addSuccess}
          />
        </section>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Question card (view + inline edit)
// ──────────────────────────────────────────────
function QuestionCard({
  q,
  idx,
  isEditing,
  editForm,
  setEditForm,
  editError,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isPending,
}: {
  q: QuestionWithMeta;
  idx: number;
  isEditing: boolean;
  editForm: Partial<AddFormState>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<AddFormState>>>;
  editError: string | null;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const typeBadge =
    q.type === "choice" ? (
      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
        객관식
      </span>
    ) : (
      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
        주관식
      </span>
    );

  if (isEditing) {
    return (
      <div className="rounded-lg border border-indigo-500/30 bg-indigo-900/10 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-300">Q{idx + 1} 편집 중</span>
          {typeBadge}
        </div>

        <label className="mb-1 block text-xs font-semibold text-white/60">문제 내용</label>
        <textarea
          value={editForm.text ?? ""}
          onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))}
          rows={3}
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />

        {q.type === "choice" && (
          <>
            <label className="mb-1 block text-xs font-semibold text-white/60">선택지 (5개)</label>
            {(editForm.choices ?? ["", "", "", "", ""]).map((c, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <span className="w-5 text-center text-xs text-white/50">{CIRCLE_LABELS[i]}</span>
                <input
                  value={c}
                  onChange={(e) => {
                    const next = [...(editForm.choices ?? ["", "", "", "", ""])] as [
                      string, string, string, string, string
                    ];
                    next[i] = e.target.value;
                    setEditForm((f) => ({ ...f, choices: next }));
                  }}
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            ))}
            <div className="mb-3 flex items-center gap-3">
              <label className="text-xs font-semibold text-white/60">정답</label>
              <select
                value={editForm.correctAnswer ?? "1"}
                onChange={(e) => setEditForm((f) => ({ ...f, correctAnswer: e.target.value }))}
                className="rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={String(n)}>
                    {CIRCLE_LABELS[n - 1]} ({n}번)
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <label className="mb-1 block text-xs font-semibold text-white/60">해설 (선택)</label>
        <textarea
          value={editForm.explanation ?? ""}
          onChange={(e) => setEditForm((f) => ({ ...f, explanation: e.target.value }))}
          rows={2}
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />

        {q.type === "written" && (
          <>
            <label className="mb-1 block text-xs font-semibold text-white/60">모범 답안 (선택)</label>
            <textarea
              value={editForm.modelAnswer ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, modelAnswer: e.target.value }))}
              rows={3}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </>
        )}

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-white/60">
            <input
              type="checkbox"
              checked={editForm.fixedLast ?? false}
              onChange={(e) => setEditForm((f) => ({ ...f, fixedLast: e.target.checked }))}
              className="h-3.5 w-3.5 rounded"
            />
            항상 마지막에 배치
          </label>
          <label className="ml-4 flex items-center gap-1.5 text-xs text-white/60">
            정렬 순서:
            <input
              type="number"
              value={editForm.sortOrder ?? 0}
              onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-16 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-sm text-white focus:outline-none"
            />
          </label>
        </div>

        {editError && <p className="mt-2 text-xs text-red-400">{editError}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onSaveEdit}
            disabled={isPending}
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-200 disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={onCancelEdit}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold text-white/50">Q{idx + 1}</span>
            {typeBadge}
            {q.fixedLast && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/40">
                고정 위치
              </span>
            )}
            <span className="text-[10px] text-white/30">sort={q.sortOrder}</span>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white">{q.text}</p>

          {q.type === "choice" && q.choices && (
            <ol className="mt-2 space-y-1">
              {q.choices.map((c, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 text-xs ${
                    q.correctAnswer === String(i + 1)
                      ? "font-semibold text-emerald-400"
                      : "text-white/60"
                  }`}
                >
                  <span className="shrink-0">{CIRCLE_LABELS[i]}</span>
                  <span>{c}</span>
                  {q.correctAnswer === String(i + 1) && (
                    <span className="ml-1 shrink-0 text-emerald-500">✓ 정답</span>
                  )}
                </li>
              ))}
            </ol>
          )}

          {q.explanation && (
            <p className="mt-2 rounded-md bg-indigo-900/20 px-3 py-2 text-xs leading-relaxed text-indigo-200/80">
              <span className="font-semibold text-indigo-300">해설:</span> {q.explanation}
            </p>
          )}

          {q.modelAnswer && (
            <p className="mt-2 rounded-md bg-amber-900/20 px-3 py-2 text-xs leading-relaxed text-amber-200/80">
              <span className="font-semibold text-amber-300">모범답안:</span> {q.modelAnswer}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            onClick={onEdit}
            disabled={isPending}
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            편집
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="rounded-md border border-red-500/20 bg-red-900/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-900/30 disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Add question form
// ──────────────────────────────────────────────
function AddQuestionForm({
  defaultSetId,
  newSetId,
  setNewSetId,
  form,
  setForm,
  onSubmit,
  isPending,
  error,
  success,
}: {
  defaultSetId: string;
  newSetId: string;
  setNewSetId: (v: string) => void;
  form: AddFormState;
  setForm: React.Dispatch<React.SetStateAction<AddFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
  success: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4 rounded-lg border border-white/10 bg-white/[0.025] p-5">
      <h3 className="text-sm font-bold text-white">새 문제 추가</h3>

      {/* Set ID override */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-white/60">
          세트 ID{" "}
          {defaultSetId && (
            <span className="font-normal text-white/40">
              (비워두면 &ldquo;{defaultSetId}&rdquo; 사용)
            </span>
          )}
        </label>
        <input
          type="text"
          value={newSetId}
          onChange={(e) => setNewSetId(e.target.value)}
          placeholder={defaultSetId || "예: set-b-2026-05"}
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Type */}
      <div className="flex gap-4">
        {(["choice", "written"] as const).map((t) => (
          <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="radio"
              name="qtype"
              checked={form.type === t}
              onChange={() => setForm((f) => ({ ...f, type: t }))}
              className="accent-indigo-500"
            />
            {t === "choice" ? "객관식 (5지선다)" : "주관식 (서술형)"}
          </label>
        ))}
      </div>

      {/* Text */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-white/60">문제 내용 *</label>
        <textarea
          required
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          rows={4}
          placeholder="문제 내용을 입력하세요..."
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Choices (choice only) */}
      {form.type === "choice" && (
        <>
          <div>
            <label className="mb-2 block text-xs font-semibold text-white/60">선택지 (5개) *</label>
            <div className="space-y-2">
              {form.choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs text-white/50">
                    {CIRCLE_LABELS[i]}
                  </span>
                  <input
                    required
                    value={c}
                    onChange={(e) => {
                      const next = [...form.choices] as [string, string, string, string, string];
                      next[i] = e.target.value;
                      setForm((f) => ({ ...f, choices: next }));
                    }}
                    placeholder={`${i + 1}번 선택지`}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-white/60">정답 *</label>
            <select
              value={form.correctAnswer}
              onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))}
              className="rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={String(n)}>
                  {CIRCLE_LABELS[n - 1]} ({n}번)
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Explanation */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-white/60">해설 (선택)</label>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          rows={2}
          placeholder="정답 해설을 입력하세요..."
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Model answer (written only) */}
      {form.type === "written" && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">모범 답안 (선택)</label>
          <textarea
            value={form.modelAnswer}
            onChange={(e) => setForm((f) => ({ ...f, modelAnswer: e.target.value }))}
            rows={3}
            placeholder="모범 답안을 입력하세요..."
            className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      )}

      {/* Options */}
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.fixedLast}
            onChange={(e) => setForm((f) => ({ ...f, fixedLast: e.target.checked }))}
            className="h-4 w-4 rounded accent-indigo-500"
          />
          항상 마지막에 배치 (주관식 권장)
        </label>

        <label className="flex items-center gap-2 text-sm text-white/70">
          정렬 순서:
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            className="w-16 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-sm text-white focus:outline-none"
          />
        </label>

        {form.type === "written" && (
          <label className="flex items-center gap-2 text-sm text-white/70">
            줄 수:
            <input
              type="number"
              value={form.rows}
              min={3}
              max={20}
              onChange={(e) => setForm((f) => ({ ...f, rows: Number(e.target.value) }))}
              className="w-16 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-sm text-white focus:outline-none"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "등록 중..." : "문제 등록"}
      </button>
    </form>
  );
}
