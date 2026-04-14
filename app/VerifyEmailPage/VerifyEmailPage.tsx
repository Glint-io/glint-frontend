"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

type Status = "idle" | "loading" | "success" | "error" | "needs-code";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const ran = useRef(false);

  // ── Try auto-verify from URL param ──────────────────────────────────────────
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code") ?? params.get("token");
    if (!code) {
      setStatus("needs-code");
      return;
    }
    autoVerify(code);
  }, [params]);

  async function autoVerify(code: string) {
    setStatus("loading");
    try {
      const res = await fetch(`${base}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/auth/login?verified=1"), 2500);
      } else {
        const text = await res.text();
        let msg: string | null = null;
        try {
          const j = JSON.parse(text) as Record<string, string>;
          msg = j.message ?? j.error ?? j.title ?? j.detail ?? null;
        } catch { msg = text || null; }

        if (res.status === 400 || res.status === 410) {
          setStatus("needs-code");
          setErrorMsg(msg ?? "That link has expired or already been used. Enter your code below.");
        } else {
          setStatus("error");
          setErrorMsg(msg ?? `Verification failed (${res.status}).`);
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg("Could not reach the server. Is the backend running?");
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    setIsManualSubmitting(true);
    setErrorMsg(null);
    await autoVerify(code);
    setIsManualSubmitting(false);
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner />
        <p className="text-sm text-foreground-muted">Verifying your email…</p>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
          <svg className="h-7 w-7 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Email verified!</h2>
          <p className="mt-1 text-sm text-foreground-muted">Redirecting you to sign in…</p>
        </div>
        <Link href="/auth/login" className="text-sm font-medium text-foreground underline">
          Sign in now
        </Link>
      </div>
    );
  }

  // ── Hard error (network, server 5xx) ────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
          <svg className="h-7 w-7 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="mt-1 text-sm text-foreground-muted">{errorMsg}</p>
        </div>
        <Link href="/auth/register" className="text-sm font-medium text-foreground underline">
          Back to register
        </Link>
      </div>
    );
  }

  // ── No code in URL / expired → manual entry fallback ────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Enter verification code</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          {errorMsg ?? "Paste the 6-digit code from your email, or use the direct link that was sent to you."}
        </p>
      </div>

      {errorMsg && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-3">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg font-semibold tracking-widest text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          disabled={isManualSubmitting || manualCode.length < 6}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isManualSubmitting ? "Verifying…" : "Verify email"}
        </button>
      </form>

      <p className="text-sm text-foreground-muted">
        Didn't receive an email?{" "}
        <Link href="/auth/register" className="font-medium text-foreground underline">
          Register again
        </Link>{" "}
        or{" "}
        <Link href="/auth/login" className="font-medium text-foreground underline">
          sign in
        </Link>
        .
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-10 w-10 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// Wrapped in Suspense because useSearchParams() requires it in Next.js App Router
export default function VerifyEmailPage() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
      <Suspense fallback={<div className="flex justify-center"><Spinner /></div>}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}