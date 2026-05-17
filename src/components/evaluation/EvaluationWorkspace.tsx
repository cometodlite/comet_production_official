"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EVALUATION_TRACK_LABELS, type EvaluationTrack } from "@/lib/auth/evaluation-tracks";
import { EVALUATION_DOCUMENTS, getEvaluationFileUrl } from "@/lib/evaluation/documents";
import { useLang } from "@/context/LanguageContext";
import { submitEvaluationScore } from "@/app/actions/evaluation";

const DURATION_SECONDS = 50 * 60;
const STORAGE_KEY_PREFIX = "comet-evaluation-attempt";
const fiveChoiceOptions = ["1", "2", "3", "4", "5"];
const fourChoiceOptions = ["1", "2", "3", "4"];

const documents = EVALUATION_DOCUMENTS;

type WorkspaceStatus = "ready" | "running" | "ended";
type QuestionConfig = {
  number: number;
  type: "choice" | "written";
  choices?: string[];
};
type DocumentAnswer = {
  applicantName: string;
  evaluationDate: string;
  responses: Record<string, string>;
};
type DocumentAttempt = {
  status: WorkspaceStatus;
  remainingSeconds: number;
  endsAt?: number;
};

const questionConfigs: QuestionConfig[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    number: index + 1,
    type: "choice" as const,
    choices: fiveChoiceOptions,
  })),
  ...Array.from({ length: 4 }, (_, index) => ({
    number: index + 11,
    type: "written" as const,
  })),
  ...Array.from({ length: 4 }, (_, index) => ({
    number: index + 15,
    type: "choice" as const,
    choices: fourChoiceOptions,
  })),
  ...Array.from({ length: 2 }, (_, index) => ({
    number: index + 19,
    type: "written" as const,
  })),
];

function createEmptyAnswer() {
  return {
    applicantName: "",
    evaluationDate: new Date().toISOString().slice(0, 10),
    responses: Object.fromEntries(questionConfigs.map((question) => [String(question.number), ""])),
  } satisfies DocumentAnswer;
}

function createInitialAnswers(availableDocuments = documents): Record<string, DocumentAnswer> {
  return Object.fromEntries(availableDocuments.map((document) => [document.id, createEmptyAnswer()]));
}

function createInitialAttempts(availableDocuments = documents): Record<string, DocumentAttempt> {
  return Object.fromEntries(
    availableDocuments.map((document) => [
      document.id,
      {
        status: "ready",
        remainingSeconds: DURATION_SECONDS,
      },
    ]),
  );
}

