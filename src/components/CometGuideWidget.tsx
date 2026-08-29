"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { CometProductionLogo } from "@/components/logos/CometLogo";
import { isChromelessRoute } from "@/lib/chromeless-routes";

type Message = { role: "user" | "assistant"; content: string };

export default function CometGuideWidget() {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setSending(true);
    try {
      const res = await fetch("/api/comet-guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("답변을 불러오지 못했어요.", "Couldn't get a reply."));
        return;
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setError(t("네트워크 연결을 확인해 주세요.", "Please check your connection."));
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, t]);

  if (isChromelessRoute(pathname)) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute bottom-16 left-0 w-[min(340px,calc(100vw-2.5rem))] rounded-2xl border border-indigo-400/20 bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            style={{ height: "min(460px, 70vh)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] shrink-0">
              <CometProductionLogo size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-tight">{t("COMET 안내", "COMET Guide")}</p>
                <p className="text-[10px] text-white/35 leading-tight">{t("궁금한 점을 물어보세요", "Ask me anything")}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("닫기", "Close")}
                className="w-6 h-6 flex items-center justify-center rounded-full text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5">
              {messages.length === 0 && (
                <div className="text-center px-2 py-6">
                  <p className="text-[13px] text-white/45 leading-relaxed">
                    {t("COMET PRODUCTION에 대해 궁금한 점을 물어보세요.", "Ask anything about COMET PRODUCTION.")}
                  </p>
                  <p className="text-[11px] text-white/25 mt-2">
                    {t("예: 채용 중인 포지션이 있나요?", "e.g. Are there any open positions?")}
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-indigo-500/30 text-white rounded-br-sm border border-indigo-500/30"
                      : "bg-white/[0.06] text-white/85 rounded-bl-sm border border-white/[0.06]"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/[0.06] text-white/40 text-[13px]">
                    …
                  </div>
                </div>
              )}
              {error && <p className="text-[11px] text-red-400/80 px-1">{error}</p>}
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-white/[0.08] shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder={t("메시지 입력…", "Type a message…")}
                  rows={1}
                  maxLength={500}
                  className="flex-1 resize-none bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 max-h-24 transition"
                  style={{ fontSize: "16px", overflowY: "auto" }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  aria-label={t("보내기", "Send")}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500/80 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition text-sm"
                >
                  ↑
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("COMET 안내 닫기", "Close COMET Guide") : t("COMET 안내 열기", "Open COMET Guide")}
        className="w-11 h-11 rounded-full bg-[#0a0a14]/90 hover:bg-[#12122080] backdrop-blur-sm border border-indigo-400/25 text-white flex items-center justify-center shadow-lg shadow-indigo-500/10 transition-colors"
      >
        {open ? (
          <span className="text-white/60 text-sm">✕</span>
        ) : (
          <CometProductionLogo size={18} />
        )}
      </motion.button>
    </div>
  );
}
