"use client";

import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { useLang } from "@/context/LanguageContext";

// EmailJS 설정값 — 나중에 실제 값으로 교체하세요
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

export default function ContactPage() {
  const { t } = useLang();
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState("general");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const subjects = [
    { value: "general", label: t("일반 문의", "General Inquiry") },
    { value: "entertainers", label: t("COMET ENTERTAINERS 관련", "COMET ENTERTAINERS") },
    { value: "develops", label: t("COMET DEVELOPS 관련", "COMET DEVELOPS") },
    { value: "partnership", label: t("파트너십 / 협업", "Partnership / Collaboration") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus("sending");
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="glass-card p-12 text-center border border-indigo-500/30 max-w-md w-full">
          <div className="text-5xl mb-6">✦</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {t("문의가 접수되었습니다", "Inquiry Received")}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            {t("빠른 시일 내에 답변 드리겠습니다. 감사합니다.", "We will get back to you as soon as possible. Thank you.")}
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-8 px-6 py-2.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-indigo-400 transition-all text-sm"
          >
            {t("다시 문의하기", "Send Another")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">
          {t("문의", "CONTACT")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          {t("연락하기", "Get in Touch")}
        </h1>
        <p className="text-white/50 text-base">
          {t("COMET PRODUCTION 및 산하 브랜드에 대한 문의를 남겨주세요.", "Leave your inquiry about COMET PRODUCTION and its brands.")}
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-8 border border-white/10 space-y-6">
        {/* 문의 유형 (hidden field) */}
        <input type="hidden" name="subject_type" value={subject} />

        <div>
          <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">
            {t("문의 유형", "Inquiry Type")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSubject(s.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  subject === s.value
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">
            {t("이름", "Name")}
          </label>
          <input
            type="text"
            name="from_name"
            required
            placeholder={t("이름을 입력하세요", "Enter your name")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">
            {t("이메일", "Email")}
          </label>
          <input
            type="email"
            name="reply_to"
            required
            placeholder={t("이메일을 입력하세요", "Enter your email")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">
            {t("문의 내용", "Message")}
          </label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder={t("문의 내용을 입력하세요", "Enter your message")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-red-400 text-sm text-center">
            {t("전송 중 오류가 발생했습니다. 다시 시도해주세요.", "An error occurred. Please try again.")}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 animate-glow"
        >
          {status === "sending" ? t("전송 중...", "Sending...") : t("문의 보내기", "Send Inquiry")}
        </button>
      </form>
    </div>
  );
}
