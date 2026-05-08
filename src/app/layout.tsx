import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";
import ScrollToTop from "@/components/ScrollToTop";
import LangTransition from "@/components/LangTransition";

export const metadata: Metadata = {
  metadataBase: new URL("https://comet.kenet.co.kr"),
  title: { default: "COMET PRODUCTION", template: "%s | COMET PRODUCTION" },
  description: "KE NETWORK 산하 COMET PRODUCTION — 엔터테인먼트와 개발, 두 개의 날개로 더 넓은 우주를 향해 나아갑니다.",
  openGraph: {
    siteName: "COMET PRODUCTION",
    title: "COMET PRODUCTION",
    description: "KE NETWORK 산하 COMET PRODUCTION — COMET ENTERTAINERS & COMET DEVELOPS",
    images: ["/logo-ke-comet.jpg"],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <StarField />
          <Navbar />
          <LangTransition>
            <main className="flex-1 relative z-10 pt-16">{children}</main>
          </LangTransition>
          <Footer />
          <ScrollToTop />
        </LanguageProvider>
      </body>
    </html>
  );
}
