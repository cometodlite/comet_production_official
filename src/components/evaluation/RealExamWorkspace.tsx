"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExamQuestionData } from "@/lib/evaluation/exam-types";
import type { ExamScheduleConfig } from "@/lib/evaluation-schedule";
import { useLang } from "@/context/LanguageContext";
import { submitRealExamScore } from "@/app/actions/evaluation";
import PeriodCountdownBanner from "./PeriodCountdownBanner";

const DURATION_SECONDS = 50 * 60;
const STORAGE_KEY_PREFIX = "comet-real-exam-attempt";

type WorkspaceStatus = "ready" | "running" | "ended";

const CIRCLE_LABELS = ["①", "②", "③", "④", "⑤"] as const;

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateQuestionOrder(questions: ExamQuestionData[]): string[] {
  const mc = questions.filter((q) => !q.fixedLast).map((q) => q.id);
  const fixed = questions.filter((q) => q.fixedLast).map((q) => q.id);
  return [...shuffleArray(mc), ...fixed];
}

/**
 * 각 객관식 문항의 선택지 표시 순서를 무작위로 생성합니다.
 * choiceOrders[qId] = [원본인덱스0, 원본인덱스1, ...] 형태로,
 * displayIdx번째 자리에 표시할 원본 선택지의 인덱스를 담습니다.
 */
function generateChoiceOrders(questions: ExamQuestionData[]): Record<string, number[]> {
  const orders: Record<string, number[]> = {};
  for (const q of questions) {
    if (q.type === "choice" && q.choices) {
      orders[q.id] = shuffleArray([0, 1, 2, 3, 4]);
    }
  }
  return orders;
}

