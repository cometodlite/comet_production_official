"use client";

import { usePathname } from "next/navigation";
import { isChromelessRoute } from "@/lib/chromeless-routes";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chromeless = isChromelessRoute(pathname);

  return (
    <main className={chromeless ? "flex-1 relative z-10" : "flex-1 relative z-10 pt-16"}>
      {children}
    </main>
  );
}
