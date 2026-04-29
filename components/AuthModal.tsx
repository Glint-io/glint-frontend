"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setAuth } from "@/lib/auth";
import { Eye, EyeOff, X } from "lucide-react";

type AuthMode = "login" | "register";

type OpenAuthModalDetail = {
  mode?: AuthMode;
};

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";

const ep = {
  login: `${base}/auth/login`,
  register: `${base}/auth/register`,
  verifyEmail: `${base}/auth/verify-email`,
  resend: `${base}/auth/resend-verification`,
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

function extractTokens(payload: unknown): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (!payload || typeof payload !== "object") {
    return { accessToken: null, refreshToken: null };
  }
  const p = payload as Record<string, unknown>;
  const accessToken =
    typeof (p.accessToken ?? p.token ?? p.jwt ?? p.bearerToken) === "string"
      ? String(p.accessToken ?? p.token ?? p.jwt ?? p.bearerToken)
      : null;
  const refreshToken =
    typeof p.refreshToken === "string" ? p.refreshToken : null;
  return { accessToken, refreshToken };
}

async function apiPost(
  url: string,
  body: object,
): Promise<{
  ok: boolean;
  message: string | null;
  status: number;
  data: unknown;
}> {
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
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
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
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpResendMessage, setOtpResendMessage] = useState<string | null>(null);

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
    };

    window.addEventListener("glint:open-auth-modal", onOpen as EventListener);
    return () => {
      window.removeEventListener(
        "glint:open-auth-modal",
        onOpen as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowOtp(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
        if (res.status === 403) {
          setLoginError(
            "Your email is not verified yet. Check your inbox for the verification email.",
          );
        } else if (res.status === 401) {
          setLoginError("Incorrect email or password.");
        } else {
          setLoginError(msg ?? `Login failed (${res.status}).`);
        }
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
    const accessToken = String(d.accessToken ?? d.token ?? d.jwt ?? "");
    const refreshToken = String(d.refreshToken ?? "");
    return { accessToken, refreshToken, payload: d };
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

  function closeModal() {
    setShowOtp(false);
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-xl">
        <Button
          variant="ghost"
          onClick={closeModal}
          className="absolute right-3 top-3 h-auto p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>

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
                  name="email"
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
                <label
                  htmlFor="auth-login-password"
                  className="mb-1 block text-sm font-medium text-foreground-muted"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-login-password"
                    name="password"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted transition-colors hover:text-foreground"
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
                onClick={() => {
                  setMode("register");
                  setShowRegisteredBanner(false);
                  setShowVerifiedBanner(false);
                }}
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
                  name="email"
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
                    name="password"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted transition-colors hover:text-foreground"
                    aria-label={
                      showRegisterPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
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
                    name="confirmPassword"
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                      registerConfirmPassword &&
                      registerConfirmPassword !== registerPassword
                        ? "border-red-400 focus:border-red-400"
                        : "border-border focus:border-primary"
                    }`}
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted transition-colors hover:text-foreground"
                    aria-label={
                      showRegisterConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showRegisterConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {registerError && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {registerError}
                </p>
              )}

              <Button
                type="submit"
                disabled={registerSubmitting}
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
                onClick={() => {
                  setMode("login");
                  setShowRegisteredBanner(false);
                  setShowVerifiedBanner(false);
                }}
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
