import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeSwitcher } from "./components/theme-switcher";
import "./globals.css";

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
  const themeInitScript = `
    (() => {
      try {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = saved === "dark" || saved === "light" ? saved : (prefersDark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", theme === "dark");
      } catch {}
    })();
  `;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-background-subtle">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Glint MVP
            </Link>
            <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground-muted">
              <li>
                <Link href="/auth/login" className="hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="hover:text-foreground">
                  Analysis
                </Link>
              </li>
              <li>
                <Link href="/user" className="hover:text-foreground">
                  User
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <ThemeSwitcher />
      </body>
    </html>
  );
}
