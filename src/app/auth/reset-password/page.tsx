"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { glintToast } from "@/components/ui/toast";
import { Eye, EyeOff } from "lucide-react";

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";

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

type Step = "code" | "newPassword" | "success";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("code");
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [verifiedCode, setVerifiedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  const code = digits.join("");

  const prefillFromUrl = useCallback((urlCode: string) => {
    const chars = urlCode.slice(0, 6).split("");
    const next = Array(6).fill("");
    chars.forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const urlCode = params.get("code") ?? params.get("token");
    if (urlCode) prefillFromUrl(urlCode);
  }, [params, prefillFromUrl]);

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }

    setVerifiedCode(code);
    setStep("newPassword");
    setError(null);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${base}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifiedCode, newPassword }),
      });

      if (res.ok) {
        setStep("success");
        glintToast.success({
          message: "Password reset successfully. You can now sign in.",
        });
        setTimeout(() => router.push("/?auth=login"), 2500);
        return;
      }

      const text = await res.text();
      let msg: string | null = null;
      try {
        msg = (JSON.parse(text) as { message?: string }).message ?? null;
      } catch {}

      if (res.status === 410 || res.status === 400) {
        setStep("code");
        setDigits(Array(6).fill(""));
        const errorMessage =
          msg ?? "Code expired or invalid. Please request a new one.";
        setError(errorMessage);
        glintToast.error({ message: errorMessage });
      } else {
        const errorMessage = msg ?? "Reset failed. Please try again.";
        setError(errorMessage);
        glintToast.error({ message: errorMessage });
      }
    } catch {
      setError("Could not reach the server.");
      glintToast.error({ message: "Could not reach the server." });
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "success") {
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
            Password reset!
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

  if (step === "newPassword") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Set new password
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Choose a password with at least 8 characters.
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground-muted">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
                className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground-muted">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className={`w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${confirmPassword && confirmPassword !== newPassword ? "border-red-400" : "border-border focus:border-primary"}`}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Enter the 6-digit code from your email.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <OtpInput value={digits} onChange={setDigits} disabled={submitting} />
        <Button
          type="submit"
          disabled={submitting || code.length < 6}
          className="w-full"
        >
          Continue
        </Button>
      </form>

      <p className="text-sm text-foreground-muted">
        <Link
          href="/?auth=login"
          className="font-medium text-foreground underline"
        >
          Back to sign in
        </Link>
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

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Spinner />
          </div>
        }
      >
        <ResetPasswordInner />
      </Suspense>
    </div>
  );
}
