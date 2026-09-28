"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// 이 트리 아래(로그인·프로필·메시지·COMET 가이드·보안 점검 등, DB를 쓰는 모든 페이지)에서
// 서버 컴포넌트가 처리하지 못한 예외가 던져지면 여기로 온다. 그동안 이 경계가 없어서
// DB 쿼리가 실패할 때(예: Neon 사용량 한도 초과) 브라우저 기본 "This page couldn't
// load" 화면이 그대로 노출됐다 — 사용자에게 원인 없는 고장처럼 보이는 문제를 고친다.
// error는 서버 스택 정보를 담을 수 있어 화면에는 절대 그대로 보여주지 않는다.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-10"
      >
        <svg width="72" height="72" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke="#C8922A" strokeWidth="2" opacity="0.5" />
          <line x1="20" y1="12" x2="20" y2="22" stroke="#C8922A" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="27" r="1.6" fill="#C8922A" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 gradient-text">
          일시적으로 이용이 어렵습니다
        </h1>
        <p className="text-white/60 text-lg mb-2">
          서비스에 잠시 문제가 생겼습니다. 잠시 후 다시 시도해주세요.
        </p>
        <p className="text-white/30 text-sm tracking-widest italic mb-10">
          Something went wrong. Please try again in a moment.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => reset()}
          className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-8 py-3 rounded-full border border-white/20 hover:border-indigo-400 text-white/70 hover:text-white font-medium transition-all"
        >
          홈으로 돌아가기
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-white/15 text-xs tracking-[0.4em]"
      >
        COMET PRODUCTION
      </motion.p>
    </div>
  );
}
