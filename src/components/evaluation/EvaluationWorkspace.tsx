"use client";

import { useEffect, useState } from "react";

const DURATION_SECONDS = 60 * 60;
const STORAGE_KEY_PREFIX = "comet-evaluation-attempt";

const documents = [
  {
    id: "document-1",
    title: "평가 문서 1",
    pdfPath: "",
  },
  {
    id: "document-2",
    title: "평가 문서 2",
    pdfPath: "",
  },
];

type WorkspaceStatus = "ready" | "running" | "ended";

export default function EvaluationWorkspace({ memberName }: { memberName: string }) {
  const [status, setStatus] = useState<WorkspaceStatus>("ready");
  const [activeDocument, setActiveDocument] = useState(documents[0].id);
  const [remainingSeconds, setRemainingSeconds] = useState(DURATION_SECONDS);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const storageKey = `${STORAGE_KEY_PREFIX}:${memberName}`;

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
          answers?: Record<string, string>;
        };
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.status === "ended") {
          setStatus("ended");
          setRemainingSeconds(0);
          setIsHydrated(true);
          return;
        }
        if (parsed.status === "running" && parsed.endsAt) {
          const secondsLeft = Math.max(0, Math.ceil((parsed.endsAt - Date.now()) / 1000));
          setStatus(secondsLeft > 0 ? "running" : "ended");
          setRemainingSeconds(secondsLeft);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        status,
        endsAt: status === "running" ? Date.now() + remainingSeconds * 1000 : undefined,
        answers,
      }),
    );
  }, [answers, isHydrated, remainingSeconds, status, storageKey]);

  useEffect(() => {
    if (status !== "running") return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setStatus("ended");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status]);

  const currentDocument = documents.find((document) => document.id === activeDocument) || documents[0];
  const locked = status !== "running";
  const startEvaluation = () => {
    setRemainingSeconds(DURATION_SECONDS);
    setStatus("running");
  };
  const endEvaluation = () => {
    setRemainingSeconds(0);
    setStatus("ended");
  };

  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-6xl px-6 py-20">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 p-7 backdrop-blur-xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
            <h1 className="text-3xl font-black tracking-tight text-white">평가 페이지</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
              {memberName}님 인증 세션입니다. 평가 시작 후 제한 시간이 종료되면 답안 입력이 자동으로 잠깁니다.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
            <p className="text-xs font-semibold text-[#86868b]">남은 시간</p>
            <p className={`mt-1 font-mono text-2xl font-black ${remainingSeconds <= 300 ? "text-red-300" : "text-white"}`}>
              {formatTime(remainingSeconds)}
            </p>
          </div>
        </div>

        {status === "ready" && (
          <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
            평가를 시작하면 타이머가 작동합니다. 실제 PDF 원본이 배치되면 각 문서 영역에서 바로 확인하며 답안을 작성할 수 있습니다.
          </div>
        )}
        {status === "ended" && (
          <div className="mt-6 rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-100">
            제한 시간이 종료되어 문제 풀이가 잠겼습니다.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {status === "ready" && (
            <button
              type="button"
              onClick={startEvaluation}
              className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200"
            >
              평가 시작
            </button>
          )}
          {status === "running" && (
            <button
              type="button"
              onClick={endEvaluation}
              className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              풀이 종료
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.03]">
            <div className="flex border-b border-white/10">
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setActiveDocument(document.id)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                    activeDocument === document.id ? "bg-white/[0.08] text-white" : "text-[#86868b] hover:text-white"
                  }`}
                >
                  {document.title}
                </button>
              ))}
            </div>
            <div className="min-h-[560px] p-4">
              {currentDocument.pdfPath ? (
                <iframe title={currentDocument.title} src={currentDocument.pdfPath} className="h-[560px] w-full rounded-lg border border-white/10 bg-white" />
              ) : (
                <div className="flex h-[560px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/25 px-6 text-center">
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

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-bold text-white">답안 작성</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#86868b]">문서별 답안을 작성합니다. 종료 후에는 입력할 수 없습니다.</p>

            <div className="mt-5 space-y-5">
              {documents.map((document) => (
                <label key={document.id} className="block">
                  <span className="mb-2 block text-sm font-semibold text-white/85">{document.title} 답안</span>
                  <textarea
                    value={answers[document.id] || ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [document.id]: event.target.value }))}
                    disabled={locked}
                    rows={8}
                    placeholder={locked ? "평가 시작 후 입력할 수 있습니다." : "답안을 입력하세요."}
                    className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55"
                  />
                </label>
              ))}
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