// ── 문항 네비게이션 바 ─────────────────────────────────────────────────────────
function QuestionNavBar({
  questionOrder,
  questions,
  responses,
  status,
  currentQId,
}: {
  questionOrder: string[];
  questions: ExamQuestionData[];
  responses: Record<string, string>;
  status: WorkspaceStatus;
  currentQId: string | null;
}) {
  const answeredCount = questionOrder.filter((qId) => Boolean(responses[qId]?.trim())).length;
  const total = questionOrder.length;

  return (
    <div className="sticky top-16 z-20 -mx-5 border-b border-white/10 bg-black/85 backdrop-blur-xl lg:-mx-8">
      <div className="flex items-center gap-3 px-5 py-2.5 lg:px-8">
        {/* 문항 번호 버튼 목록 */}
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {questionOrder.map((qId, index) => {
            const question = questions.find((q) => q.id === qId);
            if (!question) return null;
            const isWritten = question.type === "written";
            const answered = Boolean(responses[qId]?.trim());
            const isCurrent = qId === currentQId;

            let cls = "";
            if (status === "ended") {
              if (isWritten) {
                cls = answered
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-200"
                  : "border-white/10 bg-white/[0.04] text-white/25";
              } else {
                const correct = answered && responses[qId] === question.correctAnswer;
                if (!answered) cls = "border-amber-400/25 bg-amber-500/[0.08] text-amber-300/50";
                else if (correct) cls = "border-emerald-400/35 bg-emerald-500/15 text-emerald-300";
                else cls = "border-red-400/35 bg-red-500/[0.12] text-red-300";
              }
            } else {
              // running
              cls = answered
                ? "border-indigo-400/45 bg-indigo-500/20 text-indigo-200"
                : "border-white/10 bg-white/[0.04] text-white/35";
            }

            return (
              <button
                key={qId}
                type="button"
                title={`${index + 1}번${isWritten ? " (서술형)" : ""}`}
                onClick={() => {
                  document
                    .getElementById(`real-q-${qId}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`
                  relative rounded border px-1.5 py-0.5 text-[10px] font-bold transition
                  ${cls}
                  ${isCurrent ? "ring-2 ring-white/55 ring-offset-1 ring-offset-black" : ""}
                `}
              >
                {index + 1}
                {isWritten && (
                  <span className="absolute -right-1 -top-1 text-[7px] text-amber-400">★</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 응답 진행 현황 */}
        <div className="flex-shrink-0 text-right">
          <p className="text-[10px] font-semibold text-[#86868b]">
            <span className={answeredCount === total ? "text-emerald-400" : "text-white/70"}>
              {answeredCount}
            </span>
            <span className="text-white/20"> / {total}</span>
          </p>
          <p className="text-[9px] text-white/20">응답</p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-[2px] bg-white/[0.05]">
        <div
          className="h-full bg-indigo-400/50 transition-all duration-300"
          style={{ width: `${total > 0 ? (answeredCount / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function RealExamWorkspace({
  memberName,
  evaluationTrack,
  questions,
  documentId,
  documentTitle,
  scheduleConfig,
}: {
  memberName: string;
  evaluationTrack?: string;
  questions: ExamQuestionData[];
  documentId: string;
  documentTitle: string;
  scheduleConfig?: ExamScheduleConfig;
}) {
  const { t, lang } = useLang();
  const storageKey = `${STORAGE_KEY_PREFIX}:${memberName}:${evaluationTrack ?? "unassigned"}:${documentId}`;

  // ── Core exam state ──────────────────────────────────────────────────────────
  const [questionOrder, setQuestionOrder] = useState<string[]>(() => generateQuestionOrder(questions));
  /** 선택지 표시 순서: qId → [원본인덱스 배열]. 응시자마다 다르게 섞임. */
  const [choiceOrders, setChoiceOrders] = useState<Record<string, number[]>>(() => generateChoiceOrders(questions));
  const [status, setStatus] = useState<WorkspaceStatus>("ready");
  const [remainingSeconds, setRemainingSeconds] = useState(DURATION_SECONDS);
  const [endsAt, setEndsAt] = useState<number | undefined>(undefined);
  const [applicantName, setApplicantName] = useState("");
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().slice(0, 10));
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const submittedRef = useRef(false);

  // ── Anti-cheat state ─────────────────────────────────────────────────────────
  const [leaveCount, setLeaveCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [pastedIds, setPastedIds] = useState<string[]>([]);
  const [showLeaveWarn, setShowLeaveWarn] = useState(false);

  // ── Navigation map state ─────────────────────────────────────────────────────
  const [currentQId, setCurrentQId] = useState<string | null>(null);
  const intersectingRef = useRef<Record<string, boolean>>({});

  // ── Hydrate from localStorage ────────────────────────────────────────────────
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedRaw = window.localStorage.getItem(storageKey);
      if (!savedRaw) { setIsHydrated(true); return; }
      try {
        const parsed = JSON.parse(savedRaw) as {
          status?: WorkspaceStatus;
          endsAt?: number;
          questionOrder?: string[];
          choiceOrders?: Record<string, number[]>;
          applicantName?: string;
          evaluationDate?: string;
          responses?: Record<string, string>;
          leaveCount?: number;
          pasteCount?: number;
          pastedIds?: string[];
        };

        if (parsed.applicantName !== undefined) setApplicantName(parsed.applicantName);
        if (parsed.evaluationDate) setEvaluationDate(parsed.evaluationDate);
        if (parsed.responses) setResponses(parsed.responses);
        if (typeof parsed.leaveCount === "number") setLeaveCount(parsed.leaveCount);
        if (typeof parsed.pasteCount === "number") setPasteCount(parsed.pasteCount);
        if (Array.isArray(parsed.pastedIds)) setPastedIds(parsed.pastedIds);
        // 저장된 선택지 순서 복원 (새로고침해도 동일한 순서 유지)
        if (parsed.choiceOrders && typeof parsed.choiceOrders === "object") {
          setChoiceOrders(parsed.choiceOrders);
        }

        const savedOrder =
          Array.isArray(parsed.questionOrder) && parsed.questionOrder.length === questions.length
            ? parsed.questionOrder
            : null;

        if (parsed.status === "ended") {
          if (savedOrder) setQuestionOrder(savedOrder);
          setStatus("ended");
          setRemainingSeconds(0);
          submittedRef.current = true;
        } else if (parsed.status === "running" && parsed.endsAt) {
          const remaining = Math.max(0, Math.ceil((parsed.endsAt - Date.now()) / 1000));
          if (savedOrder) setQuestionOrder(savedOrder);
          if (remaining > 0) {
            setStatus("running");
            setRemainingSeconds(remaining);
            setEndsAt(parsed.endsAt);
          } else {
            setStatus("ended");
            setRemainingSeconds(0);
          }
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setIsHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // ── Persist to localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify({
      status, endsAt, questionOrder, choiceOrders,
      applicantName, evaluationDate, responses,
      leaveCount, pasteCount, pastedIds,
    }));
  }, [status, endsAt, questionOrder, choiceOrders, applicantName, evaluationDate, responses, leaveCount, pasteCount, pastedIds, isHydrated, storageKey]);

  // ── Timer countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    const id = window.setInterval(() => {
      if (status !== "running" || !endsAt) return;
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) { setStatus("ended"); setEndsAt(undefined); }
    }, 1000);
    return () => window.clearInterval(id);
  }, [status, endsAt]);

  // ── Tab-visibility (leave) detection ────────────────────────────────────────
  useEffect(() => {
    if (status !== "running") return;
    const onVis = () => {
      if (document.hidden) { setLeaveCount((c) => c + 1); setShowLeaveWarn(false); }
      else setShowLeaveWarn(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [status]);

  // ── Auto-submit when ended ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated || status !== "ended" || submittedRef.current) return;
    submittedRef.current = true;
    submitRealExamScore({
      documentId, documentTitle,
      applicantName, evaluationDate, responses,
      leaveCount, pasteCount,
    }).catch(() => { submittedRef.current = false; });
  }, [status, isHydrated, documentId, documentTitle, applicantName, evaluationDate, responses, leaveCount, pasteCount]);

  // ── Question navigation tracking (IntersectionObserver) ─────────────────────
  useEffect(() => {
    if (status !== "running" && status !== "ended") return;
    intersectingRef.current = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const qId = entry.target.getAttribute("data-qid");
          if (qId) intersectingRef.current[qId] = entry.isIntersecting;
        });
        // 화면 상단 근처에서 교차하는 첫 번째 문항을 현재 문항으로 표시
        const firstVisible = questionOrder.find((qId) => intersectingRef.current[qId]);
        setCurrentQId(firstVisible ?? null);
      },
      // 상단 120px (메인 헤더 64px + 네비 바 ~52px) 제외, 하단 절반 제외
      { rootMargin: "-120px 0px -50% 0px", threshold: 0 },
    );

    const tid = window.setTimeout(() => {
      questionOrder.forEach((qId) => {
        const el = document.getElementById(`real-q-${qId}`);
        if (el) observer.observe(el);
      });
    }, 50);

    return () => {
      window.clearTimeout(tid);
      observer.disconnect();
    };
  }, [status, questionOrder]);

  // ── Score calculation ────────────────────────────────────────────────────────
  const mcScore = useMemo(() => {
    if (status !== "ended") return null;
    const mcQuestions = questions.filter((q) => q.type === "choice" && !q.fixedLast);
    let correct = 0;
    for (const q of mcQuestions) {
      if (responses[q.id] === q.correctAnswer) correct++;
    }
    return { correct, total: mcQuestions.length };
  }, [status, questions, responses]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const locked = status !== "running";

  const startExam = () => {
    setQuestionOrder(generateQuestionOrder(questions));
    setChoiceOrders(generateChoiceOrders(questions)); // 매 시험마다 선택지 순서 새로 섞기
    setStatus("running");
    setRemainingSeconds(DURATION_SECONDS);
    setEndsAt(Date.now() + DURATION_SECONDS * 1000);
    setLeaveCount(0); setPasteCount(0); setPastedIds([]); setShowLeaveWarn(false);
  };

  const endExam = () => {
    setStatus("ended"); setRemainingSeconds(0); setEndsAt(undefined); setShowLeaveWarn(false);
  };

  const updateResponse = (qId: string, value: string) => {
    setResponses((prev) => {
      const updates: Record<string, string> = { ...prev, [qId]: value };
      // 첫 번째 응답 시각 기록 — "_t_<qId>" 키로 시험 시작 후 경과 초수 저장
      if (value && !prev[`_t_${qId}`] && endsAt) {
        const secondsSinceStart = Math.round(
          (Date.now() - (endsAt - DURATION_SECONDS * 1000)) / 1000,
        );
        updates[`_t_${qId}`] = String(Math.max(0, secondsSinceStart));
      }
      return updates;
    });
  };

  const handlePaste = (qId: string) => {
    if (locked) return;
    setPasteCount((c) => c + 1);
    setPastedIds((prev) => prev.includes(qId) ? prev : [...prev, qId]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-2xl px-4 py-8 lg:px-6 lg:py-16">
      <section className="rounded-lg border border-white/[0.08] bg-black/40 backdrop-blur-xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 lg:p-8">
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET EVALUATION</p>
            <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">
              {t("실전 역량평가", "Real Evaluation")}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b] lg:text-sm">
              {memberName} · {documentTitle}
            </p>
            {(status === "running" || (status === "ended" && (leaveCount > 0 || pasteCount > 0))) && (
              <div className="mt-2 flex flex-wrap gap-3">
                {leaveCount > 0 && <span className={`text-[10px] font-semibold ${status === "running" ? "text-red-400/80" : "text-red-400/50"}`}>탭 이탈 {leaveCount}회</span>}
                {pasteCount > 0 && <span className={`text-[10px] font-semibold ${status === "running" ? "text-amber-400/80" : "text-amber-400/50"}`}>붙여넣기 {pasteCount}회</span>}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right lg:px-5 lg:py-4">
            <p className="text-[10px] font-semibold text-[#86868b] lg:text-xs">{t("남은 시간", "Time Left")}</p>
            <p className={`mt-0.5 font-mono text-xl font-black lg:mt-1 lg:text-2xl ${remainingSeconds <= 300 && status === "running" ? "text-red-300" : "text-white"}`}>
              {formatTime(remainingSeconds)}
            </p>
          </div>
        </div>

        <div className="p-5 lg:p-8">

          {/* ── Tab-leave warning ── */}
          {showLeaveWarn && status === "running" && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-500/[0.08] px-4 py-3">
              <span className="flex-shrink-0 text-red-400">⚠</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-200">{t("시험 중 다른 탭으로 이동했습니다.", "You navigated away during the exam.")}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-red-200/60">
                  {lang === "ko" ? `누적 이탈 횟수: ${leaveCount}회 — 이사회 검토 시 참고됩니다.` : `Total tab leaves: ${leaveCount} — Recorded for board review.`}
                </p>
              </div>
              <button type="button" onClick={() => setShowLeaveWarn(false)} className="flex-shrink-0 text-sm leading-none text-red-400/50 transition hover:text-red-300">✕</button>
            </div>
          )}

          {/* ── Score summary ── */}
          {status === "ended" && mcScore && (
            <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs font-semibold tracking-widest text-indigo-300/70">{t("채점 결과", "SCORE")}</p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-4xl font-black text-white">{mcScore.correct}</p>
                  <p className="mb-1 text-lg text-[#86868b]">/ {mcScore.total}</p>
                  <p className="mb-1 ml-auto text-sm font-semibold text-[#86868b]">{t("객관식", "MC")}</p>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${mcScore.total > 0 ? (mcScore.correct / mcScore.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-white/[0.06] px-5 py-3">
                <p className="text-[10px] font-semibold tracking-widest text-white/30">{t("감독 기록", "MONITORING")}</p>
                <span className={`text-xs font-semibold ${leaveCount > 0 ? "text-red-400/70" : "text-[#86868b]"}`}>{t("탭 이탈", "Tab leaves")}: {leaveCount}{t("회", "")}</span>
                <span className={`text-xs font-semibold ${pasteCount > 0 ? "text-amber-400/70" : "text-[#86868b]"}`}>{t("붙여넣기", "Pastes")}: {pasteCount}{t("회", "")}</span>
              </div>
              <div className="px-5 py-3 text-xs leading-relaxed text-[#86868b]">
                {t("서술형은 별도 채점 기준에 따라 이사회에서 검토됩니다.", "Written answers will be reviewed by the board with a separate rubric.")}
              </div>
            </div>
          )}

          {/* ── Status banners ── */}
          {status === "ready" && (
            <>
              {/* 오늘 실전 평가 마감까지 카운트다운 */}
              <PeriodCountdownBanner variant="compact" scheduleConfig={scheduleConfig} />
              <div className="mb-6 mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
                {t("시작 버튼을 누르면 50분 타이머가 시작됩니다. 문제 순서는 매 시험마다 무작위로 배치됩니다.", "Press Start to begin the 50-minute timer. Question order is randomized each attempt.")}
              </div>
            </>
          )}
          {status === "ended" && (
            <div className="mb-6 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-emerald-100">
              {t("시험이 종료되었습니다. 답안이 자동으로 제출되었으며, 아래에서 정답 및 해설을 확인할 수 있습니다.", "The exam has ended. Your answers have been submitted. Review answers and explanations below.")}
            </div>
          )}

          {/* ── Applicant info ── */}
          <div className="mb-7 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/85">{t("이름", "Name")}</span>
              <input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} disabled={locked} placeholder={t("응시자 이름", "Applicant Name")} className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/85">{t("날짜", "Date")}</span>
              <input type="date" value={evaluationDate} onChange={(e) => setEvaluationDate(e.target.value)} disabled={locked} className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55" />
            </label>
          </div>

          {/* ── Buttons ── */}
          <div className="mb-8 flex flex-wrap gap-3">
            {status === "ready" && (
              <button type="button" onClick={startExam} className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-200 lg:py-3">
                {t("시험 시작", "Start Exam")}
              </button>
            )}
            {status === "running" && (
              <button type="button" onClick={endExam} className="rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-red-400/50 hover:text-red-200 lg:py-3">
                {t("풀이 종료 및 제출", "Submit & End")}
              </button>
            )}
          </div>

          {/* ── Question Navigation Map ── */}
          {(status === "running" || status === "ended") && (
            <QuestionNavBar
              questionOrder={questionOrder}
              questions={questions}
              responses={responses}
              status={status}
              currentQId={currentQId}
            />
          )}

          {/* ── Questions ── */}
          <div className="mt-5 space-y-5">
            {questionOrder.map((qId, index) => {
              const question = questions.find((q) => q.id === qId);
              if (!question) return null;
              const displayNumber = index + 1;
              const value = responses[qId] ?? "";
              const hasPasted = pastedIds.includes(qId);

              if (question.type === "choice") {
                const isAnsweredCorrectly = status === "ended" && value === question.correctAnswer;
                const isAnsweredWrong = status === "ended" && value !== "" && value !== question.correctAnswer;

                return (
                  <div key={qId} id={`real-q-${qId}`} data-qid={qId} className={`scroll-mt-36 rounded-lg border p-4 lg:p-5 ${
                    status === "ended"
                      ? isAnsweredCorrectly ? "border-emerald-400/30 bg-emerald-500/[0.06]"
                        : isAnsweredWrong ? "border-red-400/30 bg-red-500/[0.06]"
                        : "border-amber-400/25 bg-amber-500/[0.05]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-[11px] font-bold text-indigo-300/70">{lang === "ko" ? `${displayNumber}번` : `Q${displayNumber}`}</p>
                      {status === "ended" && (
                        <span className={`ml-auto text-xs font-bold ${isAnsweredCorrectly ? "text-emerald-400" : isAnsweredWrong ? "text-red-400" : "text-amber-400"}`}>
                          {isAnsweredCorrectly ? t("✓ 정답", "✓ Correct") : isAnsweredWrong ? t("✗ 오답", "✗ Incorrect") : t("— 미응답", "— Unanswered")}
                        </span>
                      )}
                    </div>
                    <p className="mb-4 text-sm font-semibold leading-relaxed text-white lg:text-base">{question.text}</p>

                    <div className="space-y-2">
                      {/* 선택지 순서를 응시자마다 다르게 섞어 표시 — 정보 공유 방지 */}
                      {(choiceOrders[qId] ?? [0, 1, 2, 3, 4]).map((originalIdx, displayIdx) => {
                        const choiceText = question.choices?.[originalIdx] ?? "";
                        const cv = String(originalIdx + 1); // 원본 선택지 번호 (저장값)
                        const selected = value === cv;
                        const isCorrect = status === "ended" && cv === question.correctAnswer;
                        const isWrongSelected = status === "ended" && selected && !isCorrect;

                        let cls = "border-white/[0.08] text-white/75 hover:border-white/20 hover:bg-white/[0.04] hover:text-white";
                        let cc = "text-white/40";
                        if (status === "ended") {
                          if (isCorrect) { cls = "border-emerald-400/50 bg-emerald-500/15 text-white"; cc = "text-emerald-400"; }
                          else if (isWrongSelected) { cls = "border-red-400/50 bg-red-500/15 text-white/60"; cc = "text-red-400"; }
                          else { cls = "cursor-not-allowed border-white/[0.05] text-white/30"; cc = "text-white/20"; }
                        } else if (selected) { cls = "border-indigo-400/60 bg-indigo-500/15 text-white"; cc = "text-indigo-300"; }
                        else if (locked) { cls = "cursor-not-allowed border-white/[0.06] text-white/40"; }

                        return (
                          <label key={originalIdx} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition ${cls}`}>
                            <input type="radio" name={`real-q-${qId}`} value={cv} checked={selected} onChange={() => !locked && updateResponse(qId, cv)} disabled={locked} className="sr-only" />
                            <span className={`flex-shrink-0 font-bold ${cc}`}>{CIRCLE_LABELS[displayIdx]}</span>
                            <span className="leading-relaxed">{choiceText}</span>
                            {status === "ended" && isCorrect && <span className="ml-auto flex-shrink-0 text-[10px] font-black text-emerald-400">{t("정답", "ANSWER")}</span>}
                          </label>
                        );
                      })}
                    </div>

                    {status === "ended" && question.explanation && (
                      <details className="mt-4 rounded-lg border border-white/[0.07] bg-black/20">
                        <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-[#86868b] hover:text-white">{t("해설 보기", "View Explanation")}</summary>
                        <p className="border-t border-white/[0.07] px-4 py-3 text-xs leading-relaxed text-white/65">{question.explanation}</p>
                      </details>
                    )}
                  </div>
                );
              }

              // Written
              return (
                <div key={qId} id={`real-q-${qId}`} data-qid={qId} className="scroll-mt-36 rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-[11px] font-bold text-indigo-300/70">
                      {lang === "ko" ? `${displayNumber}번` : `Q${displayNumber}`}
                      <span className="ml-2 font-medium text-white/30">{t("서술형", "Essay")}</span>
                    </p>
                    {hasPasted && !locked && <span className="ml-auto text-[10px] font-semibold text-amber-400/70">{t("붙여넣기 사용됨", "Paste used")}</span>}
                  </div>
                  <p className="mb-4 text-sm font-semibold leading-relaxed text-white lg:text-base">{question.text}</p>
                  <div className="relative">
                    <textarea
                      value={value}
                      onChange={(e) => updateResponse(qId, e.target.value)}
                      onPaste={() => handlePaste(qId)}
                      disabled={locked}
                      rows={question.rows ?? 6}
                      placeholder={locked ? t("시험 시작 후 입력할 수 있습니다.", "Start the exam to enter your answer.") : t("답안을 입력하세요.", "Enter your answer.")}
                      className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/28 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-55"
                    />
                    {hasPasted && !locked && (
                      <span className="pointer-events-none absolute right-3 top-3 rounded border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400/70">PASTE</span>
                    )}
                  </div>
                  {status === "ended" && (
                    <div className="mt-4 space-y-2">
                      {hasPasted && <p className="text-[10px] font-semibold text-amber-400/60">{t("이 답안에 붙여넣기가 사용되었습니다.", "Paste was used for this answer.")}</p>}
                      {question.modelAnswer && (
                        <details className="rounded-lg border border-indigo-400/20 bg-indigo-500/[0.06]">
                          <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-indigo-300/70 hover:text-indigo-200">{t("모범답안 보기", "View Model Answer")}</summary>
                          <p className="border-t border-indigo-400/15 px-4 py-3 text-xs leading-relaxed text-white/65">{question.modelAnswer}</p>
                        </details>
                      )}
                      {question.explanation && (
                        <details className="rounded-lg border border-white/[0.07] bg-black/20">
                          <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-[#86868b] hover:text-white">{t("채점 포인트 보기", "View Scoring Points")}</summary>
                          <p className="border-t border-white/[0.07] px-4 py-3 text-xs leading-relaxed text-white/65">{question.explanation}</p>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {status === "running" && (
            <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
              <button type="button" onClick={endExam} className="rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-red-400/50 hover:text-red-200">
                {t("풀이 종료 및 제출", "Submit & End")}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
