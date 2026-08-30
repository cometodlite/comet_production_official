"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ACISTANT_DEFAULT_MODEL,
  ACISTANT_MODELS,
  ACISTANT_MODEL_LABELS,
  isAcistantModel,
  type AcistantModel,
} from "@/lib/acistant-models";
import Markdown from "./Markdown";

type Msg = { role: "user" | "assistant"; content: string };
type Convo = { id: string; title: string; messages: Msg[]; updatedAt: number };

const STORE_KEY = "acistant:v1";
const MODEL_KEY = "acistant:model";
const MAX_INPUT = 16_000;

const EXAMPLES = [
  "이 함수의 시간복잡도를 알려주고 더 빠르게 개선해줘",
  "Next.js 16 App Router에서 스트리밍 응답 route handler 예시",
  "이 스택트레이스가 왜 나는지 설명해줘",
  "TypeScript 제네릭으로 타입 안전한 이벤트 이미터 만들기",
];

function loadConvos(): Convo[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Convo =>
        !!c && typeof c === "object" && typeof c.id === "string" && Array.isArray(c.messages)
    );
  } catch {
    return [];
  }
}

function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 40 ? `${clean.slice(0, 40)}…` : clean || "새 대화";
}

export default function AcistantApp() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState<AcistantModel>(ACISTANT_DEFAULT_MODEL);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setConvos(loadConvos());
    const savedModel = localStorage.getItem(MODEL_KEY);
    if (isAcistantModel(savedModel)) setModel(savedModel);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(convos.slice(0, 50)));
      } catch {
        /* 용량 초과 등 무시 */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [convos, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(MODEL_KEY, model);
  }, [model, hydrated]);

  const active = convos.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
  }, [input]);

  const patchActive = useCallback(
    (id: string, updater: (c: Convo) => Convo) => {
      setConvos((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    },
    []
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setError("");

    const existingId = activeId && active ? activeId : null;
    const convoId = existingId ?? crypto.randomUUID();
    const baseMessages: Msg[] = existingId ? messages : [];

    if (!existingId) {
      const fresh: Convo = { id: convoId, title: titleFrom(text), messages: [], updatedAt: Date.now() };
      setConvos((prev) => [fresh, ...prev]);
      setActiveId(convoId);
    }

    const withUser: Msg[] = [...baseMessages, { role: "user", content: text }];
    patchActive(convoId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? titleFrom(text) : c.title,
      messages: [...withUser, { role: "assistant", content: "" }],
      updatedAt: Date.now(),
    }));

    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/acistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: withUser, model }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "응답을 불러오지 못했어요.");
        patchActive(convoId, (c) => ({ ...c, messages: c.messages.slice(0, -1) }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        patchActive(convoId, (c) => {
          const next = c.messages.slice();
          next[next.length - 1] = { role: "assistant", content: acc };
          return { ...c, messages: next, updatedAt: Date.now() };
        });
      }

      if (!acc.trim()) {
        setError("답변을 생성하지 못했어요. 다시 시도해 주세요.");
        patchActive(convoId, (c) => ({ ...c, messages: c.messages.slice(0, -1) }));
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        patchActive(convoId, (c) => {
          const next = c.messages.slice();
          const lastMsg = next[next.length - 1];
          if (lastMsg?.role === "assistant" && !lastMsg.content.trim()) next.pop();
          return { ...c, messages: next };
        });
      } else {
        setError("네트워크 연결을 확인해 주세요.");
        patchActive(convoId, (c) => ({ ...c, messages: c.messages.slice(0, -1) }));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, activeId, active, messages, model, patchActive]);

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    stop();
    setActiveId(null);
    setError("");
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const deleteConvo = (id: string) => {
    setConvos((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const sorted = [...convos].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-[100svh] w-full overflow-hidden bg-[#050507] text-white">
      {/* ── 사이드바 ── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.08] bg-[#0a0a10] transition-transform md:relative md:translate-x-0`}
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <AcistantMark />
          <span className="text-sm font-bold tracking-tight">ACistant</span>
        </div>

        <div className="px-3">
          <button
            onClick={newChat}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-[13px] text-white/80 transition hover:bg-white/[0.07]"
          >
            + 새 대화
          </button>
        </div>

        <div className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
          {sorted.length === 0 && (
            <p className="px-2 py-4 text-[12px] text-white/30">아직 대화가 없어요.</p>
          )}
          {sorted.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg px-2 ${
                c.id === activeId ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
              }`}
            >
              <button
                onClick={() => {
                  setActiveId(c.id);
                  setSidebarOpen(false);
                }}
                className="flex-1 truncate py-2 text-left text-[13px] text-white/70"
              >
                {c.title}
              </button>
              <button
                onClick={() => deleteConvo(c.id)}
                aria-label="대화 삭제"
                className="ml-1 shrink-0 rounded px-1.5 text-white/25 opacity-0 transition hover:text-white/70 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.08] px-4 py-3">
          <Link href="/" className="text-[11px] text-white/35 transition hover:text-white/60">
            ← COMET PRODUCTION
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          aria-label="사이드바 닫기"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* ── 메인 ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="사이드바 열기"
            className="rounded-md p-1.5 text-white/60 transition hover:bg-white/10 md:hidden"
          >
            ☰
          </button>
          <div className="flex-1 truncate text-[13px] font-medium text-white/70">
            {active ? active.title : "새 대화"}
          </div>
          <label className="sr-only" htmlFor="acistant-model">
            모델 선택
          </label>
          <select
            id="acistant-model"
            value={model}
            onChange={(e) => setModel(e.target.value as AcistantModel)}
            className="rounded-lg border border-white/10 bg-[#0a0a10] px-2.5 py-1.5 text-[12px] text-white/70 focus:border-[#6C7CFF]/50 focus:outline-none"
          >
            {ACISTANT_MODELS.map((m) => (
              <option key={m} value={m}>
                {ACISTANT_MODEL_LABELS[m]}
              </option>
            ))}
          </select>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.length === 0 ? (
              <div className="mt-[12vh] text-center">
                <div className="mx-auto mb-5 w-fit">
                  <AcistantMark size={40} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">무엇을 만들어 볼까요?</h1>
                <p className="mt-2 text-[13px] text-white/40">
                  코드 작성·디버깅·리뷰를 도와드려요. 코드를 붙여넣으면 더 정확합니다.
                </p>
                <div className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        setInput(ex);
                        inputRef.current?.focus();
                      }}
                      className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3 text-left text-[12.5px] text-white/60 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                    {m.role === "user" ? (
                      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm border border-[#6C7CFF]/25 bg-[#6C7CFF]/15 px-3.5 py-2.5 text-[14px] leading-relaxed">
                        {m.content}
                      </div>
                    ) : m.content ? (
                      <Markdown text={m.content} />
                    ) : (
                      <div className="flex gap-1 py-1 text-white/40">
                        <Dot /> <Dot /> <Dot />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300/90">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* ── 입력 ── */}
        <div className="border-t border-white/[0.08] px-4 py-3">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-white/12 bg-[#0c0c14] px-3 py-2 focus-within:border-[#6C7CFF]/50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="코딩 질문을 입력하세요. 코드는 그대로 붙여넣어도 돼요. (Shift+Enter 줄바꿈)"
                className="max-h-48 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-white placeholder-white/25 focus:outline-none"
                style={{ fontSize: "16px" }}
              />
              {streaming ? (
                <button
                  onClick={stop}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-[12px] text-white/70 transition hover:bg-white/10"
                >
                  중지
                </button>
              ) : (
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  aria-label="보내기"
                  className="shrink-0 rounded-lg bg-[#6C7CFF] px-3 py-1.5 text-[13px] font-semibold text-white transition enabled:hover:bg-[#7d8bff] disabled:opacity-30"
                >
                  ↑
                </button>
              )}
            </div>
            <p className="mt-1.5 px-1 text-center text-[11px] text-white/25">
              ACistant는 실수할 수 있어요. 중요한 코드는 직접 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AcistantMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="14" cy="26" r="7" stroke="#6C7CFF" strokeWidth="2" />
      <line x1="19" y1="21" x2="36" y2="6" stroke="#6C7CFF" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="21" y1="19" x2="37" y2="9" stroke="#6C7CFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="22" y1="17" x2="37" y2="12" stroke="#6C7CFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />;
}
