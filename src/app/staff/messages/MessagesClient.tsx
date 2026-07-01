"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Conversation, Message } from "@/lib/messaging";

type StaffUser = { id: string; name: string; staffGroup: string | null };

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function groupLabel(g: string | null) {
  if (g === "entertainers") return "ENT";
  if (g === "develops") return "DEV";
  if (g === "board") return "BOD";
  return "—";
}

export default function MessagesClient({ myId, myName }: { myId: string; myName: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [loading, setLoading] = useState(true);
  const lastMsgTimeRef = useRef<string | null>(null);
  const msgsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = msgsContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json() as Conversation[];
      setConversations(data);
    }
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setMobileView("thread");
    const res = await fetch(`/api/messages/${id}`);
    if (res.ok) {
      const data = await res.json() as Message[];
      setMessages(data);
      lastMsgTimeRef.current = data.at(-1)?.createdAt ?? new Date().toISOString();
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [scrollToBottom]);

  const poll = useCallback(async () => {
    if (!selectedId) return;
    const since = lastMsgTimeRef.current ?? new Date(Date.now() - 10000).toISOString();
    const res = await fetch(`/api/messages/${selectedId}/poll?since=${encodeURIComponent(since)}`);
    if (res.ok) {
      const data = await res.json() as Message[];
      if (data.length > 0) {
        setMessages((prev) => [...prev, ...data]);
        lastMsgTimeRef.current = data.at(-1)!.createdAt;
        loadConversations();
        setTimeout(() => scrollToBottom(), 50);
      }
    }
  }, [selectedId, scrollToBottom, loadConversations]);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
    fetch("/api/staff/users").then((r) => r.json()).then((d: StaffUser[]) => setStaffUsers(d)).catch(() => {});
  }, [loadConversations]);

  useEffect(() => {
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    const t = setInterval(loadConversations, 15000);
    return () => clearInterval(t);
  }, [loadConversations]);

  async function sendMsg() {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    const res = await fetch(`/api/messages/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const msg = await res.json() as Message;
      setMessages((prev) => [...prev, msg]);
      lastMsgTimeRef.current = msg.createdAt;
      loadConversations();
      setTimeout(() => scrollToBottom(), 50);
    }
    setSending(false);
    inputRef.current?.focus();
  }

  async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      alert("이 브라우저는 웹 푸시를 지원하지 않습니다.\n(Safari 16+ macOS / iOS 16.4+ 필요)");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === "denied") {
        alert("알림이 차단되어 있습니다.\nSafari 환경설정 → 웹사이트 → 알림에서 허용해주세요.");
        return;
      }
      if (perm !== "granted") return;

      // SW 등록 후 반드시 active 상태가 될 때까지 대기 (Safari 필수)
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const readyReg = await navigator.serviceWorker.ready;

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) { alert("설정 오류: VAPID 키가 없습니다."); return; }

      const sub = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      const json = sub.toJSON();
      const endpoint = json.endpoint;
      const keys = json.keys as { p256dh: string; auth: string } | undefined;
      if (!endpoint || !keys?.p256dh || !keys?.auth) throw new Error("구독 정보가 올바르지 않습니다.");

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, keys }),
      });
      if (!res.ok) throw new Error("서버 저장 실패");
      setPushEnabled(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`알림 설정에 실패했습니다.\n${msg}`);
    }
  }

  async function openNewConvModal() {
    setSelectedMembers([]);
    setGroupName("");
    setIsGroup(false);
    setShowModal(true);
  }

  async function createConversation() {
    if (!selectedMembers.length) return;
    const body = isGroup || selectedMembers.length > 1
      ? { type: "group", name: groupName.trim() || "그룹 채팅", memberIds: selectedMembers }
      : { type: "direct", targetUserId: selectedMembers[0] };
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { id } = await res.json() as { id: string };
      setShowModal(false);
      await loadConversations();
      selectConversation(id);
    }
  }

  const selectedConv = conversations.find((c) => c.id === selectedId);

  function convDisplayName(c: Conversation) {
    if (c.type === "group") return c.name || "그룹 채팅";
    return c.members.find((m) => m.id !== myId)?.name ?? "알 수 없음";
  }

  return (
    <div className="flex h-[calc(100svh-4rem)] overflow-hidden">
      {/* ── Left: conversation list ───────────────────────── */}
      <div className={`
        flex flex-col w-full md:w-72 lg:w-80 shrink-0
        border-r border-white/[0.08] bg-black/40 backdrop-blur-xl
        ${mobileView === "thread" ? "hidden md:flex" : "flex"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.28em] text-indigo-300/80">COMET STAFF</p>
            <h2 className="text-base font-bold text-white">메시지</h2>
          </div>
          <div className="flex items-center gap-2">
            {!pushEnabled && (
              <button
                onClick={enablePush}
                title="알림 활성화"
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition text-sm"
              >
                🔔
              </button>
            )}
            <button
              onClick={openNewConvModal}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 transition text-lg leading-none"
              title="새 대화"
            >
              +
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {loading ? (
            <p className="text-center text-xs text-white/30 py-12">불러오는 중…</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-sm text-white/40">아직 대화가 없습니다.</p>
              <button onClick={openNewConvModal} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition">
                새 대화 시작 →
              </button>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-4 py-3.5 transition hover:bg-white/[0.04] ${selectedId === c.id ? "bg-indigo-500/10 border-l-2 border-indigo-500" : "border-l-2 border-transparent"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white truncate max-w-[160px]">
                    {convDisplayName(c)}
                  </span>
                  <span className="text-[10px] text-white/30 shrink-0 ml-2">
                    {c.lastMessageAt ? formatTime(c.lastMessageAt) : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {c.type === "group" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 shrink-0">그룹</span>
                  )}
                  <p className="text-xs text-white/40 truncate">
                    {c.lastMessage ? `${c.lastSender ? c.lastSender + ": " : ""}${c.lastMessage}` : "메시지 없음"}
                  </p>
                  {c.unread && (
                    <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-indigo-400" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right: message thread ─────────────────────────── */}
      <div className={`
        flex flex-col flex-1 min-w-0
        ${mobileView === "list" ? "hidden md:flex" : "flex"}
      `}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-white/40 text-sm">대화를 선택하거나 새 대화를 시작하세요.</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08] bg-black/20 shrink-0">
              <button
                className="md:hidden text-white/50 hover:text-white transition mr-1 text-lg"
                onClick={() => setMobileView("list")}
              >
                ←
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {selectedConv ? convDisplayName(selectedConv) : ""}
                </p>
                {selectedConv?.type === "group" && (
                  <p className="text-[11px] text-white/35 truncate">
                    {selectedConv.members.map((m) => m.name).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={msgsContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {messages.length === 0 && (
                <p className="text-center text-xs text-white/30 pt-12">첫 메시지를 보내보세요!</p>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === myId;
                const prevMsg = messages[i - 1];
                const showSender = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                const sameMinute = prevMsg && prevMsg.senderId === msg.senderId &&
                  msg.createdAt.slice(0, 16) === prevMsg.createdAt.slice(0, 16);

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${sameMinute ? "mt-0.5" : "mt-3"}`}>
                    {showSender && (
                      <p className="text-[11px] text-white/40 mb-1 px-1">{msg.senderName}</p>
                    )}
                    <div className="flex items-end gap-1.5">
                      {isMe && (
                        <span className="text-[10px] text-white/25 mb-0.5 shrink-0">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                      <div className={`
                        max-w-[70vw] md:max-w-[480px] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                        ${isMe
                          ? "bg-indigo-500/30 text-white rounded-br-sm border border-indigo-500/30"
                          : "bg-white/[0.07] text-white/85 rounded-bl-sm border border-white/[0.06]"}
                      `}>
                        {msg.content}
                      </div>
                      {!isMe && (
                        <span className="text-[10px] text-white/25 mb-0.5 shrink-0">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.08] bg-black/20 shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
                  }}
                  placeholder="메시지를 입력하세요… (Enter 전송, Shift+Enter 줄바꿈)"
                  rows={1}
                  className="flex-1 resize-none bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 max-h-40 transition"
                  style={{ overflowY: "auto" }}
                />
                <button
                  onClick={sendMsg}
                  disabled={!input.trim() || sending}
                  className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/80 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition text-base"
                >
                  {sending ? "…" : "↑"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── New conversation modal ────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#0a0a14] shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">새 대화 시작</h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsGroup(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${!isGroup ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40" : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:text-white/70"}`}
              >
                1:1 대화
              </button>
              <button
                onClick={() => setIsGroup(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${isGroup ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40" : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:text-white/70"}`}
              >
                그룹 채팅
              </button>
            </div>

            {isGroup && (
              <input
                type="text"
                placeholder="그룹 이름"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full mb-3 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50"
              />
            )}

            <p className="text-xs text-white/40 mb-2">대화 상대 선택 {isGroup ? "(복수 선택 가능)" : "(1명)"}</p>
            <div className="max-h-52 overflow-y-auto space-y-1 mb-5 rounded-xl border border-white/[0.08] p-2 bg-white/[0.02]">
              {staffUsers.length === 0 && (
                <p className="text-center text-xs text-white/30 py-6">다른 사원이 없습니다.</p>
              )}
              {staffUsers.map((u) => {
                const checked = selectedMembers.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (isGroup) {
                        setSelectedMembers((prev) =>
                          prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                        );
                      } else {
                        setSelectedMembers([u.id]);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${checked ? "bg-indigo-500/20 border border-indigo-500/30" : "hover:bg-white/[0.04] border border-transparent"}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition ${checked ? "bg-indigo-500 text-white" : "bg-white/10 text-white/40"}`}>
                      {checked ? "✓" : ""}
                    </div>
                    <span className="text-sm text-white flex-1 text-left">{u.name}</span>
                    <span className="text-[10px] text-white/30">{groupLabel(u.staffGroup)}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.10] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition"
              >
                취소
              </button>
              <button
                onClick={createConversation}
                disabled={!selectedMembers.length}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold text-white transition"
              >
                시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
