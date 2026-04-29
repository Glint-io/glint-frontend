"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { setAuth } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";

// ─── API config ────────────────────────────────────────────────────────────────
const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

const ep = {
  register: `${base}/auth/register`,
  verifyEmail: `${base}/auth/verify-email`,
  resend: `${base}/auth/resend-verification`,
  login: `${base}/auth/login`,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
type ErrorPayload = { message?: string; error?: string; title?: string; detail?: string };

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as ErrorPayload;
  return p.message ?? p.error ?? p.title ?? p.detail ?? null;
}

async function apiPost(
  url: string,
  body: object
): Promise<{ ok: boolean; message: string | null; status: number; data: unknown }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text || null; }
    return { ok: res.ok, message: extractMessage(data), status: res.status, data };
  } catch {
    return { ok: false, message: "Could not reach the server. Is the backend running?", status: 0, data: null };
  }
}

// ─── OTP Input ─────────────────────────────────────────────────────────────────
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

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[idx] && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...value];
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(digits.length, 5)]?.focus();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-md border border-border bg-background text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
        />
      ))}
    </div>
  );
}

// ─── OTP Modal ─────────────────────────────────────────────────────────────────
function OtpModal({
  email,
  password,
  onSuccess,
  onClose,
}: {
  email: string;
  password: string;
  onSuccess: (accessToken: string, refreshToken: string, payload: unknown) => void;
  onClose: () => void;
}) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const code = digits.join("");

  async function loginAfterVerify() {
    const result = await apiPost(ep.login, { email, password });
    if (!result.ok) return null;
    const d = result.data as Record<string, unknown>;
    const accessToken = String(d.accessToken ?? d.token ?? d.jwt ?? "");
    const refreshToken = String(d.refreshToken ?? "");
    return { accessToken, refreshToken, payload: d };
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (code.length < 6) { setError("Enter all 6 digits."); return; }
    setError(null);
    setIsSubmitting(true);

    const verifyResult = await apiPost(ep.verifyEmail, { code });

    if (verifyResult.ok) {
      const auth = await loginAfterVerify();
      if (auth) {
        onSuccess(auth.accessToken, auth.refreshToken, auth.payload);
      } else {
        onSuccess("", "", null);
      }
    } else {
      setError(
        verifyResult.message ??
        (verifyResult.status === 400 || verifyResult.status === 410
          ? "Invalid or expired code. Request a new one below."
          : `Verification failed (${verifyResult.status}).`)
      );
    }

    setIsSubmitting(false);
  }

  async function handleResend() {
    setIsResending(true);
    setError(null);
    setResendMsg(null);

    const result = await apiPost(ep.resend, { email });

    if (result.ok) {
      setResendMsg(`A new code has been sent to ${email}.`);
      setDigits(Array(6).fill(""));
    } else {
      setError(result.message ?? "Could not resend the code. Try again later.");
    }

    setIsResending(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-xl">
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute right-4 top-4 h-auto p-1"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </Button>

        <h2 className="text-xl font-semibold text-foreground">Verify your email</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. Enter it below.
        </p>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <OtpInput value={digits} onChange={setDigits} disabled={isSubmitting} />

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          {resendMsg && (
            <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
              {resendMsg}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || code.length < 6}
            className="w-full"
          >
            {isSubmitting ? "Verifying…" : "Confirm email"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-foreground-muted">
          Didn&apos;t receive it?{" "}
          <Button
            variant="link"
            onClick={handleResend}
            disabled={isResending}
            className="h-auto p-0 text-xs"
          >
            {isResending ? "Sending…" : "Resend code"}
          </Button>
        </p>

        <p className="mt-2 text-center text-xs text-foreground-muted">
          You can also click the link in the email to verify directly.
        </p>
      </div>
    </div>
  );
}

// ─── Register Page ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setIsSubmitting(true);
    const result = await apiPost(ep.register, { email, password });
    setIsSubmitting(false);

    if (result.ok || result.status === 201) {
      setShowOtp(true);
      return;
    }

    setError(
      result.message ??
      (result.status === 409
        ? "An account with this email already exists."
        : `Registration failed (${result.status}).`)
    );
  }

  function handleVerified(accessToken: string, refreshToken: string, payload: unknown) {
    setShowOtp(false);

    if (accessToken) {
      // Use setAuth so the nav updates immediately in the same tab
      setAuth({ accessToken, refreshToken, payload });
      router.push("/user");
      router.refresh();
    } else {
      router.push("/auth/login?verified=1");
    }
  }

  return (
    <>
      {showOtp && (
        <OtpModal
          email={email}
          password={password}
          onSuccess={handleVerified}
          onClose={() => setShowOtp(false)}
        />
      )}

      <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create account</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          We&apos;ll send a verification code to your email.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground-muted">
              Email
            </label>
            <input
              id="email" name="email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground-muted">
              Password
            </label>
            <input
              id="password" name="password" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-foreground-muted">
              Confirm password
            </label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${confirmPassword && confirmPassword !== password
                ? "border-red-400 focus:border-red-400"
                : "border-border focus:border-primary"
                }`}
              placeholder="••••••••"
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-xs text-red-500">Passwords don&apos;t match</p>
            )}
          </div>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-foreground-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}