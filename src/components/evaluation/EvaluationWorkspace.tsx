"use client";

import { useEffect, useMemo, useState } from "react";
import { EVALUATION_TRACK_LABELS, type EvaluationTrack } from "@/lib/auth/evaluation-tracks";

const DURATION_SECONDS = 50 * 60;
const STORAGE_KEY_PREFIX = "comet-evaluation-attempt";
const fiveChoiceOptions = ["1", "2", "3", "4", "5"];
const fourChoiceOptions = ["1", "2", "3", "4"];

const documents = [
  {
    id: "document-1",
    title: "일반형 역량평가 연습 1차",
    track: "entertainers-illustrator-writer",
    pdfPath: "/evaluation/illustrator-general-practice-1.pdf",
    solutionPdfPath: "/evaluation/illustrator-general-practice-1-solution.pdf",
  },
  {
    id: "document-2",
    title: "일반형 역량평가 연습 2차",
    track: "entertainers-illustrator-writer",
    pdfPath: "/evaluation/illustrator-general-practice-2.pdf",
    solutionPdfPath: "/evaluation/illustrator-general-practice-2-solution.pdf",
  },
] satisfies Array<{
  id: string;
  title: string;
  track: EvaluationTrack;
  pdfPath: string;
  solutionPdfPath: string;
}>;

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

