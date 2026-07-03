"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/hooks/useLanguage";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </LanguageProvider>
    </SessionProvider>
  );
}