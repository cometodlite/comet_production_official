"use client";

import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { useLang } from "@/context/LanguageContext";
import { FadeUp, AnimatePresence, motion } from "@/components/Motion";

const EMAILJS_SERVICE_ID = "service_h0fh8wh";
const EMAILJS_TEMPLATE_ID = "template_4x9623z";
const EMAILJS_PUBLIC_KEY = "VIQe47NTdllY1RELK";

const subjectValues = new Set(["general", "entertainers", "develops", "partnership", "staff-code"]);

function getInitialSubject(subject?: string) {
  return subject && subjectValues.has(subject) ? subject : "general";
}

export default function ContactPageClient({ initialSubject }: { initialSubject?: string }) {
  const { t } = useLang();
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState(getInitialSubject(initialSubject));
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const subjects = [
    { value: "general", label: t("일반 문의", "General Inquiry") },
    { value: "entertainers", label: t("COMET ENTERTAINERS 관련", "COMET ENTERTAINERS") },
    { value: "develops", label: t("COMET DEVELOPS 관련", "COMET DEVELOPS") },
    { value: "partnership", label: t("파트너십 / 협업", "Partnership / Collaboration") },
    { value: "staff-code", label: t("사원 가입 코드 요청", "Staff Signup Code") },
  ];

  const messagePlaceholder =
    subject === "staff-code"
      ? t(
          "소속, 역할, 회사 이메일 등 구성원 확인에 필요한 정보를 적어주세요.",
          "Please include your team, role, company email, or other staff verification details."
        )
      : t("문의 내용을 입력하세요", "Enter your message");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus("sending");
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, EMAILJS_PUBLIC_KEY);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-[#86868b] text-[11px] tracking-widest uppercase mb-4">
          {t("문의", "CONTACT")}
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          {t("연락하기", "Get in Touch")}
        </h1>
        <p className="text-[#86868b] text-base">
          {t("COMET PRODUCTION 및 산하 브랜드에 대한 문의를 남겨주세요.", "Leave your inquiry about COMET PRODUCTION and its brands.")}
        </p>
      </FadeUp>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-[50vh] flex items-center justify-center"
          >
            <div className="glass-card p-12 text-center border border-white/[0.08] max-w-md w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-5xl mb-6"
              >
                ✦
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {t("문의가 접수되었습니다", "Inquiry Received")}
              </h2>
              <p className="text-[#86868b] text-sm leading-relaxed">
                {t("빠른 시일 내에 답변 드리겠습니다. 감사합니다.", "We will get back to you as soon as possible. Thank you.")}
              </p>
              <motion.button
                onClick={() => setStatus("idle")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 px-6 py-2.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
              >
                {t("다시 문의하기", "Send Another")}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-8 border border-white/10 space-y-6">
              <input type="hidden" name="subject_type" value={subject} />

              {/* 문의 유형 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-[#86868b] text-xs tracking-widest uppercase mb-2">
                  {t("문의 유형", "Inquiry Type")}
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {subjects.map((s) => (
                    <motion.button
                      key={s.value}
                      type="button"
                      onClick={() => setSubject(s.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        subject === s.value
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* 이름 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-[#86868b] text-xs tracking-widest uppercase mb-2">
                  {t("이름", "Name")}
                </label>
                <input
                  type="text"
                  name="from_name"
                  required
                  placeholder={t("이름을 입력하세요", "Enter your name")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm"
                />
              </motion.div>

              {/* 이메일 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-[#86868b] text-xs tracking-widest uppercase mb-2">
                  {t("이메일", "Email")}
                </label>
                <input
                  type="email"
                  name="reply_to"
                  required
                  placeholder={t("이메일을 입력하세요", "Enter your email")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm"
                />
              </motion.div>

              {/* 문의 내용 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-[#86868b] text-xs tracking-widest uppercase mb-2">
                  {t("문의 내용", "Message")}
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder={messagePlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm resize-none"
                />
              </motion.div>

              {/* 개인정보 수집 동의 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-start gap-3 p-4 rounded-lg border border-white/8 bg-white/[0.02]"
              >
                <input
                  type="checkbox"
                  id="privacy-consent"
                  required
                  className="mt-0.5 w-4 h-4 accent-indigo-500 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="privacy-consent" className="text-[#86868b]/70 text-xs leading-relaxed cursor-pointer">
                  {t(
                    "개인정보 수집 및 이용에 동의합니다. 수집 항목: 이름, 이메일, 문의 내용 / 이용 목적: 문의 접수 및 답변 / 보유 기간: 문의 처리 후 3년 이내",
                    "I agree to the collection and use of personal information. Items: name, email, message / Purpose: inquiry handling and response / Retention: up to 3 years after processing"
                  )}
                  {" · "}
                  <a href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
                    {t("개인정보처리방침", "Privacy Policy")}
                  </a>
                </label>
              </motion.div>

              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {t("전송 중 오류가 발생했습니다. 다시 시도해주세요.", "An error occurred. Please try again.")}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={status === "sending"}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: status === "sending" ? 1 : 1.02 }}
                whileTap={{ scale: status === "sending" ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
              >
                {status === "sending" ? t("전송 중...", "Sending...") : t("문의 보내기", "Send Inquiry")}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
