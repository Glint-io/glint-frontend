"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { glintToast } from "@/components/ui/toast";

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";

type Status = "idle" | "loading" | "success" | "error" | "needs-code";

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(idx: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[idx] = digit;
    onChange(next);
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !value[idx] && idx > 0)
      refs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    const next = [...value];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    onChange(next);
    refs.current[Math.min(digits.length, 5)]?.focus();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-md border border-border bg-background text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("needs-code");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ran = useRef(false);

  const code = digits.join("");

  const performVerify = useCallback(
    async (verifyCode: string) => {
      setStatus("loading");
      setErrorMsg(null);
      try {
        const res = await fetch(`${base}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ code: verifyCode }),
        });

        if (res.ok) {
          setStatus("success");
          glintToast.success({ message: "Email verified successfully." });
          setTimeout(() => router.push("/?auth=login&verified=1"), 2500);
          return;
        }

        const text = await res.text();
        let msg: string | null = null;
        try {
          const j = JSON.parse(text) as Record<string, string>;
          msg = j.message ?? j.error ?? j.title ?? j.detail ?? null;
        } catch {
          msg = text || null;
        }

        if (res.status === 400 || res.status === 410) {
          setStatus("needs-code");
          const errorMessage =
            msg ??
            "That link has expired or already been used. Enter your code below.";
          setErrorMsg(errorMessage);
          glintToast.error({ message: errorMessage });
          setDigits(Array(6).fill(""));
        } else {
          setStatus("error");
          const errorMessage = msg ?? `Verification failed (${res.status}).`;
          setErrorMsg(errorMessage);
          glintToast.error({ message: errorMessage });
        }
      } catch {
        setStatus("error");
        setErrorMsg("Could not reach the server. Is the backend running?");
        glintToast.error({
          message: "Could not reach the server. Is the backend running?",
        });
      }
    },
    [router],
  );

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const urlCode = params.get("code") ?? params.get("token");
    if (urlCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      performVerify(urlCode);
    }
  }, [params, performVerify]);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) {
      setErrorMsg("Enter all 6 digits.");
      return;
    }
    setIsSubmitting(true);
    await performVerify(code);
    setIsSubmitting(false);
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner />
        <p className="text-sm text-foreground-muted">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
          <svg
            className="h-7 w-7 text-green-600 dark:text-green-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Email verified!
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Redirecting you to sign in…
          </p>
        </div>
        <Link
          href="/?auth=login"
          className="text-sm font-medium text-foreground underline"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
          <svg
            className="h-7 w-7 text-red-600 dark:text-red-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">{errorMsg}</p>
        </div>
        <Link
          href="/?auth=register"
          className="text-sm font-medium text-foreground underline"
        >
          Back to register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Verify your email
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Enter the 6-digit code from your email, or use the direct link that
          was sent to you.
        </p>
      </div>

      {errorMsg && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="verify-code"
            className="mb-2 block text-sm font-medium text-foreground-muted"
          >
            Verification code
          </label>
          <OtpInput
            value={digits}
            onChange={setDigits}
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || code.length < 6}
          className="w-full"
        >
          {isSubmitting ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <p className="text-sm text-foreground-muted">
        Didn&apos;t receive an email?{" "}
        <Link
          href="/?auth=register"
          className="font-medium text-foreground underline"
        >
          Register again
        </Link>{" "}
        or{" "}
        <Link
          href="/?auth=login"
          className="font-medium text-foreground underline"
        >
          sign in
        </Link>
        .
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-10 w-10 animate-spin text-primary"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Spinner />
          </div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