export default function EvaluationWorkspace({
  memberName,
  evaluationTrack,
}: {
  memberName: string;
  evaluationTrack?: EvaluationTrack;
}) {
  const trackDocuments = useMemo(
    () => documents.filter((document) => document.track === evaluationTrack),
    [evaluationTrack],
  );

  // null = selection not yet made (or not needed). string[] = chosen doc IDs.
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[] | null>(null);
  // Pending picks inside the selection screen (not yet confirmed)
  const [pendingPicks, setPendingPicks] = useState<string[]>([]);

  // Documents actually shown in the workspace (after selection, or all if ≤ 2)
  const availableDocuments = useMemo(() => {
    if (selectedDocumentIds) return trackDocuments.filter((d) => selectedDocumentIds.includes(d.id));
    // auto-use all when no manual selection is needed
    return trackDocuments;
  }, [trackDocuments, selectedDocumentIds]);

  // Show the picker UI when there are more than 2 docs but no selection yet
  const showSelectionScreen = trackDocuments.length > 2 && selectedDocumentIds === null;

  const { t, lang } = useLang();

  const [activeDocument, setActiveDocument] = useState(availableDocuments[0]?.id || "");
  const [mobileView, setMobileView] = useState<"pdf" | "answers">("pdf");
  const [documentAttempts, setDocumentAttempts] = useState<Record<string, DocumentAttempt>>(() => createInitialAttempts(availableDocuments));
  const [answers, setAnswers] = useState<Record<string, DocumentAnswer>>(() => createInitialAnswers(availableDocuments));
  const [isHydrated, setIsHydrated] = useState(false);
  const storageKey = `${STORAGE_KEY_PREFIX}:${memberName}:${evaluationTrack || "unassigned"}`;
  // 이미 서버에 제출된 documentId 추적 (중복 제출 방지)
  const submittedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedRaw = window.localStorage.getItem(storageKey);
      if (!savedRaw) {
        setIsHydrated(true);
        return;
      }

      try {
        const parsed = JSON.parse(savedRaw) as {
          status?: WorkspaceStatus;
          endsAt?: number;
          documentAttempts?: Record<string, DocumentAttempt>;
          answers?: Record<string, DocumentAnswer | string>;
          selectedDocumentIds?: string[];
        };

        // Restore document selection if there are more than 2 track docs
        if (trackDocuments.length > 2 && Array.isArray(parsed.selectedDocumentIds)) {
          const valid = parsed.selectedDocumentIds.filter((id) => trackDocuments.some((d) => d.id === id));
          if (valid.length === 2) {
            setSelectedDocumentIds(valid);
          }
        }

        const docsForNormalize = parsed.selectedDocumentIds
          ? trackDocuments.filter((d) => parsed.selectedDocumentIds!.includes(d.id))
          : availableDocuments;

        if (parsed.documentAttempts) {
          setDocumentAttempts(normalizeAttempts(parsed.documentAttempts, docsForNormalize));
        } else if (parsed.status) {
          setDocumentAttempts(normalizeLegacyAttempt(parsed.status, parsed.endsAt, docsForNormalize));
        }
        if (parsed.answers) {
          setAnswers(normalizeAnswers(parsed.answers, docsForNormalize));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        documentAttempts,
        answers,
        ...(selectedDocumentIds ? { selectedDocumentIds } : {}),
      }),
    );
  }, [answers, documentAttempts, isHydrated, selectedDocumentIds, storageKey]);

  // 평가가 ended 상태로 바뀌면 서버에 답안 제출
  useEffect(() => {
    if (!isHydrated) return;
    for (const document of availableDocuments) {
      const attempt = documentAttempts[document.id];
      if (attempt?.status !== "ended") continue;
      if (submittedRef.current.has(document.id)) continue;
      submittedRef.current.add(document.id);
      const answer = answers[document.id];
      if (!answer) continue;
      submitEvaluationScore({
        documentId: document.id,
        documentTitle: document.title,
        applicantName: answer.applicantName,
        evaluationDate: answer.evaluationDate,
        responses: answer.responses,
      }).catch(() => {
        // 제출 실패 시 재시도를 위해 추적에서 제거
        submittedRef.current.delete(document.id);
      });
    }
  }, [documentAttempts, answers, availableDocuments, isHydrated]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDocumentAttempts((current) => {
        let changed = false;
        const next: Record<string, DocumentAttempt> = {};

        for (const [documentId, attempt] of Object.entries(current)) {
          if (attempt.status !== "running" || !attempt.endsAt) {
            next[documentId] = attempt;
            continue;
          }

          const remainingSeconds = Math.max(0, Math.ceil((attempt.endsAt - Date.now()) / 1000));
          if (remainingSeconds === attempt.remainingSeconds && remainingSeconds > 0) {
            next[documentId] = attempt;
            continue;
          }

          changed = true;
          next[documentId] = {
            ...attempt,
            status: remainingSeconds > 0 ? "running" : "ended",
            remainingSeconds,
          };
        }

        return changed ? next : current;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  // ── Document selection screen ──────────────────────────────────────────────
  if (showSelectionScreen) {
    const toggle = (id: string) => {
      setPendingPicks((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev,
      );
    };
    const confirm = () => {
      if (pendingPicks.length !== 2) return;
      setSelectedDocumentIds(pendingPicks);
      setActiveDocument(pendingPicks[0]);
      setDocumentAttempts(createInitialAttempts(trackDocuments.filter((d) => pendingPicks.includes(d.id))));
      setAnswers(createInitialAnswers(trackDocuments.filter((d) => pendingPicks.includes(d.id))));
    };
    return (
      <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-2xl px-4 py-10 lg:px-6 lg:py-20">
        <section className="rounded-lg border border-white/[0.08] bg-black/40 p-5 backdrop-blur-xl lg:p-8">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
          <h1 className="text-2xl font-black tracking-tight text-white">{t("평가 문서 선택", "Select Documents")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#86868b]">
            {lang === "ko"
              ? <>아래 {trackDocuments.length}개의 연습 문서 중 <span className="font-semibold text-white">2개</span>를 선택해 주세요.</>
              : <>Select <span className="font-semibold text-white">2</span> of the {trackDocuments.length} practice documents below.</>}
          </p>

          <div className="mt-7 space-y-3">
            {trackDocuments.map((doc) => {
              const selected = pendingPicks.includes(doc.id);
              const disabled = !selected && pendingPicks.length >= 2;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggle(doc.id)}
                  disabled={disabled}
                  className={`w-full rounded-lg border px-5 py-4 text-left transition ${
                    selected
                      ? "border-indigo-400/60 bg-indigo-500/15 text-white"
                      : disabled
                        ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] text-white/30"
                        : "border-white/[0.10] bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-[10px] font-black transition ${
                        selected ? "border-indigo-400 bg-indigo-400 text-black" : "border-white/20 text-white/0"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-sm font-semibold">{doc.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <p className="text-xs text-[#86868b]">
              {pendingPicks.length === 0 && t("2개를 선택해 주세요.", "Please select 2 documents.")}
              {pendingPicks.length === 1 && t("1개 더 선택해 주세요.", "Select 1 more.")}
              {pendingPicks.length === 2 && t("선택 완료 — 확인 버튼을 눌러주세요.", "Ready — press Confirm.")}
            </p>
            <button
              type="button"
              onClick={confirm}
              disabled={pendingPicks.length !== 2}
              className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("확인", "Confirm")}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── Main workspace ─────────────────────────────────────────────────────────
  const currentDocument = availableDocuments.find((document) => document.id === activeDocument) || availableDocuments[0];
  if (!currentDocument) {
    return (
      <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-2xl px-4 py-10 lg:px-6 lg:py-20">
        <section className="rounded-lg border border-white/[0.08] bg-black/40 p-5 backdrop-blur-xl lg:p-7">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
          <h1 className="text-3xl font-black tracking-tight text-white">{t("접근 가능한 평가가 없습니다", "No Evaluation Available")}</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#86868b]">
            {t(`${memberName}님 계정에는 현재 표시할 평가 문서가 배정되어 있지 않습니다.`, `No evaluation documents have been assigned to ${memberName}'s account.`)}
          </p>
        </section>
      </div>
    );
  }

  const currentAttempt = documentAttempts[currentDocument.id] || createInitialAttempts(availableDocuments)[currentDocument.id];
  const evaluationTrackLabel = evaluationTrack ? EVALUATION_TRACK_LABELS[evaluationTrack] : "미배정";
  const locked = currentAttempt.status !== "running";
  const currentAnswer = answers[currentDocument.id] || createEmptyAnswer();
  const currentPdfPath = getEvaluationFileUrl(currentAttempt.status === "ended" ? currentDocument.solutionFile : currentDocument.pdfFile);
  const startEvaluation = (documentId: string) => {
    setDocumentAttempts((current) => ({
      ...current,
      [documentId]: {
        status: "running",
        remainingSeconds: DURATION_SECONDS,
        endsAt: Date.now() + DURATION_SECONDS * 1000,
      },
    }));
  };
  const endEvaluation = (documentId: string) => {
    setDocumentAttempts((current) => ({
      ...current,
        [documentId]: {
        ...(current[documentId] || createInitialAttempts(availableDocuments)[documentId]),
        status: "ended",
        remainingSeconds: 0,
        endsAt: undefined,
      },
    }));
  };
  const updateApplicantField = (documentId: string, field: "applicantName" | "evaluationDate", value: string) => {
    setAnswers((current) => {
      const answer = current[documentId] || createEmptyAnswer();
      return {
        ...current,
        [documentId]: {
          ...answer,
          [field]: value,
        },
      };
    });
  };
  const updateQuestionResponse = (documentId: string, questionNumber: number, value: string) => {
    setAnswers((current) => {
      const answer = current[documentId] || createEmptyAnswer();
      return {
        ...current,
        [documentId]: {
          ...answer,
          responses: {
            ...answer.responses,
            [String(questionNumber)]: value,
          },
        },
      };
    });
  };

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-7xl px-4 py-8 lg:px-6 lg:py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-4 backdrop-blur-xl lg:p-7">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 lg:pb-6">
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
            <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">{t("연습 문제", "Practice")}</h1>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b] lg:text-sm">
              {lang === "ko"
                ? <>{memberName}님 인증 세션 · {evaluationTrackLabel}</>
                : <>{memberName} · {evaluationTrackLabel}</>}
            </p>
          </div>

          {/* 타이머: 모바일에서 콤팩트 */}
          <div className="flex-shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right lg:px-5 lg:py-4">
            <p className="text-[10px] font-semibold text-[#86868b] lg:text-xs">{t("남은 시간", "Time Left")}</p>
            <p className={`mt-0.5 font-mono text-xl font-black lg:mt-1 lg:text-2xl ${currentAttempt.remainingSeconds <= 300 ? "text-red-300" : "text-white"}`}>
              {formatTime(currentAttempt.remainingSeconds)}
            </p>
          </div>
        </div>

        {currentAttempt.status === "ready" && (
          <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
            {t("현재 선택된 문서의 평가를 시작하면 타이머가 작동합니다. 문서별로 풀이를 종료할 수 있습니다.", "Starting the selected document will start the timer. You can end each document's session individually.")}
          </div>
        )}
        {currentAttempt.status === "ended" && (
          <div className="mt-6 rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-100">
            {t("현재 문서의 풀이가 종료되어 답안 입력이 잠겼습니다. 문제 PDF 대신 정답 및 해설 PDF가 표시됩니다.", "This document's session has ended and answers are locked. The solution PDF is now shown instead.")}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3 lg:mt-6">
          {currentAttempt.status === "ready" && (
            <button
              type="button"
              onClick={() => { startEvaluation(currentDocument.id); setMobileView("pdf"); }}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-200 lg:py-3"
            >
              {t(`${currentDocument.title} 시작`, `Start ${currentDocument.title}`)}
            </button>
          )}
          {currentAttempt.status === "running" && (
            <button
              type="button"
              onClick={() => endEvaluation(currentDocument.id)}
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white lg:py-3"
            >
              {t(`${currentDocument.title} 풀이 종료`, `End ${currentDocument.title}`)}
            </button>
          )}
        </div>

        {/* 모바일 전용: 문제 보기 / 답안 작성 탭 */}
        <div className="mt-4 flex overflow-hidden rounded-lg border border-white/10 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView("pdf")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              mobileView === "pdf" ? "bg-white/[0.09] text-white" : "text-[#86868b] hover:text-white"
            }`}
          >
            📄 {t("문제 보기", "Questions")}
          </button>
          <div className="w-px bg-white/10" />
          <button
            type="button"
            onClick={() => setMobileView("answers")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              mobileView === "answers" ? "bg-white/[0.09] text-white" : "text-[#86868b] hover:text-white"
            }`}
          >
            ✏️ {t("답안 작성", "Answers")}
          </button>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:gap-5">
          {/* PDF 패널 */}
          <div className={`overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] lg:sticky lg:top-20 ${mobileView === "answers" ? "hidden lg:block" : ""}`}>
            <div className="flex border-b border-white/10">
              {availableDocuments.map((document) => {
                const docStatus = documentAttempts[document.id]?.status || "ready";
                const isActive = activeDocument === document.id;
                const isDone = docStatus === "ended";
                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => { setActiveDocument(document.id); setMobileView("pdf"); }}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                      isDone
                        ? isActive
                          ? "border-b-2 border-green-300 bg-green-500 text-black"
                          : "bg-green-500/75 text-black hover:bg-green-400"
                        : isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-[#86868b] hover:text-white"
                    }`}
                  >
                    <span className="block">{document.title}</span>
                    <span className={`mt-1 block text-[11px] font-medium ${isDone ? "text-black/65" : "text-white/45"}`}>
                      {getAttemptLabel(docStatus, t)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="h-[58svh] min-h-[320px] max-h-[600px] p-2 lg:h-[68svh] lg:min-h-[460px] lg:max-h-[700px]">
              {currentPdfPath ? (
                <iframe title={currentDocument.title} src={currentPdfPath} className="h-full w-full rounded-md border border-white/10 bg-white" />
              ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed border-white/15 bg-black/25 px-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{t(`${currentDocument.title} PDF 준비 중`, `${currentDocument.title} PDF Pending`)}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
                      {t("PDF 파일을 받으면 이 영역에 문서 뷰어가 표시됩니다.", "The document viewer will appear here once the PDF file is ready.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 답안 패널 */}
          <div className={`rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:h-[68svh] lg:max-h-[700px] lg:min-h-[460px] lg:overflow-y-auto lg:p-5 ${mobileView === "pdf" ? "hidden lg:block" : ""}`}>
            <h2 className="text-lg font-bold text-white">{t("답안 작성", "Write Answers")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#86868b]">{t(`${currentDocument.title} 답안`, `${currentDocument.title} Answers`)}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/85">{t("이름", "Name")}</span>
                <input
                  value={currentAnswer.applicantName}
                  onChange={(event) => updateApplicantField(currentDocument.id, "applicantName", event.target.value)}
                  disabled={locked}
                  placeholder={t("응시자 이름", "Applicant Name")}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/85">{t("날짜", "Date")}</span>
                <input
                  type="date"
                  value={currentAnswer.evaluationDate}
                  onChange={(event) => updateApplicantField(currentDocument.id, "evaluationDate", event.target.value)}
                  disabled={locked}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55"
                />
              </label>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-white/90">{t("1~10번 객관식 답안", "Q1–10 Multiple Choice")}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {questionConfigs.slice(0, 10).map((question) => (
                  <ChoiceQuestion
                    key={`${currentDocument.id}-${question.number}`}
                    documentId={currentDocument.id}
                    question={question}
                    value={currentAnswer.responses[String(question.number)] || ""}
                    locked={locked}
                    onChange={updateQuestionResponse}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-white/90">{t("11~14번 단답 / 서술형", "Q11–14 Short / Essay")}</h3>
              <div className="mt-3 space-y-3">
                {questionConfigs.slice(10, 14).map((question) => (
                  <WrittenQuestion
                    key={`${currentDocument.id}-${question.number}`}
                    documentId={currentDocument.id}
                    question={question}
                    value={currentAnswer.responses[String(question.number)] || ""}
                    locked={locked}
                    onChange={updateQuestionResponse}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-white/90">{t("15~18번 객관식 답안", "Q15–18 Multiple Choice")}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {questionConfigs.slice(14, 18).map((question) => (
                  <ChoiceQuestion
                    key={`${currentDocument.id}-${question.number}`}
                    documentId={currentDocument.id}
                    question={question}
                    value={currentAnswer.responses[String(question.number)] || ""}
                    locked={locked}
                    onChange={updateQuestionResponse}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-white/90">{t("19~20번 단답 / 서술형", "Q19–20 Short / Essay")}</h3>
              <div className="mt-3 space-y-3">
                {questionConfigs.slice(18, 20).map((question) => (
                  <WrittenQuestion
                    key={`${currentDocument.id}-${question.number}`}
                    documentId={currentDocument.id}
                    question={question}
                    value={currentAnswer.responses[String(question.number)] || ""}
                    locked={locked}
                    onChange={updateQuestionResponse}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ChoiceQuestion({
  documentId,
  question,
  value,
  locked,
  onChange,
}: {
  documentId: string;
  question: QuestionConfig;
  value: string;
  locked: boolean;
  onChange: (documentId: string, questionNumber: number, value: string) => void;
}) {
  const { t } = useLang();
  return (
    <fieldset disabled={locked} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 disabled:opacity-55">
      <legend className="px-1 text-xs font-bold text-white/80">{t(`${question.number}번`, `Q${question.number}`)}</legend>
      <div className={`grid gap-1 ${question.choices?.length === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
        {question.choices?.map((option) => (
          <label
            key={option}
            className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-white/10 text-xs font-bold text-white/70 has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-400/25 has-[:checked]:text-white"
          >
            <input
              type="radio"
              name={`${documentId}-${question.number}`}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(documentId, question.number, event.target.value)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function WrittenQuestion({
  documentId,
  question,
  value,
  locked,
  onChange,
}: {
  documentId: string;
  question: QuestionConfig;
  value: string;
  locked: boolean;
  onChange: (documentId: string, questionNumber: number, value: string) => void;
}) {
  const { t } = useLang();
  return (
    <label className="block rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <span className="mb-2 block text-xs font-bold text-white/80">{t(`${question.number}번`, `Q${question.number}`)}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(documentId, question.number, event.target.value)}
        disabled={locked}
        rows={question.number >= 19 ? 5 : 3}
        placeholder={locked ? t("평가 시작 후 입력할 수 있습니다.", "Start the evaluation to enter answers.") : t("답안을 입력하세요.", "Enter your answer.")}
        className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55"
      />
    </label>
  );
}

function normalizeAnswers(savedAnswers: Record<string, DocumentAnswer | string>, availableDocuments = documents) {
  const normalized = createInitialAnswers(availableDocuments);
  for (const document of availableDocuments) {
    const savedAnswer = savedAnswers[document.id];
    if (!savedAnswer) continue;
    if (typeof savedAnswer === "string") {
      normalized[document.id] = {
        ...normalized[document.id],
        responses: {
          ...normalized[document.id].responses,
          "11": savedAnswer,
        },
      };
      continue;
    }
    normalized[document.id] = {
      applicantName: savedAnswer.applicantName || "",
      evaluationDate: savedAnswer.evaluationDate || normalized[document.id].evaluationDate,
      responses: {
        ...normalized[document.id].responses,
        ...(savedAnswer.responses || {}),
      },
    };
  }
  return normalized;
}

function normalizeAttempts(savedAttempts: Record<string, DocumentAttempt>, availableDocuments = documents) {
  const normalized = createInitialAttempts(availableDocuments);
  for (const document of availableDocuments) {
    const savedAttempt = savedAttempts[document.id];
    if (!savedAttempt) continue;

    if (savedAttempt.status === "ended") {
      normalized[document.id] = {
        status: "ended",
        remainingSeconds: 0,
      };
      continue;
    }

    if (savedAttempt.status === "running" && savedAttempt.endsAt) {
      const remainingSeconds = Math.max(0, Math.ceil((savedAttempt.endsAt - Date.now()) / 1000));
      normalized[document.id] = {
        status: remainingSeconds > 0 ? "running" : "ended",
        remainingSeconds,
        endsAt: remainingSeconds > 0 ? savedAttempt.endsAt : undefined,
      };
      continue;
    }

    normalized[document.id] = {
      status: "ready",
      remainingSeconds: DURATION_SECONDS,
    };
  }
  return normalized;
}

function normalizeLegacyAttempt(status: WorkspaceStatus, endsAt?: number, availableDocuments = documents) {
  const normalized = createInitialAttempts(availableDocuments);
  if (status === "ready") return normalized;
  const firstDocument = availableDocuments[0];
  if (!firstDocument) return normalized;

  const remainingSeconds =
    status === "running" && endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : 0;

  normalized[firstDocument.id] = {
    status: remainingSeconds > 0 ? "running" : "ended",
    remainingSeconds,
    endsAt: remainingSeconds > 0 ? endsAt : undefined,
  };
  return normalized;
}

function getAttemptLabel(status: WorkspaceStatus, t: (ko: string, en: string) => string) {
  if (status === "running") return t("풀이 중", "In Progress");
  if (status === "ended") return t("해설 확인", "View Solution");
  return t("대기", "Waiting");
}
