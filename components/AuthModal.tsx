"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { TermsOfServiceModal } from "@/components/TermsOfServiceModal";
import { setAuth } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "register" | "forgot";

type OpenAuthModalDetail = { mode?: AuthMode };

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";

const ep = {
  login: `${base}/auth/login`,
  register: `${base}/auth/register`,
  verifyEmail: `${base}/auth/verify-email`,
  resend: `${base}/auth/resend-verification`,
  forgotPassword: `${base}/auth/forgot-password`,
};

type ErrorPayload = {
  message?: string;
  error?: string;
  title?: string;
  detail?: string;
};

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as ErrorPayload;
  return p.message ?? p.error ?? p.title ?? p.detail ?? null;
}

function extractTokens(payload: unknown) {
  if (!payload || typeof payload !== "object")
    return { accessToken: null, refreshToken: null };
  const p = payload as Record<string, unknown>;
  const accessToken =
    typeof (p.accessToken ?? p.token ?? p.jwt ?? p.bearerToken) === "string"
      ? String(p.accessToken ?? p.token ?? p.jwt ?? p.bearerToken)
      : null;
  const refreshToken =
    typeof p.refreshToken === "string" ? p.refreshToken : null;
  return { accessToken, refreshToken };
}

async function apiPost(url: string, body: object) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }
    return {
      ok: res.ok,
      message: extractMessage(data),
      status: res.status,
      data,
    };
  } catch {
    return {
      ok: false,
      message: "Could not reach the server. Is the backend running?",
      status: 0,
      data: null,
    };
  }
}

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
    <div className="flex justify-center gap-2">
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

