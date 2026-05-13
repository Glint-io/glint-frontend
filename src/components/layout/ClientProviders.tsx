"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../auth/AuthProvider";
import { NotificationProvider } from "./NotificationProvider";
import { GlintToastProvider } from "../ui/toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
