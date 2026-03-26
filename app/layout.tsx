import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import CardNav from "../components/CardNav";
import { ThemeSwitcher } from "../components/theme-switcher";
import "./globals.css";
import { cn } from "@/lib/utils";
import ScrollHeader from "@/components/ScrollHeader";

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
  const navItems = [
    {
      label: "Account",
      bgColor: "#2A1E0F",
      textColor: "#FAEFD9",
      links: [
        { label: "Login", href: "/auth/login", ariaLabel: "Go to login" },
        { label: "User", href: "/user", ariaLabel: "Go to user dashboard" },
      ],
    },
    {
      label: "Analysis",
      bgColor: "#3A2A18",
      textColor: "#FAEFD9",
      links: [
        { label: "Run analysis", href: "/analysis", ariaLabel: "Run analysis" },
        { label: "About", href: "/#about", ariaLabel: "Go to about section" },
      ],
    },
    {
      label: "Contact",
      bgColor: "#E8A736",
      textColor: "#2A1E0F",
      links: [
        { label: "Landing contact", href: "/#contact", ariaLabel: "Go to contact section" },
        { label: "Contact page", href: "/contact", ariaLabel: "Go to contact page" },
      ],
    },
  ];

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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <ScrollHeader className="border-b border-border bg-background-subtle">
          <CardNav
            logo="/next.svg"
            logoAlt="Glint logo"
            items={navItems}
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
        <ThemeSwitcher />
      </body>
    </html>
  );
}
