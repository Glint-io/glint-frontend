"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  authedGet,
  authedFetch,
  authedFormFetch,
  clearAuth,
  AUTH_KEY,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GradientScorePill } from "@/components/user/GradientScorePill";
import { AnalysisDetailModal } from "@/components/user/AnalysisDetailModal";
import { StatCard } from "@/components/user/StatCard";
import { SectionLabel } from "@/components/user/SectionLabel";
import { EmptyState } from "@/components/user/EmptyState";
import type {
  Statistics,
  PaginatedHistory,
  Resume,
  HistoryItem,
} from "@/types";
import { ScoreOverTimeChart } from "@/components/user/ScoreOverTimeChart";
import { Upload, FileText, Eye, Trash2, Loader2 } from "lucide-react";

const ResumeUpload = ({
  onUploaded,
  resumeCount,
}: {
  onUploaded: () => void;
  resumeCount: number;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "https://localhost:7248";

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf")
      return setError("Only PDF files are supported.");
    if (file.size > 5 * 1024 * 1024)
      return setError("File must be under 5 MB.");
    if (resumeCount >= 3)
      return setError(
        "You may only have 3 saved resumes. Please delete one before uploading a new one.",
      );

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await authedFormFetch(`${base}/user/resume`, form);
      if (res.ok) {
        onUploaded();
      } else {
        const text = await res.text();
        let msg = "Upload failed.";
        try {
          msg = (JSON.parse(text) as { error?: string }).error ?? msg;
        } catch {}
        setError(msg);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
        <Upload className="h-8 w-8 text-foreground-muted" />
        <span className="font-mono text-sm font-medium text-foreground">
          {uploading ? "Uploading…" : "Upload a resume"}
        </span>
        <span className="font-mono text-xs text-foreground-muted">
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
        <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default function UserPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [history, setHistory] = useState<PaginatedHistory | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const PAGE_SIZE = 10;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "https://localhost:7248";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return void router.replace("/auth/login");
      const auth = JSON.parse(raw) as {
        accessToken?: string;
        payload?: { email?: string };
      };
      if (!auth.accessToken) return void router.replace("/auth/login");
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

  const fetchAll = useCallback(
    async (p: number) => {
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
        if (err instanceof Error && err.message.includes("401"))
          router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    fetchAll(page);
  }, [page, fetchAll]);

  const handleDeleteResume = async (id: string) => {
    setDeletingId(id);
    try {
      await authedFetch(`${base}/user/resume/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((resume) => resume.resumeId !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewResume = async (id: string) => {
    try {
      const res = await authedFetch(`${base}/user/resume/${id}`);
      if (!res.ok) return setErrorMessage("Unable to open this resume.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setErrorMessage("Unable to open this resume.");
    }
  };

  const totalPages = history ? Math.ceil(history.totalCount / PAGE_SIZE) : 1;

  const averageScore =
    stats && stats.byMethod.length
      ? stats.byMethod.reduce((sum, m) => sum + m.averageScore * m.count, 0) /
        stats.byMethod.reduce((sum, m) => sum + m.count, 0)
      : null;

  return (
    <div className="flex w-full flex-1 flex-col space-y-0">
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <section className="pt-6 pb-8 flex items-center justify-between gap-6 border-b border-border">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted mb-3">
            Glint · Dashboard
          </p>
          <h1 className="font-mono text-[2rem] md:text-4xl font-semibold leading-[1.08] tracking-tight text-foreground">
            User <span className="text-primary">Dashboard</span>
          </h1>
          {userEmail && (
            <p className="mt-2 font-mono text-xs text-foreground-muted">
              {userEmail}
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            clearAuth();
            router.push("/auth/login");
          }}
          variant="outline"
          size="sm"
          className="font-mono text-xs shrink-0"
        >
          Sign out
        </Button>
      </section>

      {/* ── Overview stats ──────────────────────────────────────────────── */}
      <section className="py-8">
        <SectionLabel>Overview</SectionLabel>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-border bg-background"
              />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Total analyses" value={stats.totalAnalyses} />
            <StatCard
              label="Average score"
              value={averageScore != null ? averageScore.toFixed(1) : "—"}
              sub="out of 100"
            />
            <StatCard label="Resumes saved" value={resumes.length} />
          </div>
        ) : null}
      </section>

      {stats?.scoreOverTime?.length ? (
        <div className="mt-4">
          <ScoreOverTimeChart scoreOverTime={stats.scoreOverTime} />
        </div>
      ) : null}

      {/* ── Analysis history ─────────────────────────────────────────────── */}
      <section className="py-8">
        <SectionLabel>Analysis history</SectionLabel>
        <div className="flex m-h-130 flex-col overflow-hidden rounded-xl border border-border bg-background">
          {loading ? (
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-border" />
                  <div className="ml-auto h-4 w-10 animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>
          ) : !history?.items?.length ? (
            <div className="flex-1 overflow-y-auto">
              <EmptyState
                icon="📄"
                message="No analyses yet. Upload a resume to get started."
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="sticky top-0 z-10 bg-background px-5 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted">
                      Job / Resume
                    </th>
                    <th className="sticky top-0 z-10 bg-background px-5 py-3 text-right font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-background-subtle transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 min-w-0">
                        <p className="font-mono text-sm font-medium text-foreground truncate max-w-50 sm:max-w-none">
                          {item.label ?? "—"}
                        </p>
                        <p className="font-mono text-xs text-foreground-muted mt-0.5 truncate">
                          {item.resumeFileName}
                        </p>
                        <p className="font-mono text-[10px] text-foreground-muted mt-0.5 sm:hidden">
                          {new Date(item.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1">
                          <GradientScorePill results={item.results} />
                          <span className="hidden sm:block font-mono text-[10px] text-foreground-muted">
                            {new Date(item.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="font-mono text-xs text-foreground-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                >
                  Previous
                </Button>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Saved resumes ───────────────────────────────────────────────── */}
      <section className="py-8">
        <SectionLabel>Saved resumes</SectionLabel>
        <ResumeUpload
          onUploaded={() => fetchAll(page)}
          resumeCount={resumes.length}
        />
        {errorMessage && (
          <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
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
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <FileText className="h-4 w-4 shrink-0 text-primary opacity-60" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium text-foreground">
                      {r.fileName}
                    </p>
                    <p className="font-mono text-xs text-foreground-muted mt-0.5">
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
                    <Eye className="h-4 w-4" />
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
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {selectedItem && (
        <AnalysisDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
