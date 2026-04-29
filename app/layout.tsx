import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import AuthAwareNav from "../components/AuthAwareNav";
import { ThemeToggle } from "../components/ThemeToggle";
import "./globals.css";
import { cn } from "@/lib/utils";
import ScrollHeader from "@/components/ScrollHeader";
import { ThemeProvider } from "next-themes";

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollHeader className="border-b border-border bg-background-subtle">
            <AuthAwareNav
              logo="/next.svg"
              logoAlt="Glint logo"
              baseColor="#FAEFD9"
              menuColor="#2A1E0F"
              buttonBgColor="#2A1E0F"
              buttonTextColor="#FAEFD9"
              ease="power3.out"
            />
          </ScrollHeader>
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}