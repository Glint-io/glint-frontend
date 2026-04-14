/**
 * lib/auth.ts
 *
 * Central auth helpers for the Glint frontend.
 * Import these anywhere you need the access token or to make authed API calls.
 */

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

export const AUTH_KEY = "glint.auth";

export type StoredAuth = {
  accessToken: string | null;
  refreshToken: string | null;
  payload: unknown;
  loggedInAt: string;
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return getStoredAuth()?.accessToken ?? null;
}

export function clearAuth(): void {
  if (typeof window !== "undefined") localStorage.removeItem(AUTH_KEY);
}

// ─── Token refresh ────────────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { clearAuth(); return null; }
    const data = (await res.json()) as Record<string, unknown>;
    const accessToken = String(data.accessToken ?? data.token ?? "");
    const newRefresh = typeof data.refreshToken === "string" ? data.refreshToken : refreshToken;
    const stored = getStoredAuth();
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ ...stored, accessToken, refreshToken: newRefresh })
    );
    return accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

/** Refresh the access token exactly once even if called concurrently. */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const auth = getStoredAuth();
  if (!auth?.refreshToken) return Promise.resolve(null);
  refreshPromise = doRefresh(auth.refreshToken).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// ─── Authed fetch ─────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for fetch() that:
 *  1. Attaches Bearer token from localStorage
 *  2. On 401, tries a token refresh once and retries
 *  3. On second 401, clears auth (forces re-login on next page action)
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  function buildInit(token: string | null): RequestInit {
    return {
      ...init,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  }

  let token = getAccessToken();
  let res = await fetch(input, buildInit(token));

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await fetch(input, buildInit(token));
    }
    if (res.status === 401) {
      clearAuth();
    }
  }

  return res;
}

// ─── Convenience: GET / POST helpers ─────────────────────────────────────────

export async function authedGet<T = unknown>(path: string): Promise<T> {
  const res = await authedFetch(`${base}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function authedPost<T = unknown>(path: string, body?: object): Promise<T> {
  const res = await authedFetch(`${base}${path}`, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}