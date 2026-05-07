"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-sm font-semibold text-foreground">
              Glint
            </h3>
            <p className="font-mono text-xs leading-relaxed text-foreground-muted">
              Resume intelligence for job seekers. Optimize your application
              with AI-powered analysis.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
              Product
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/analysis"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Run Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
              Legal
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/privacy"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
              Account
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/user"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <p className="font-mono text-xs text-center text-foreground-muted">
            © {new Date().getFullYear()} Glint. All rights reserved. | Built
            with care for job seekers.
          </p>
        </div>
      </div>
    </footer>
  );
}
