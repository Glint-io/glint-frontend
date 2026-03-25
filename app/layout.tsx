import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Glint MVP
            </Link>
            <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
              <li>
                <Link href="/" className="hover:text-slate-950">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-slate-950">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/user" className="hover:text-slate-950">
                  User
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="hover:text-slate-950">
                  Analysis
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-950">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
