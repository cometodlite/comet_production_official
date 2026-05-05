"use client";

import { useLang } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold tracking-widest text-sm">COMET PRODUCTION</p>
          <p className="text-white/40 text-xs mt-1">
            {t("산하: COMET ENTERTAINERS · COMET DEVELOPS", "Subsidiaries: COMET ENTERTAINERS · COMET DEVELOPS")}
          </p>
        </div>
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} COMET PRODUCTION. {t("All rights reserved.", "All rights reserved.")}
        </p>
      </div>
    </footer>
  );
}
