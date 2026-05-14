"use client";

import Link from "next/link";

const NAV = [
  {
    label: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/analysis", label: "Analysis" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms-of-service", label: "Terms of Service" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/user", label: "Dashboard" },
      { href: "/auth/login", label: "Sign In" },
      { href: "/auth/register", label: "Sign Up" },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="
          group relative inline-flex items-center gap-1.5
          font-mono text-xs text-foreground-muted
          transition-colors duration-200 hover:text-foreground
        "
      >
        <span
          className="
            opacity-0 translate-x-[-4px] transition-all duration-200
            group-hover:opacity-100 group-hover:translate-x-0
            text-primary text-[8px]
          "
          aria-hidden="true"
        >
          ✦
        </span>
        {label}
      </Link>
    </li>
  );
}

export function Footer() {
  const year = String(new Date().getFullYear());

  return (
    <footer className="relative border-t border-border overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--primary) 30%, var(--primary) 70%, transparent)",
          opacity: 0.35,
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="py-10 grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-primary text-sm" aria-hidden="true">
                ✦
              </span>
              <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
                Glint
              </span>
            </div>

            <p className="font-mono text-xs leading-[1.85] text-foreground-muted max-w-[220px]">
              Resume intelligence for job seekers. Three analysis engines.
              Instant clarity.
            </p>

            <Link
              href="/analysis"
              className="
                mt-1 w-fit inline-flex items-center gap-2
                rounded-lg border border-primary/40 bg-primary/5
                px-3.5 py-2 font-mono text-[11px] font-medium text-foreground
                transition-all duration-200
                hover:border-primary hover:bg-primary/15 hover:text-foreground
              "
            >
              <span className="text-primary text-[9px]">→</span>
              Try for free
            </Link>
          </div>

          {NAV.map((section) => (
            <div key={section.label} className="flex flex-col gap-4">
              <p className="font-mono text-[9px] font-semibold tracking-[0.22em] uppercase text-foreground-muted">
                {section.label}
              </p>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <FooterLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-foreground-muted">
            © {year} Glint · Resume Intelligence
          </p>

          <div className="flex items-center gap-1 font-mono text-[10px] text-foreground-muted">
            <span className="text-primary/60 text-[8px]">✦</span>
            <span>Built for job seekers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
