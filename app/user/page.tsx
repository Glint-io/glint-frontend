"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { authedGet, authedFetch, clearAuth, AUTH_KEY } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
// Adjust these to match your actual DTO shapes once you have them.

type Statistics = {
    totalAnalyses: number;
    averageScore: number;
    // Add more fields as your backend returns them
};

type HistoryItem = {
    id: string;
    createdAt: string;
    score: number;
    resumeFileName?: string;
    jobTitle?: string;
};

type PaginatedHistory = {
    items: HistoryItem[];
    totalCount: number;
    page: number;
    pageSize: number;
};

type Resume = {
    resumeId: string;
    fileName: string;
    uploadedAt: string;
    sizeBytes?: number;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string | number;
    sub?: string;
}) {
    return (
        <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                {label}
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
            {sub && <p className="mt-1 text-xs text-foreground-muted">{sub}</p>}
        </div>
    );
}

function ScoreBadge({ score }: { score: number }) {
    const color =
        score >= 80
            ? "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30"
            : score >= 60
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
                : "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30";
    return (
        <span
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${color}`}
        >
            {score}
        </span>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="flex flex-col items-center gap-2 py-12 text-foreground-muted">
            <span className="text-4xl">{icon}</span>
            <p className="text-sm">{message}</p>
        </div>
    );
}

// ─── Resume Upload ─────────────────────────────────────────────────────────────
function ResumeUpload({ onUploaded }: { onUploaded: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const base =
        process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
        "https://localhost:7248";

    async function handleFile(file: File) {
        if (file.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File must be under 5 MB.");
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const form = new FormData();
            form.append("file", file);

            const res = await authedFetch(`${base}/user/resume`, {
                method: "POST",
                body: form,
            });

            if (res.ok) {
                onUploaded();
            } else {
                const text = await res.text();
                let msg = "Upload failed.";
                try {
                    msg = (JSON.parse(text) as { error?: string }).error ?? msg;
                } catch {
                    /* */
                }
                setError(msg);
            }
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div>
            <label
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                }}
            >
                <svg
                    className="h-8 w-8 text-foreground-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                </svg>
                <span className="text-sm font-medium text-foreground">
                    {uploading ? "Uploading…" : "Upload a resume"}
                </span>
                <span className="text-xs text-foreground-muted">
                    PDF · Max 5 MB · Drag & drop or click
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                    }}
                />
            </label>
            {error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UserPage() {
    const router = useRouter();

    const [stats, setStats] = useState<Statistics | null>(null);
    const [history, setHistory] = useState<PaginatedHistory | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const PAGE_SIZE = 10;

    // Read the user's email from the stored JWT payload for display.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(AUTH_KEY);
            if (!raw) {
                router.replace("/auth/login");
                return;
            }
            const auth = JSON.parse(raw) as {
                accessToken?: string;
                payload?: { email?: string };
            };
            if (!auth.accessToken) {
                router.replace("/auth/login");
                return;
            }
            const email =
                auth.payload && typeof auth.payload === "object"
                    ? (((auth.payload as Record<string, unknown>).email as string) ??
                        null)
                    : null;
            setUserEmail(email);
        } catch {
            router.replace("/auth/login");
        }
    }, [router]);

    async function fetchAll(p = page) {
        setLoading(true);
        try {
            const [s, h, r] = await Promise.all([
                authedGet<Statistics>("/user/statistics"),
                authedGet<PaginatedHistory>(
                    `/user/history?page=${p}&pageSize=${PAGE_SIZE}`,
                ),
                authedGet<Resume[]>("/user/resume"),
            ]);
            setStats(s);
            setHistory(h);
            setResumes(r);
        } catch (err: unknown) {
            // 401 = token expired and refresh failed → back to login
            if (err instanceof Error && err.message.includes("401")) {
                router.replace("/auth/login");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAll(page);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleDeleteResume(id: string) {
        setDeletingId(id);
        const base =
            process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
            "https://localhost:7248";
        await authedFetch(`${base}/user/resume/${id}`, { method: "DELETE" });
        setResumes((prev) => prev.filter((r) => r.resumeId !== id));
        setDeletingId(null);
    }

    async function handleViewResume(id: string) {
        const base =
            process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
            "https://localhost:7248";

        try {
            const res = await authedFetch(`${base}/user/resume/${id}`);
            if (!res.ok) {
                setErrorForResume(id, "Unable to open this resume.");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            setErrorForResume(id, "Unable to open this resume.");
        }
    }

    function setErrorForResume(_id: string, message: string) {
        setErrorMessage(message);
    }

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function handleLogout() {
        clearAuth();
        router.push("/auth/login");
    }

    const totalPages = history ? Math.ceil(history.totalCount / PAGE_SIZE) : 1;

    return (
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {userEmail ? `Welcome back` : "Dashboard"}
                    </h1>
                    {userEmail && (
                        <p className="mt-0.5 text-sm text-foreground-muted">{userEmail}</p>
                    )}
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                    Sign out
                </Button>
            </div>

            {/* Stats */}
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground-muted">
                    Overview
                </h2>
                {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-24 animate-pulse rounded-xl border border-border bg-background"
                            />
                        ))}
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <StatCard label="Total analyses" value={stats.totalAnalyses} />
                        <StatCard
                            label="Average score"
                            value={
                                stats.averageScore != null
                                    ? `${stats.averageScore.toFixed(1)}`
                                    : "—"
                            }
                            sub="out of 100"
                        />
                        <StatCard label="Resumes saved" value={resumes.length} />
                    </div>
                ) : null}
            </section>

            {/* Analysis history */}
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground-muted">
                    Analysis history
                </h2>
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                    {loading ? (
                        <div className="divide-y divide-border">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-4">
                                    <div className="h-4 w-1/3 animate-pulse rounded bg-border" />
                                    <div className="ml-auto h-4 w-10 animate-pulse rounded bg-border" />
                                </div>
                            ))}
                        </div>
                    ) : !history?.items?.length ? (
                        <EmptyState
                            icon="📄"
                            message="No analyses yet. Upload a resume to get started."
                        />
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="px-5 py-3 font-medium text-foreground-muted">
                                            Date
                                        </th>
                                        <th className="px-5 py-3 font-medium text-foreground-muted">
                                            Job / Resume
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium text-foreground-muted">
                                            Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-background-subtle transition-colors"
                                        >
                                            <td className="whitespace-nowrap px-5 py-3 text-foreground-muted">
                                                {new Date(item.createdAt).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-foreground">
                                                {item.jobTitle ?? item.resumeFileName ?? "—"}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <ScoreBadge score={item.score} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-foreground-muted">
                                    <span>
                                        Page {page} of {totalPages}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Resumes */}
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground-muted">
                    Saved resumes
                </h2>

                <ResumeUpload onUploaded={() => fetchAll(page)} />

                {errorMessage && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        {errorMessage}
                    </p>
                )}

                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                    {loading ? (
                        <div className="divide-y divide-border">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-4">
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
                                </div>
                            ))}
                        </div>
                    ) : !resumes.length ? (
                        <EmptyState icon="📁" message="No resumes saved yet." />
                    ) : (
                        <ul className="divide-y divide-border">
                            {resumes.map((r) => (
                                <li
                                    key={r.resumeId}
                                    className="flex items-center gap-3 px-5 py-3"
                                >
                                    <svg
                                        className="h-4 w-4 shrink-0 text-foreground-muted"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                        />
                                    </svg>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {r.fileName}
                                        </p>
                                        <p className="text-xs text-foreground-muted">
                                            {new Date(r.uploadedAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                            {r.sizeBytes != null &&
                                                ` · ${(r.sizeBytes / 1024).toFixed(0)} KB`}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleViewResume(r.resumeId)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-foreground-muted hover:text-foreground hover:bg-background-subtle"
                                        aria-label="View resume"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Button>
                                    <Button
                                        disabled={deletingId === r.resumeId}
                                        onClick={() => handleDeleteResume(r.resumeId)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-foreground-muted hover:text-red-600 hover:bg-red-500/10"
                                        aria-label="Delete resume"
                                    >
                                        {deletingId === r.resumeId ? (
                                            <svg
                                                className="h-4 w-4 animate-spin"
                                                fill="none"
                                                viewBox="0 0 24 24"
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
                                        ) : (
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                />
                                            </svg>
                                        )}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
