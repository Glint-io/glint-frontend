"use client";

import { SectionLabel } from "@/components/analysis/SectionLabel";
import { CapacityDots } from "@/components/ui/CapacityDots";
import { Button } from "@/components/ui/Button";
import { SavedResume } from "@/types/analysis";
import type { JobAdvertisement } from "@/types";
import { Loader2, Plus, Trash2, Upload, Eye } from "lucide-react";

const MAX_RESUMES = 5;
const MAX_JOB_ADS = 5;

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
  isLoggedIn: boolean | null;
  savedResumes: SavedResume[];
  savedJobAds: JobAdvertisement[];
  uploadMode: "new" | "saved";
  selectedResumeId: string | null;
  onUploadModeChange: (mode: "new" | "saved") => void;
  onResumeSelect: (id: string) => void;
  onResumePreview: (resume: SavedResume) => void;
  onResumeDelete: (resume: SavedResume) => void;
  deletingResumeId: string | null;
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
  onResumePreview,
  onResumeDelete,
  deletingResumeId,
  jobSourceMode,
  onJobSourceModeChange,
  selectedJobAdId,
  onJobAdSelect,
  onJobAdPreview,
  onJobAdDelete,
  deletingJobAdId,
}: Props) => {
  const resumeSlotsFree = MAX_RESUMES - savedResumes.length;
  const jobSlotsFree = MAX_JOB_ADS - savedJobAds.length;
  const jobAdsAtCapacity = savedJobAds.length >= MAX_JOB_ADS;

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:h-full">
      <div className="flex flex-col gap-2 md:gap-3 h-1/2 lg:flex-1 lg:min-h-0">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>01 · Resume</SectionLabel>
          {isLoggedIn && savedResumes.length > 0 && (
            <CapacityDots
              used={savedResumes.length}
              max={MAX_RESUMES}
              atCapacityLabel="5 / 5 · delete one to upload more"
            />
          )}
        </div>

        {isLoggedIn === null ? (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-background-subtle/40 px-3 py-3 md:px-4 md:py-4 animate-pulse">
            <div className="h-4 w-32 rounded bg-border/70" />
            <div className="h-10 w-full rounded-lg bg-border/50" />
            <div className="h-28 w-full rounded-xl bg-border/40" />
          </div>
        ) : (
          <>
            {isLoggedIn && savedResumes.length > 0 && (
              <div className="flex gap-1 p-0.5 rounded-lg bg-background-subtle border border-border w-fit">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onUploadModeChange("saved")}
                  className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    uploadMode === "saved"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Saved CVs
                </button>
                <button
                  type="button"
                  disabled={loading || savedResumes.length >= MAX_RESUMES}
                  onClick={() => onUploadModeChange("new")}
                  className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    uploadMode === "new"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  New upload
                </button>
              </div>
            )}

            {isLoggedIn &&
              savedResumes.length > 0 &&
              uploadMode === "saved" && (
                <div className="flex flex-col lg:flex-1 lg:min-h-0 rounded-xl border-2 border-dashed border-border p-2 md:p-3 gap-1.5">
                  <div className="flex flex-col gap-1.5 lg:overflow-y-auto lg:min-h-0">
                    {savedResumes.map((r) => (
                      <div
                        key={r.resumeId}
                        className={`flex items-center gap-3 w-full rounded-lg border px-3 py-2 text-left md:py-2.5 transition-all ${
                          selectedResumeId === r.resumeId
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-foreground-muted"
                        }`}
                      >
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => onResumeSelect(r.resumeId)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
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
                              {new Date(r.uploadedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                              {r.sizeBytes != null &&
                                ` · ${(r.sizeBytes / 1024).toFixed(0)} KB`}
                            </p>
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={loading}
                          onClick={() => onResumePreview(r)}
                          className="h-8 w-8 font-mono text-[10px] disabled:cursor-not-allowed"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={loading || deletingResumeId === r.resumeId}
                          onClick={() => onResumeDelete(r)}
                          className="h-8 w-8 text-foreground-muted hover:text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Delete saved resume"
                        >
                          {deletingResumeId === r.resumeId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {resumeSlotsFree > 0 && (
                    <label
                      className={`mt-auto flex items-center gap-3 w-full rounded-lg border border-border px-3 py-2 md:px-3.5 md:py-2.5 transition-all ${
                        loading
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:border-primary hover:bg-primary/3 group"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        disabled={loading}
                        onChange={(e) => {
                          onUploadModeChange("new");
                          onFileChange(e);
                        }}
                        className="sr-only"
                      />
                      <Upload className="h-3.5 w-3.5 shrink-0 text-foreground-muted group-hover:text-primary transition-colors" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                          Upload another resume
                        </p>
                        <p className="font-mono text-[10px] text-foreground-muted">
                          {resumeSlotsFree} slot
                          {resumeSlotsFree !== 1 ? "s" : ""} remaining · PDF
                          only · max 5 MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              )}

            {uploadMode === "new" && (
              <label
                className={`relative flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-background px-4 py-6 md:px-6 md:py-8 lg:flex-1 transition-colors group ${
                  loading
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-primary hover:bg-primary/2"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  disabled={loading}
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
      </div>

      <div className="flex flex-col gap-2 md:gap-3 h-1/2 lg:flex-1 lg:min-h-0">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>02 · Job</SectionLabel>
          {isLoggedIn && savedJobAds.length > 0 && (
            <CapacityDots
              used={savedJobAds.length}
              max={MAX_JOB_ADS}
              atCapacityLabel="5 / 5 · oldest replaced on save"
            />
          )}
        </div>

        {isLoggedIn && savedJobAds.length > 0 && (
          <div className="flex gap-1 rounded-lg border border-border bg-background-subtle p-0.5 w-fit">
            <button
              type="button"
              disabled={loading}
              onClick={() => onJobSourceModeChange("saved")}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                jobSourceMode === "saved"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Saved ads
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onJobSourceModeChange("new")}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wide uppercase transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                jobSourceMode === "new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              New input
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-1 lg:min-h-0 gap-2">
          {isLoggedIn &&
            savedJobAds.length > 0 &&
            jobSourceMode === "saved" && (
              <div className="flex flex-col lg:flex-1 lg:min-h-0 rounded-xl border-2 border-dashed border-border p-2 md:p-3 gap-1.5">
                <div className="flex flex-col gap-1.5 lg:overflow-y-auto lg:min-h-0">
                  {savedJobAds.map((jobAd) => {
                    const isSelected = selectedJobAdId === jobAd.id;
                    const isDeleting = deletingJobAdId === jobAd.id;

                    return (
                      <div
                        key={jobAd.id}
                        className={`flex items-center gap-2 w-full rounded-lg border px-3 py-2 md:py-2.5 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-foreground-muted"
                        }`}
                      >
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => onJobAdSelect(jobAd)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-sm font-medium truncate text-foreground">
                              {jobAd.title ?? "Untitled job advertisement"}
                            </p>
                            <p className="font-mono text-[10px] text-foreground-muted">
                              {new Date(jobAd.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={loading}
                          onClick={() => onJobAdPreview(jobAd)}
                          className="h-8 w-8 font-mono text-[10px] disabled:cursor-not-allowed"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={loading || isDeleting}
                          onClick={() => onJobAdDelete(jobAd)}
                          className="h-8 w-8 text-foreground-muted hover:text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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

                {!jobAdsAtCapacity ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => onJobSourceModeChange("new")}
                    className={`mt-auto flex items-center gap-3 w-full rounded-lg border border-border px-3.5 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      !loading
                        ? "hover:border-primary hover:bg-primary/3 group"
                        : ""
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0 text-foreground-muted group-hover:text-primary transition-colors" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                        Enter a new job description
                      </p>
                      <p className="font-mono text-[10px] text-foreground-muted">
                        {jobSlotsFree} slot{jobSlotsFree !== 1 ? "s" : ""}{" "}
                        remaining · saved automatically on run
                      </p>
                    </div>
                  </button>
                ) : (
                  <p className="mt-auto font-mono text-[9px] text-foreground-muted px-1">
                    Limit reached. Running a new job ad will save it and remove
                    the oldest one above.
                  </p>
                )}
              </div>
            )}

          {jobSourceMode === "new" && (
            <div className="flex flex-col gap-3 md:gap-4 lg:flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] tracking-[0.15em] text-foreground-muted uppercase">
                  Position title
                </label>
                <input
                  type="text"
                  value={jobLabel}
                  disabled={loading}
                  onChange={(e) => onLabelChange(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 md:px-3.5 md:py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col gap-1.5 lg:flex-1">
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
                  disabled={loading}
                  onChange={(e) => onTextChange(e.target.value)}
                  placeholder="Paste the full job description here…"
                  className="w-full max-h-50 lg:flex-1 lg:max-h-none resize-none rounded-lg border border-border bg-background px-3 py-2 md:px-3.5 md:py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
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
            className="w-full h-11 disabled:cursor-not-allowed shrink-0"
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
    </div>
  );
};