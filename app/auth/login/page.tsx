"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { setAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";
const loginEndpoint = `${base}/auth/login`;

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

function LoginBanner({
  registered,
  verified,
}: {
  registered: boolean;
  verified: boolean;
}) {
  if (!registered && !verified) return null;
  return (
    <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
      {verified
        ? "✓ Email verified! You can now sign in."
        : "✓ Account created. Check your email to verify, then sign in."}
    </p>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered") === "1";
  const verified = params.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
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
          setError(
            "Your email isn't verified yet. Check your inbox for the verification email.",
          );
        } else if (res.status === 401) {
          setError("Incorrect email or password.");
        } else {
          setError(msg ?? `Login failed (${res.status}).`);
        }
        return;
      }

      const { accessToken, refreshToken } = extractTokens(payload);
      // Use setAuth so the nav (and any other listeners) updates immediately
      setAuth({ accessToken, refreshToken, payload });

      router.push("/user");
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-foreground-muted">Welcome back.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <LoginBanner registered={registered} verified={verified} />

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-foreground-muted"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-foreground-muted"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-foreground underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
