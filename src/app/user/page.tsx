"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  authedGet,
  authedFetch,
  authedFormFetch,
  clearAuth,
  getAccessToken,
  getStoredUserEmail,
} from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { CapacityDots } from "@/components/ui/CapacityDots";
import { GradientScorePill } from "@/components/user/GradientScorePill";
import { AnalysisDetailModal } from "@/components/user/AnalysisDetailModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import ClearHistoryModal from "@/components/user/ClearHistoryModal";
import { JobAdvertisementPreviewModal } from "@/components/ui/JobAdvertisementPreviewModal";
import { ServiceDownBanner } from "@/components/ui/ServiceDownBanner";
import { openAuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { glintToast } from "@/components/ui/toast";
import { StatCard } from "@/components/user/StatCard";
import { SectionLabel } from "@/components/user/SectionLabel";
import { EmptyState } from "@/components/user/EmptyState";
import {
  GlintSelect,
  type GlintSelectOption,
} from "@/components/ui/GlintSelect";
import type {
  Statistics,
  PaginatedHistory,
  Resume,
  HistoryItem,
  HistoryRange,
  JobAdvertisement,
} from "@/types";
import { ScoreOverTimeChart } from "@/components/user/ScoreOverTimeChart";
import {
  Upload,
  FileText,
  Eye,
  Trash2,
  Loader2,
  Activity,
  Gauge,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";

const HISTORY_RANGE_OPTIONS: GlintSelectOption<HistoryRange>[] = [
  { value: "All", label: "All time" },
  { value: "Today", label: "Today" },
  { value: "Last7Days", label: "Last 7 days" },
  { value: "Last30Days", label: "Last 30 days" },
  { value: "Last365Days", label: "Last year" },
];

const MAX_RESUMES = 5;

type UploadedResumeResponse = {
  resumeId: string;
  fileName: string;
  uploadedAt: string;
  fileSizeBytes?: number;
};

const ResumeUpload = ({
  onUploaded,
  resumeCount,
}: {
  onUploaded: (resume: Resume) => void;
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
    if (resumeCount >= MAX_RESUMES)
      return setError(
        `You may only have ${MAX_RESUMES} saved resumes. Please delete one before uploading a new one.`,
      );

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await authedFormFetch(`${base}/user/resume`, form);
      if (res.ok) {
        const payload = (await res.json()) as UploadedResumeResponse;
        const uploadedResume: Resume = {
          resumeId: payload.resumeId,
          fileName: payload.fileName,
          uploadedAt: payload.uploadedAt,
          sizeBytes: payload.fileSizeBytes,
        };
        onUploaded(uploadedResume);
        glintToast.success({
          message: `${uploadedResume.fileName} has been uploaded.`,
        });
      } else {
        const text = await res.text();
        let msg = "Upload failed.";
        try {
          msg = (JSON.parse(text) as { error?: string }).error ?? msg;
        } catch {}
        setError(msg);
        glintToast.error({ message: msg });
      }
    } catch {
      setError("Upload failed. Please try again.");
      glintToast.error({ message: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label
        className={`${resumeCount >= MAX_RESUMES ? "opacity-50 cursor-not-allowed" : "cursor-pointer transition hover:border-primary hover:bg-primary/5"} flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-8 text-center`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (resumeCount >= MAX_RESUMES) return;
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
          disabled={resumeCount >= MAX_RESUMES}
          className="hidden"
          onChange={(e) => {
            if (resumeCount >= MAX_RESUMES) return;
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
  const { isLoggedIn } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [serviceDown, setServiceDown] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [history, setHistory] = useState<PaginatedHistory | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobAdvertisements, setJobAdvertisements] = useState<
    JobAdvertisement[]
  >([]);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("All");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [jobAdToPreview, setJobAdToPreview] = useState<JobAdvertisement | null>(
    null,
  );
  const [jobAdToDelete, setJobAdToDelete] = useState<JobAdvertisement | null>(
    null,
  );
  const [deletingJobAdId, setDeletingJobAdId] = useState<string | null>(null);
  const [showClearHistory, setShowClearHistory] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const PAGE_SIZE = 10;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "https://localhost:7248";

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      setUserEmail(null);
      openAuthModal("login");
      setLoading(false);
      return;
    }

    if (isLoggedIn === true) {
      setUserEmail(getStoredUserEmail());
    }
  }, [isLoggedIn]);

  const fetchAll = useCallback(
    async (p: number, range: HistoryRange) => {
      if (isLoggedIn !== true) return;
      setLoading(true);

      try {
        const [s, h, r, jobAds] = await Promise.all([
          authedGet<Statistics>(`/user/statistics?range=${range}`),
          authedGet<PaginatedHistory>(
            `/user/history?page=${p}&pageSize=${PAGE_SIZE}&range=${range}`,
          ),
          authedGet<Resume[]>("/user/resume"),
          authedGet<JobAdvertisement[]>("/user/job-advertisement"),
        ]);
        setStats(s);
        setHistory(h);
        setResumes(r);
        setJobAdvertisements(jobAds);
      } catch (err: unknown) {
        if (err instanceof TypeError) {
          // Network-level failure — show the service down state
          setServiceDown(true);
        } else if (err instanceof Error && err.message.includes("401")) {
          openAuthModal("login");
        } else {
          glintToast.error({
            message: "Failed to load dashboard data. Please try again.",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn],
  );

  useEffect(() => {
    if (isLoggedIn === true) fetchAll(page, historyRange);
  }, [page, fetchAll, historyRange, isLoggedIn]);

  // Hold the spinner until hydration and auth are both resolved
  if (!isHydrated || isLoggedIn === null) {
    return (
      <div
        className="flex w-full flex-1 items-center justify-center"
        suppressHydrationWarning
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
          <p className="font-mono text-xs text-foreground-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (serviceDown) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <ServiceDownBanner
          onRetry={() => {
            setServiceDown(false);
            fetchAll(page, historyRange);
          }}
        />
      </div>
    );
  }

  const hasHistoryItems = (history?.items?.length ?? 0) > 0;

  if (isLoggedIn === false) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Account required
          </p>
          <h1 className="mt-3 font-mono text-xl font-semibold text-foreground">
            Sign in to view your dashboard
          </h1>
          <p className="mt-2 font-mono text-sm text-foreground-muted">
            Your saved resumes and analysis history are only available when
            you&apos;re logged in.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="font-mono text-xs"
            >
              Back
            </Button>
            <Button
              onClick={() => openAuthModal("login")}
              className="font-mono text-xs"
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteResume = async (id: string) => {
    setDeletingId(id);
    try {
      const resume = resumes.find((r) => r.resumeId === id);
      const res = await authedFetch(`${base}/user/resume/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        glintToast.error({ message: "Unable to delete that resume." });
        return;
      }

      setResumes((prev) => prev.filter((resume) => resume.resumeId !== id));
      const fileName = resume?.fileName ?? "Resume";
      glintToast.success({ message: `${fileName} has been deleted.` });
    } catch {
      glintToast.error({ message: "Unable to delete that resume." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteJobAd = async (id: string) => {
    setDeletingJobAdId(id);
    try {
      const jobAd = jobAdvertisements.find((ja) => ja.id === id);
      const res = await authedFetch(`${base}/user/job-advertisement/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        glintToast.error({
          message: "Unable to delete that saved job advertisement.",
        });
        return;
      }

      setJobAdvertisements((prev) => prev.filter((jobAd) => jobAd.id !== id));
      if (jobAdToPreview?.id === id) setJobAdToPreview(null);

      const title = jobAd?.title ?? "Job advertisement";
      glintToast.success({ message: `${title} has been deleted.` });
    } catch {
      glintToast.error({
        message: "Unable to delete that saved job advertisement.",
      });
    } finally {
      setDeletingJobAdId(null);
      setJobAdToDelete(null);
    }
  };

  const handleViewResume = async (id: string) => {
    try {
      const res = await authedFetch(`${base}/user/resume/${id}`);
      if (!res.ok) {
        setErrorMessage("Unable to open this resume.");
        glintToast.error({ message: "Unable to open this resume." });
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
      setErrorMessage("Unable to open this resume.");
      glintToast.error({ message: "Unable to open this resume." });
    }
  };

  const handleDeleteAccount = async (password: string) => {
    setDeletingAccount(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${base}/user/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        clearAuth();
        setShowDeleteAccount(false);
        glintToast.success({ message: "Your account has been deleted." });
        router.push("/");
        return;
      }

      const text = await res.text();
      let msg = "Unable to delete account. Please try again.";
      try {
        msg = (JSON.parse(text) as { error?: string }).error ?? msg;
      } catch {}
      glintToast.error({ message: msg });
    } catch {
      glintToast.error({
        message: "Unable to delete account. Please try again.",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleClearHistory = async (range?: HistoryRange) => {
    const r = range ?? historyRange;
    setClearingHistory(true);
    try {
      const res = await authedFetch(`${base}/user/history?range=${r}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = (await res.json()) as { deleted?: number };
        const count = data.deleted ?? 0;
        glintToast.success({
          message:
            count === 0
              ? "No analyses found in that range."
              : `Cleared ${count} ${count === 1 ? "analysis" : "analyses"}.`,
        });
        setPage(1);
        await fetchAll(1, historyRange);
      } else {
        glintToast.error({
          message: "Failed to clear history. Please try again.",
        });
      }
    } catch {
      glintToast.error({
        message: "Failed to clear history. Please try again.",
      });
    } finally {
      setClearingHistory(false);
      setShowClearHistory(false);
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
          onClick={() => setShowSignOutConfirm(true)}
          variant="outline"
          size="sm"
          className="font-mono text-xs shrink-0"
        >
          Sign out
        </Button>
      </section>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total analyses"
              value={stats.totalAnalyses}
              icon={Activity}
            />
            <StatCard
              label="Average score"
              value={averageScore != null ? averageScore.toFixed(1) : "N/A"}
              sub="out of 100"
              icon={Gauge}
            />
            <StatCard
              label="Resumes saved"
              value={resumes.length}
              icon={FolderOpen}
            />
          </div>
        ) : null}
      </section>

      {stats?.scoreOverTime?.length ? (
        <div className="mt-4">
          <ScoreOverTimeChart
            scoreOverTime={stats.scoreOverTime}
            range={historyRange}
          />
        </div>
      ) : null}

      <section className="py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-4">
          <div>
            <SectionLabel>Analysis history</SectionLabel>
            <p className="mt-2 font-mono text-xs text-foreground-muted">
              Filter the dashboard by the analysis creation date.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GlintSelect
              options={HISTORY_RANGE_OPTIONS}
              value={historyRange}
              onChange={(val) => {
                setHistoryRange(val);
                setPage(1);
                setSelectedItem(null);
              }}
            />
            <div
              className="w-px h-4 bg-border mx-1 hidden sm:block"
              aria-hidden="true"
            />
            <Button
              variant="ghost"
              size="sm"
              disabled={Boolean(clearingHistory || !hasHistoryItems)}
              onClick={() => setShowClearHistory(true)}
              className="font-mono text-xs text-foreground-muted hover:text-red-600 hover:bg-red-500/10"
            >
              {clearingHistory ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : null}
              Clear
            </Button>
          </div>
        </div>
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
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="sticky top-0 z-10 bg-background px-5 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted">
                      Job title / Resume
                    </th>
                    <th className="sticky top-0 z-10 bg-background px-5 py-3 w-24 sm:w-32 text-right font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted">
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
                      <td className="px-4 py-4 sm:px-5 min-w-0 overflow-hidden">
                        <p className="font-mono text-sm font-medium text-foreground truncate sm:pr-8">
                          {item.jobTitle ?? "—"}
                        </p>
                        <p className="font-mono text-xs text-foreground-muted mt-0.5 truncate sm:pr-8">
                          {item.resumeFileName}
                        </p>
                        <p className="font-mono text-[10px] text-foreground-muted mt-0.5 sm:hidden">
                          {new Date(item.createdAt).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-4 w-24 sm:w-32 text-right align-middle whitespace-nowrap">
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

      <section className="py-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Job advertisements</SectionLabel>
            <p className="mt-2 font-mono text-xs text-foreground-muted">
              Browse the exact ads saved from prior analyses.
            </p>
          </div>
          <CapacityDots
            used={jobAdvertisements.length}
            max={5}
            atCapacityLabel="5 / 5 · oldest replaced on save"
          />
        </div>

        {jobAdvertisements.length >= 5 && (
          <div className="mb-4 rounded-xl border border-border bg-background-subtle px-4 py-3 font-mono text-xs text-foreground-muted">
            Saved job ads are capped at 5. Adding a new one replaces the oldest
            saved job advertisement.
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {loading ? (
            <div className="divide-y divide-border px-5 py-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-border/40"
                />
              ))}
            </div>
          ) : !jobAdvertisements.length ? (
            <EmptyState icon="🗂️" message="No saved job advertisements yet." />
          ) : (
            <ul className="divide-y divide-border">
              {jobAdvertisements.map((jobAd) => (
                <li key={jobAd.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium text-foreground">
                      {jobAd.title ?? "Untitled job advertisement"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-foreground-muted">
                      {new Date(jobAd.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    onClick={() => setJobAdToPreview(jobAd)}
                    variant="ghost"
                    size="icon"
                    className="text-foreground-muted hover:text-foreground hover:bg-background-subtle"
                    aria-label="Preview job advertisement"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={deletingJobAdId === jobAd.id}
                    onClick={() => setJobAdToDelete(jobAd)}
                    variant="ghost"
                    size="icon"
                    className="text-foreground-muted hover:text-red-600 hover:bg-red-500/10"
                    aria-label="Delete saved job advertisement"
                  >
                    {deletingJobAdId === jobAd.id ? (
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

      <section className="py-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <SectionLabel>Saved resumes</SectionLabel>
          <CapacityDots
            used={resumes.length}
            max={MAX_RESUMES}
            atCapacityLabel="5 / 5 · delete one to upload more"
          />
        </div>
        {resumes.length >= MAX_RESUMES && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-100">
            <p className="font-mono text-xs text-foreground-muted dark:text-amber-100/80">
              Saved resumes are capped at {MAX_RESUMES}. Deleting a resume will
              free up space for a new upload.
            </p>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
          </div>
        )}
        <ResumeUpload
          onUploaded={(uploadedResume) => {
            setResumes((prev) => {
              if (
                prev.some(
                  (resume) => resume.resumeId === uploadedResume.resumeId,
                )
              ) {
                return prev;
              }
              return [uploadedResume, ...prev].sort(
                (a, b) =>
                  new Date(b.uploadedAt).getTime() -
                  new Date(a.uploadedAt).getTime(),
              );
            });
          }}
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
                    onClick={() => setResumeToDelete(r)}
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

      <section>
        <SectionLabel>Account</SectionLabel>
        <p className="mt-2 font-mono text-xs text-foreground-muted">
          Permanent actions that cannot be undone.
        </p>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-4">
          <div>
            <p className="font-mono text-sm font-medium text-foreground">
              Delete account
            </p>
            <p className="mt-0.5 font-mono text-xs text-foreground-muted">
              Permanently removes your account, all analyses, resumes, and saved
              job ads.
            </p>
          </div>
          <Button
            onClick={() => setShowDeleteAccount(true)}
            disabled={deletingAccount}
            variant="outline"
            size="sm"
            className="shrink-0 font-mono text-xs border-red-500/40 text-red-600 hover:bg-red-500/10 hover:border-red-500/60 hover:text-red-600 dark:text-red-400"
          >
            {deletingAccount ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            Delete account
          </Button>
        </div>
      </section>

      {selectedItem && (
        <AnalysisDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          jobAdvertisements={jobAdvertisements}
          onJobAdPreview={(jobAd) => setJobAdToPreview(jobAd)}
        />
      )}

      <JobAdvertisementPreviewModal
        jobAd={jobAdToPreview}
        onClose={() => setJobAdToPreview(null)}
      />

      {showSignOutConfirm && (
        <ConfirmModal
          title="Sign out"
          ariaLabel="Sign out confirmation"
          message="Are you sure you want to sign out?"
          confirmType="simple"
          confirmButtonLabel="Sign out"
          cancelButtonLabel="Cancel"
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={() => {
            glintToast.success({ message: "You have been signed out." });
            clearAuth();
            router.push("/auth/login");
          }}
        />
      )}

      {showClearHistory && (
        <ClearHistoryModal
          currentRange={historyRange}
          loading={clearingHistory}
          onClose={() => setShowClearHistory(false)}
          onConfirm={async (range) => {
            await handleClearHistory(range);
          }}
        />
      )}

      {jobAdToDelete && (
        <ConfirmModal
          title="Delete saved job advertisement"
          ariaLabel="Delete saved job advertisement confirmation"
          message={`This will permanently remove ${jobAdToDelete.title ?? "this saved job advertisement"} from your saved list. This action cannot be undone.`}
          confirmType="simple"
          confirmButtonLabel="Delete"
          cancelButtonLabel="Cancel"
          onClose={() => setJobAdToDelete(null)}
          onConfirm={async () => {
            await handleDeleteJobAd(jobAdToDelete.id);
          }}
        />
      )}

      {resumeToDelete && (
        <ConfirmModal
          title="Delete resume"
          ariaLabel="Delete resume confirmation"
          message={`This will permanently delete ${resumeToDelete.fileName}. This action cannot be undone.`}
          confirmType="simple"
          confirmButtonLabel="Delete"
          cancelButtonLabel="Cancel"
          onClose={() => setResumeToDelete(null)}
          onConfirm={async () => {
            await handleDeleteResume(resumeToDelete.resumeId);
            setResumeToDelete(null);
          }}
        />
      )}

      {showDeleteAccount && (
        <ConfirmModal
          title="Delete your account"
          ariaLabel="Delete account confirmation"
          message="This will permanently delete your account along with all analyses, resumes, and saved job ads. Enter your password to confirm."
          confirmType="input"
          inputLabel="Password"
          inputType="password"
          inputPlaceholder="Enter your password"
          confirmButtonLabel="Delete my account"
          cancelButtonLabel="Cancel"
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={async (password?: string) => {
            await handleDeleteAccount(password ?? "");
          }}
        />
      )}
    </div>
  );
}
