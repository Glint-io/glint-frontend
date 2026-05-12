const base =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

export const AUTH_KEY = "glint.auth";

export type StoredAuth = {
  accessToken: string | null;
  refreshToken: string | null;
  payload: unknown;
  loggedInAt: string;
};

const base64UrlDecode = (input: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return window.atob(padded);
  } catch {
    return null;
  }
};

const extractEmail = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const candidates = [
    record.email,
    record.userEmail,
    record.username,
    record.preferred_username,
    record.upn,
    record.unique_name,
    record.name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.includes("@")) {
      return candidate;
    }
  }

  const nestedSources = [record.user, record.profile, record.data];
  for (const nestedSource of nestedSources) {
    const nestedEmail = extractEmail(nestedSource);
    if (nestedEmail) return nestedEmail;
  }

  return null;
};

const extractEmailFromAccessToken = (accessToken: string | null): string | null => {
  if (!accessToken) return null;
  const [, payloadSegment] = accessToken.split(".");
  if (!payloadSegment) return null;
  const decoded = base64UrlDecode(payloadSegment);
  if (!decoded) return null;

  try {
    return extractEmail(JSON.parse(decoded));
  } catch {
    return null;
  }
};

export const getStoredUserEmail = (): string | null => {
  const auth = getStoredAuth();
  const payloadEmail = extractEmail(auth?.payload);
  if (payloadEmail) return payloadEmail;

  return extractEmailFromAccessToken(auth?.accessToken ?? null);
};

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

export function setAuth(data: {
  accessToken: string | null;
  refreshToken: string | null;
  payload: unknown;
}): void {
  if (typeof window === "undefined") return;
  const stored: StoredAuth = { ...data, loggedInAt: new Date().toISOString() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(stored));
  window.dispatchEvent(new Event("glint:auth-change"));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("glint:auth-change"));
}

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
    setAuth({ accessToken, refreshToken: newRefresh, payload: stored?.payload ?? null });
    return accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const auth = getStoredAuth();
  if (!auth?.refreshToken) return Promise.resolve(null);
  refreshPromise = doRefresh(auth.refreshToken).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

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

export async function authedFormFetch(
  input: RequestInfo | URL,
  formData: FormData
): Promise<Response> {
  const buildInit = (token: string | null): RequestInit => ({
    method: "POST",
    body: formData,
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let token = getAccessToken();
  let res = await fetch(input, buildInit(token));

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) res = await fetch(input, buildInit(token));
    if (res.status === 401) clearAuth();
  }

  return res;
}

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