export function openAuthModal(mode: AuthMode = "login") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenAuthModalDetail>("glint:open-auth-modal", {
      detail: { mode },
    }),
  );
}

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showOtp, setShowOtp] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpResendMessage, setOtpResendMessage] = useState<string | null>(null);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const [showRegisteredBanner, setShowRegisteredBanner] = useState(false);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);

  const otpCode = useMemo(() => otpDigits.join(""), [otpDigits]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const event = e as CustomEvent<OpenAuthModalDetail>;
      const nextMode = event.detail?.mode ?? "login";
      setMode(nextMode);
      setIsOpen(true);
      setLoginError(null);
      setRegisterError(null);
      setForgotError(null);
      setForgotSent(false);
    };
    window.addEventListener("glint:open-auth-modal", onOpen as EventListener);
    return () =>
      window.removeEventListener(
        "glint:open-auth-modal",
        onOpen as EventListener,
      );
  }, []);

  useEffect(() => {
    const auth = searchParams.get("auth");
    const registered = searchParams.get("registered") === "1";
    const verified = searchParams.get("verified") === "1";

    if (auth === "login" || auth === "register") {
      setMode(auth);
      setIsOpen(true);
    }

    if (registered || verified) {
      setMode("login");
      setIsOpen(true);
      setShowRegisteredBanner(registered);
      setShowVerifiedBanner(verified);
    }

    if (!auth && !registered && !verified) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    params.delete("registered");
    params.delete("verified");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const res = await fetch(ep.login, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const text = await res.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text || null;
      }

      if (!res.ok) {
        const msg = extractMessage(payload);
        if (res.status === 403)
          setLoginError(
            "Your email is not verified yet. Check your inbox for the verification email.",
          );
        else if (res.status === 401)
          setLoginError("Incorrect email or password.");
        else setLoginError(msg ?? `Login failed (${res.status}).`);
        return;
      }

      const { accessToken, refreshToken } = extractTokens(payload);
      setAuth({ accessToken, refreshToken, payload });
      setIsOpen(false);
      setShowOtp(false);
      router.push("/user");
      router.refresh();
    } catch {
      setLoginError("Could not reach the server. Is the backend running?");
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegisterError(null);

    if (!agreedToPrivacy) {
      setRegisterError("Please accept the privacy policy to continue.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    if (registerPassword.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }

    setRegisterSubmitting(true);
    const result = await apiPost(ep.register, {
      email: registerEmail,
      password: registerPassword,
    });
    setRegisterSubmitting(false);

    if (result.ok || result.status === 201) {
      setOtpDigits(Array(6).fill(""));
      setOtpError(null);
      setOtpResendMessage(null);
      setShowOtp(true);
      return;
    }

    setRegisterError(
      result.message ??
        (result.status === 409
          ? "An account with this email already exists."
          : `Registration failed (${result.status}).`),
    );
  }

  async function loginAfterVerify() {
    const result = await apiPost(ep.login, {
      email: registerEmail,
      password: registerPassword,
    });
    if (!result.ok) return null;
    const d = result.data as Record<string, unknown>;
    return {
      accessToken: String(d.accessToken ?? d.token ?? d.jwt ?? ""),
      refreshToken: String(d.refreshToken ?? ""),
      payload: d,
    };
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otpCode.length < 6) {
      setOtpError("Enter all 6 digits.");
      return;
    }
    setOtpSubmitting(true);
    setOtpError(null);

    const verifyResult = await apiPost(ep.verifyEmail, { code: otpCode });

    if (verifyResult.ok) {
      const auth = await loginAfterVerify();
      setShowOtp(false);
      if (auth) {
        setAuth(auth);
        setIsOpen(false);
        router.push("/user");
        router.refresh();
      } else {
        setMode("login");
        setShowVerifiedBanner(true);
      }
    } else {
      setOtpError(
        verifyResult.message ??
          (verifyResult.status === 400 || verifyResult.status === 410
            ? "Invalid or expired code. Request a new one below."
            : `Verification failed (${verifyResult.status}).`),
      );
    }

    setOtpSubmitting(false);
  }

  async function handleResendCode() {
    setOtpResending(true);
    setOtpError(null);
    setOtpResendMessage(null);
    const result = await apiPost(ep.resend, { email: registerEmail });
    if (result.ok) {
      setOtpResendMessage(`A new code has been sent to ${registerEmail}.`);
      setOtpDigits(Array(6).fill(""));
    } else {
      setOtpError(
        result.message ?? "Could not resend the code. Try again later.",
      );
    }
    setOtpResending(false);
  }

  async function handleForgotSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForgotError(null);
    setForgotSubmitting(true);
    const result = await apiPost(ep.forgotPassword, { email: forgotEmail });
    setForgotSubmitting(false);
    if (result.ok) {
      setForgotSent(true);
    } else {
      setForgotError(
        result.message ?? "Something went wrong. Please try again.",
      );
    }
  }

  function closeModal() {
    setShowOtp(false);
    setIsOpen(false);
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setShowRegisteredBanner(false);
    setShowVerifiedBanner(false);
    setForgotSent(false);
    setForgotError(null);
    setLoginError(null);
    setRegisterError(null);
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal onClose={closeModal} aria-label="Authentication">
        {showOtp ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              Verify your email
            </h2>
            <p className="mt-2 text-sm text-foreground-muted">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">
                {registerEmail}
              </span>
              .
            </p>
            <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
              <OtpInput
                value={otpDigits}
                onChange={setOtpDigits}
                disabled={otpSubmitting}
              />
              {otpError && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {otpError}
                </p>
              )}
              {otpResendMessage && (
                <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                  {otpResendMessage}
                </p>
              )}
              <Button
                type="submit"
                disabled={otpSubmitting || otpCode.length < 6}
                className="w-full"
              >
                {otpSubmitting ? "Verifying..." : "Confirm email"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-foreground-muted">
              Did not receive it?{" "}
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={otpResending}
                className="h-auto p-0 text-xs"
              >
                {otpResending ? "Sending..." : "Resend code"}
              </Button>
            </p>
          </>
        ) : mode === "forgot" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              Reset password
            </h2>
            {forgotSent ? (
              <div className="mt-4 space-y-4">
                <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                  If that address is registered, a reset code has been sent.
                  Check your inbox.
                </p>
                <p className="text-sm text-foreground-muted">
                  Have a code?{" "}
                  <Link
                    href="/auth/reset-password"
                    onClick={closeModal}
                    className="font-medium text-foreground underline"
                  >
                    Enter it here
                  </Link>
                </p>
                <button
                  type="button"
                  className="text-sm font-medium text-foreground underline"
                  onClick={() => switchMode("login")}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-foreground-muted">
                  Enter your email and we&apos;ll send a reset code.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleForgotSubmit}>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground-muted">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                      placeholder="you@example.com"
                    />
                  </div>
                  {forgotError && (
                    <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                      {forgotError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full"
                  >
                    {forgotSubmitting ? "Sending..." : "Send reset code"}
                  </Button>
                </form>
                <p className="mt-4 text-sm text-foreground-muted">
                  <button
                    type="button"
                    className="font-medium text-foreground underline"
                    onClick={() => switchMode("login")}
                  >
                    Back to sign in
                  </button>
                </p>
              </>
            )}
          </>
        ) : mode === "login" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">Sign in</h2>
            <p className="mt-2 text-sm text-foreground-muted">Welcome back.</p>

            {(showRegisteredBanner || showVerifiedBanner) && (
              <p className="mt-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                {showVerifiedBanner
                  ? "Email verified. You can now sign in."
                  : "Account created. Check your email to verify, then sign in."}
              </p>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label
                  htmlFor="auth-login-email"
                  className="mb-1 block text-sm font-medium text-foreground-muted"
                >
                  Email
                </label>
                <input
                  id="auth-login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="auth-login-password"
                    className="text-sm font-medium text-foreground-muted"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      switchMode("forgot");
                    }}
                    className="text-xs text-foreground-muted underline hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="auth-login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                    aria-label={
                      showLoginPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {loginError}
                </p>
              )}
              <Button
                type="submit"
                disabled={loginSubmitting}
                className="w-full"
              >
                {loginSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-foreground-muted">
              Do not have an account?{" "}
              <button
                type="button"
                className="font-medium text-foreground underline"
                onClick={() => switchMode("register")}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Create account
            </h2>
            <p className="mt-2 text-sm text-foreground-muted">
              We will send a verification code to your email.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
              <div>
                <label
                  htmlFor="auth-register-email"
                  className="mb-1 block text-sm font-medium text-foreground-muted"
                >
                  Email
                </label>
                <input
                  id="auth-register-email"
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-register-password"
                  className="mb-1 block text-sm font-medium text-foreground-muted"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-register-confirm-password"
                  className="mb-1 block text-sm font-medium text-foreground-muted"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="auth-register-confirm-password"
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${registerConfirmPassword && registerConfirmPassword !== registerPassword ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"}`}
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    {showRegisterConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 rounded border-2 transition-colors flex items-center justify-center ${agreedToPrivacy ? "border-primary bg-primary" : "border-border bg-background group-hover:border-foreground-muted"}`}
                  >
                    {agreedToPrivacy && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        viewBox="0 0 10 8"
                        fill="none"
                      >
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-foreground-muted leading-relaxed select-none">
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                    className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </button>
                  .
                </span>
              </label>

              {registerError && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {registerError}
                </p>
              )}
              <Button
                type="submit"
                disabled={registerSubmitting || !agreedToPrivacy}
                className="w-full"
              >
                {registerSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-foreground-muted">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-foreground underline"
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </Modal>
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
}
