"use client";

import { SectionLabel } from "@/components/analysis/SectionLabel";
import { Button } from "@/components/ui/button";
import { SavedResume } from "@/types/analysis";
import type { JobAdvertisement } from "@/types";
import { Loader2, Trash2 } from "lucide-react";

interface Props {
  file: File | null;
  fileError: string;
  jobLabel: string;
  jobText: string;
  loading: boolean;
  canRun: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLabelChange: (val: string) => void;
  onTextChange: (val: string) => void;
  onRun: () => void;
  // Resume picker
  isLoggedIn: boolean | null;
  savedResumes: SavedResume[];
  savedJobAds: JobAdvertisement[];
  uploadMode: "new" | "saved";
  selectedResumeId: string | null;
  onUploadModeChange: (mode: "new" | "saved") => void;
  onResumeSelect: (id: string) => void;
  jobSourceMode: "new" | "saved";
  onJobSourceModeChange: (mode: "new" | "saved") => void;
  selectedJobAdId: string | null;
  onJobAdSelect: (jobAd: JobAdvertisement) => void;
  onJobAdPreview: (jobAd: JobAdvertisement) => void;
  onJobAdDelete: (jobAd: JobAdvertisement) => void;
  deletingJobAdId: string | null;
}

export const AnalysisInputs = ({
  file,
  fileError,
  jobLabel,
  jobText,
  loading,
  canRun,
  onFileChange,
  onLabelChange,
  onTextChange,
  onRun,
  isLoggedIn,
  savedResumes,
  savedJobAds,
  uploadMode,
  selectedResumeId,
  onUploadModeChange,
  onResumeSelect,
  jobSourceMode,
  onJobSourceModeChange,
  selectedJobAdId,
  onJobAdSelect,
  onJobAdPreview,
  onJobAdDelete,
  deletingJobAdId,
}: Props) => (
  <div className="flex flex-col gap-6 h-full overflow-y-auto">
    <SectionLabel>01 · Resume</SectionLabel>

    {isLoggedIn === null ? (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background-subtle/40 px-4 py-4 animate-pulse">
        <div className="h-4 w-32 rounded bg-border/70" />
        <div className="h-10 w-full rounded-lg bg-border/50" />
        <div className="h-28 w-full rounded-xl bg-border/40" />
      </div>
    ) : (
      <>
        {/*  Resume source selector  */}
        {isLoggedIn && savedResumes.length > 0 && (
          <div className="flex gap-1 p-0.5 rounded-lg bg-background-subtle border border-border w-fit">
            <button
              type="button"
              onClick={() => onUploadModeChange("saved")}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all ${
                uploadMode === "saved"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Saved CVs
            </button>
            <button
              type="button"
              onClick={() => onUploadModeChange("new")}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all ${
                uploadMode === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              New upload
            </button>
          </div>
        )}

        {/*  Saved resume list  */}
        {isLoggedIn && savedResumes.length > 0 && uploadMode === "saved" && (
          <div className="flex flex-col gap-1.5">
            {savedResumes.map((r) => (
              <button
                key={r.resumeId}
                type="button"
                onClick={() => onResumeSelect(r.resumeId)}
                className={`flex items-center gap-3 w-full rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                  selectedResumeId === r.resumeId
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-foreground-muted"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors ${
                    selectedResumeId === r.resumeId
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium truncate text-foreground">
                    {r.fileName}
                  </p>
                  <p className="font-mono text-[10px] text-foreground-muted">
                    {new Date(r.uploadedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {r.sizeBytes != null &&
                      ` · ${(r.sizeBytes / 1024).toFixed(0)} KB`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/*  New file upload  */}
        {uploadMode === "new" && (
          <label className="relative flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 cursor-pointer hover:border-primary hover:bg-primary/2 transition-colors group">
            <input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              className="sr-only"
            />
            <span className="text-2xl opacity-50 group-hover:opacity-70 transition-opacity">
              {file ? "📄" : "↑"}
            </span>
            <span className="font-mono text-sm font-medium text-center">
              {file ? file.name : "Drop PDF here or click to browse"}
            </span>
            <span className="font-mono text-[10px] text-foreground-muted">
              PDF only · max 5 MB
            </span>
            {fileError && (
              <span className="font-mono text-xs text-destructive mt-1">
                {fileError}
              </span>
            )}
          </label>
        )}
      </>
    )}

    {/*  Job details  */}
    <SectionLabel>02 · Job</SectionLabel>

    {isLoggedIn && savedJobAds.length > 0 && (
      <div className="flex gap-1 rounded-lg border border-border bg-background-subtle p-0.5 w-fit">
        <button
          type="button"
          onClick={() => onJobSourceModeChange("saved")}
          className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all ${
            jobSourceMode === "saved"
              ? "bg-background text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Saved ads
        </button>
        <button
          type="button"
          onClick={() => onJobSourceModeChange("new")}
          className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all ${
            jobSourceMode === "new"
              ? "bg-background text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          New input
        </button>
      </div>
    )}

    <div className="flex flex-col justify-between gap-1.5 h-full">
      {isLoggedIn && savedJobAds.length > 0 && jobSourceMode === "saved" && (
        <div className="flex max-h-74 flex-col gap-1.5 overflow-y-auto pr-1">
          {savedJobAds.map((jobAd) => {
            const isSelected = selectedJobAdId === jobAd.id;
            const isDeleting = deletingJobAdId === jobAd.id;

            return (
              <div
                key={jobAd.id}
                className={`flex items-center gap-3 w-full rounded-lg border px-3.5 py-2.5 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-foreground-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onJobAdSelect(jobAd)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors ${
                      isSelected ? "border-primary bg-primary" : "border-border"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium truncate text-foreground">
                      {jobAd.title ?? "Untitled job advertisement"}
                    </p>
                    <p className="font-mono text-[10px] text-foreground-muted">
                      {new Date(jobAd.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onJobAdPreview(jobAd)}
                  className="font-mono text-[10px]"
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onJobAdDelete(jobAd)}
                  disabled={isDeleting}
                  className="h-8 w-8 text-foreground-muted hover:text-red-600 hover:bg-red-500/10"
                  aria-label="Delete saved job advertisement"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {jobSourceMode === "new" && (
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.15em] text-foreground-muted uppercase">
              Position title
            </label>
            <input
              type="text"
              value={jobLabel}
              onChange={(e) => onLabelChange(e.target.value)}
              readOnly={jobSourceMode === "saved"}
              placeholder="e.g. Senior Frontend Engineer"
              className={`w-full rounded-lg border bg-background px-3.5 py-2.5 font-mono text-sm outline-none transition-colors ${
                jobSourceMode === "saved"
                  ? "border-border text-foreground-muted"
                  : "border-border focus:border-primary"
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-mono text-[10px] tracking-[0.15em] text-foreground-muted uppercase flex items-center justify-between">
              <span>Job description</span>
              {jobText.length > 0 && (
                <span
                  className={
                    jobText.length < 20
                      ? "text-destructive"
                      : "text-foreground-muted"
                  }
                >
                  {jobText.length} / 10 000
                </span>
              )}
            </label>
            <textarea
              value={jobText}
              onChange={(e) => onTextChange(e.target.value)}
              readOnly={jobSourceMode === "saved"}
              placeholder={
                jobSourceMode === "saved"
                  ? "Select a saved ad above"
                  : "Paste the full job description here…"
              }
              className={`w-full flex-1 min-h-52 resize-none rounded-lg border bg-background px-3.5 py-2.5 font-mono text-sm outline-none transition-colors ${
                jobSourceMode === "saved"
                  ? "border-border text-foreground-muted"
                  : "border-border focus:border-primary"
              }`}
            />
            {jobText.length > 0 && jobText.length < 20 && (
              <p className="font-mono text-[10px] text-destructive">
                At least 20 characters required.
              </p>
            )}
          </div>
        </div>
      )}
      <Button
        onClick={onRun}
        disabled={loading || !canRun}
        className="w-full h-11"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Analysing…
          </span>
        ) : (
          "Run Analysis →"
        )}
      </Button>
    </div>
  </div>
);