export default function EvaluationWorkspace({ memberName, evaluationTrack }: { memberName: string; evaluationTrack?: EvaluationTrack }) {
  const availableDocuments = useMemo(
    () => documents.filter((document) => document.track === evaluationTrack),
    [evaluationTrack],
  );
  const [activeDocument, setActiveDocument] = useState(availableDocuments[0]?.id || "");
  const [documentAttempts, setDocumentAttempts] = useState<Record<string, DocumentAttempt>>(() => createInitialAttempts(availableDocuments));
  const [answers, setAnswers] = useState<Record<string, DocumentAnswer>>(() => createInitialAnswers(availableDocuments));
  const [isHydrated, setIsHydrated] = useState(false);
  const storageKey = `${STORAGE_KEY_PREFIX}:${memberName}:${evaluationTrack || "unassigned"}`;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedAttempt = window.localStorage.getItem(storageKey);
      if (!savedAttempt) {
        setIsHydrated(true);
        return;
      }

      try {
        const parsed = JSON.parse(savedAttempt) as {
          status?: WorkspaceStatus;
          endsAt?: number;
          documentAttempts?: Record<string, DocumentAttempt>;
          answers?: Record<string, DocumentAnswer | string>;
        };
        if (parsed.documentAttempts) {
          setDocumentAttempts(normalizeAttempts(parsed.documentAttempts, availableDocuments));
        } else if (parsed.status) {
          setDocumentAttempts(normalizeLegacyAttempt(parsed.status, parsed.endsAt, availableDocuments));
        }
        if (parsed.answers) {
          setAnswers(normalizeAnswers(parsed.answers, availableDocuments));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [availableDocuments, storageKey]);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        documentAttempts,
        answers,
      }),
    );
  }, [answers, documentAttempts, isHydrated, storageKey]);

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

  const currentDocument = availableDocuments.find((document) => document.id === activeDocument) || availableDocuments[0];
  if (!currentDocument) {
    return (
      <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-2xl px-6 py-20">
        <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
          <h1 className="text-3xl font-black tracking-tight text-white">접근 가능한 평가가 없습니다</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#86868b]">
            {memberName}님 계정에는 현재 표시할 평가 문서가 배정되어 있지 않습니다.
          </p>
        </section>
      </div>
    );
  }

  const currentAttempt = documentAttempts[currentDocument.id] || createInitialAttempts(availableDocuments)[currentDocument.id];
  const evaluationTrackLabel = evaluationTrack ? EVALUATION_TRACK_LABELS[evaluationTrack] : "미배정";
  const locked = currentAttempt.status !== "running";
  const currentAnswer = answers[currentDocument.id] || createEmptyAnswer();
  const currentPdfPath = currentAttempt.status === "ended" ? currentDocument.solutionPdfPath : currentDocument.pdfPath;
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
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-7xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
            <h1 className="text-3xl font-black tracking-tight text-white">평가 페이지</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
              {memberName}님 인증 세션입니다. {evaluationTrackLabel} 평가만 표시됩니다.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
            <p className="text-xs font-semibold text-[#86868b]">남은 시간</p>
            <p className={`mt-1 font-mono text-2xl font-black ${currentAttempt.remainingSeconds <= 300 ? "text-red-300" : "text-white"}`}>
              {formatTime(currentAttempt.remainingSeconds)}
            </p>
          </div>
        </div>

        {currentAttempt.status === "ready" && (
          <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
            현재 선택된 문서의 평가를 시작하면 타이머가 작동합니다. 문서별로 풀이를 종료할 수 있습니다.
          </div>
        )}
        {currentAttempt.status === "ended" && (
          <div className="mt-6 rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-100">
            현재 문서의 풀이가 종료되어 답안 입력이 잠겼습니다. 문제 PDF 대신 정답 및 해설 PDF가 표시됩니다.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {currentAttempt.status === "ready" && (
            <button
              type="button"
              onClick={() => startEvaluation(currentDocument.id)}
              className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200"
            >
              {currentDocument.title} 시작
            </button>
          )}
          {currentAttempt.status === "running" && (
            <button
              type="button"
              onClick={() => endEvaluation(currentDocument.id)}
              className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              {currentDocument.title} 풀이 종료
            </button>
          )}
        </div>

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] lg:sticky lg:top-20">
            <div className="flex border-b border-white/10">
              {availableDocuments.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setActiveDocument(document.id)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                    activeDocument === document.id ? "bg-white/[0.08] text-white" : "text-[#86868b] hover:text-white"
                  }`}
                >
                  <span className="block">{document.title}</span>
                  <span className="mt-1 block text-[11px] font-medium text-white/45">{getAttemptLabel(documentAttempts[document.id]?.status || "ready")}</span>
                </button>
              ))}
            </div>
            <div className="h-[68svh] min-h-[460px] max-h-[700px] p-2">
              {currentPdfPath ? (
                <iframe title={currentDocument.title} src={currentPdfPath} className="h-full w-full rounded-md border border-white/10 bg-white" />
              ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed border-white/15 bg-black/25 px-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{currentDocument.title} PDF 준비 중</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
                      PDF 파일을 받으면 이 영역에 문서 뷰어가 표시됩니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 lg:h-[68svh] lg:max-h-[700px] lg:min-h-[460px] lg:overflow-y-auto">
            <h2 className="text-lg font-bold text-white">답안 작성</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#86868b]">{currentDocument.title} 답안</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/85">이름</span>
                <input
                  value={currentAnswer.applicantName}
                  onChange={(event) => updateApplicantField(currentDocument.id, "applicantName", event.target.value)}
                  disabled={locked}
                  placeholder="응시자 이름"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/85">날짜</span>
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
              <h3 className="text-sm font-bold text-white/90">1~10번 객관식 답안</h3>
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
              <h3 className="text-sm font-bold text-white/90">11~14번 단답 / 서술형</h3>
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
              <h3 className="text-sm font-bold text-white/90">15~18번 객관식 답안</h3>
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
              <h3 className="text-sm font-bold text-white/90">19~20번 단답 / 서술형</h3>
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
  return (
    <fieldset disabled={locked} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 disabled:opacity-55">
      <legend className="px-1 text-xs font-bold text-white/80">{question.number}번</legend>
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
  return (
    <label className="block rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <span className="mb-2 block text-xs font-bold text-white/80">{question.number}번</span>
      <textarea
        value={value}
        onChange={(event) => onChange(documentId, question.number, event.target.value)}
        disabled={locked}
        rows={question.number >= 19 ? 5 : 3}
        placeholder={locked ? "평가 시작 후 입력할 수 있습니다." : "답안을 입력하세요."}
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

function getAttemptLabel(status: WorkspaceStatus) {
  if (status === "running") return "풀이 중";
  if (status === "ended") return "해설 확인";
  return "대기";
}
