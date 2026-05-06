"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
      {/* 떠다니는 혜성 */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-10"
      >
        <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
          <circle cx="14" cy="26" r="7" stroke="#C8922A" strokeWidth="2" fill="none"/>
          <circle cx="14" cy="26" r="3" fill="#C8922A" opacity="0.6"/>
          <line x1="19" y1="21" x2="36" y2="6" stroke="#C8922A" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="21" y1="19" x2="37" y2="9" stroke="#C8922A" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
          <line x1="22" y1="17" x2="37" y2="12" stroke="#C8922A" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="text-8xl md:text-[10rem] font-black tracking-tight mb-4 gradient-text leading-none">
          404
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="text-white/60 text-lg mb-2">
          이 페이지는 우주 어딘가에서 길을 잃었습니다.
        </p>
        <p className="text-white/30 text-sm tracking-widest italic mb-10">
          This page got lost somewhere in the universe.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          href="/"
          className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 rounded-full border border-white/20 hover:border-indigo-400 text-white/70 hover:text-white font-medium transition-all"
        >
          문의하기
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-white/15 text-xs tracking-[0.4em]"
      >
        COMET PRODUCTION
      </motion.p>
    </div>
  );
}
