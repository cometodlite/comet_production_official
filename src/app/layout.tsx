import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";

export const metadata: Metadata = {
  title: "COMET PRODUCTION",
  description: "COMET PRODUCTION — COMET ENTERTAINERS & COMET DEVELOPS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <StarField />
          <Navbar />
          <main className="flex-1 relative z-10 pt-16">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
