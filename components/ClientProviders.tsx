"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { GlintToastProvider } from "@/components/ui/toast";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <GlintToastProvider />
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
