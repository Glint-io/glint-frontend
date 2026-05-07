"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Mobile + Desktop Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-mono text-lg font-bold text-foreground">
              Glint
            </h3>

            <p className="max-w-xs font-mono text-sm leading-7 text-foreground-muted">
              Resume intelligence for job seekers. Optimize your applications
              with AI-powered analysis.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Product
            </h4>

            <ul className="flex flex-col gap-3">
              <FooterLink href="/" label="Home" />
              <FooterLink href="/analysis" label="Analysis" />
              <FooterLink href="/about" label="About" />
              <FooterLink href="/contact" label="Contact" />
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Legal
            </h4>

            <ul className="flex flex-col gap-3">
              <FooterLink href="/privacy" label="Privacy Policy" />
              <FooterLink href="/terms-of-service" label="Terms of Service" />
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Account
            </h4>

            <ul className="flex flex-col gap-3">
              <FooterLink href="/user" label="Profile" />
              <FooterLink href="/auth/login" label="Sign In" />
              <FooterLink href="/auth/register" label="Sign Up" />
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs leading-6 text-foreground-muted">
              © {new Date().getFullYear()} Glint. All rights reserved.
            </p>

            <p className="font-mono text-xs text-foreground-muted">
              Built with care for job seekers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="
          group inline-flex w-fit items-center
          font-mono text-sm text-foreground-muted
          transition-all duration-200
          hover:text-foreground
        "
      >
        <span className="relative">
          {label}

          <span
            className="
              absolute -bottom-1 left-0 h-px w-0
              bg-foreground transition-all duration-300
              group-hover:w-full
            "
          />
        </span>
      </Link>
    </li>
  );
}
