import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import AuthAwareNav from "../components/AuthAwareNav";
import { ThemeToggle } from "../components/ThemeToggle";
import { Footer } from "../components/Footer";
import "./globals.css";
import { cn } from "@/lib/utils";
import ScrollHeader from "@/components/ScrollHeader";
import AuthModal from "@/components/AuthModal";
import { ClientProviders } from "@/components/ClientProviders";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glint MVP",
  description: "MVP frontend for CV and job ad analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-mono",
        jetbrainsMono.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className="relative min-h-dvh flex flex-col bg-background text-foreground"
      >
        <ClientProviders>
          <ScrollHeader className="border-b border-border bg-background-subtle">
            <AuthAwareNav
              logo="/next.svg"
              logoAlt="Glint logo"
              // Use CSS variables so header adapts to light/dark themes
              baseColor="var(--foreground)"
              menuColor="var(--foreground)"
              buttonBgColor="var(--primary)"
              buttonTextColor="var(--primary-fg)"
              ease="power3.out"
            />
          </ScrollHeader>
          <main className="mx-auto flex flex-col w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
          <AuthModal />
          <div className="fixed bottom-4 right-4 z-50 hidden md:block">
            <ThemeToggle />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
