import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chemistry Lab",
  description: "COMET DEVELOPS의 Chemistry Lab 게임",
};

export default function ChemistryLabPage() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[#050811] px-6 py-20 sm:px-10 md:px-16 lg:px-24">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(108,124,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(108,124,255,0.07) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-14rem)] max-w-5xl flex-col justify-between border border-white/10 bg-[#080d1b]/80 p-7 backdrop-blur-sm sm:p-10 md:p-14">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-[#8da0ff]">COMET DEVELOPS / GAME</p>
          <span className="border border-[#6c7cff]/30 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-[#bbc5ff]">
            PREPARING
          </span>
        </div>

        <div className="my-16 max-w-3xl sm:my-24">
          <p className="mb-5 text-xs font-medium tracking-[0.18em] text-[#6c7cff]">CHEMISTRY LAB</p>
          <h1 className="text-5xl font-black leading-[0.94] text-white sm:text-7xl md:text-8xl">Chemistry<br />Lab</h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
            COMET의 새로운 실험 공간을 준비하고 있습니다. 게임 배포가 시작되면 이 주소에서 바로 실행할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6 text-sm">
          <p className="text-white/40">CHEMLAB / DEPLOYMENT PORTAL</p>
          <Link href="/develops" className="text-[#9aa8ff] transition-colors hover:text-white">
            COMET DEVELOPS로 이동 →
          </Link>
        </div>
      </div>
    </section>
  );
}
