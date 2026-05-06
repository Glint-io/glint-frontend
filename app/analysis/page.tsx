"use client";

import { useState, useEffect } from "react";
import { AnalysisInputs } from "@/components/analysis/AnalysisInputs";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { JobAdvertisementPreviewModal } from "@/components/ui/JobAdvertisementPreviewModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuth } from "@/components/AuthProvider";
import {
  AnalysisMethod,
  AnalysisMethodStatus,
  AnalysisResult,
  SavedResume,
} from "@/types/analysis";
import type { JobAdvertisement } from "@/types";
import { getAccessToken, authedGet } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";

//  Helpers

async function runAnalysisOnBackend(
  file: File | null,
  resumeId: string | null,
  jobText: string,
  jobTitle: string,
  onStatusUpdate: (
    method: AnalysisMethod,
    status: AnalysisMethodStatus,
  ) => void,
  onResultUpdate: (
    method: AnalysisMethod,
    data: { score: number; feedback: string },
  ) => void,
  onJobAdNotice: (message: string | null) => void,
): Promise<AnalysisMethod[]> {
  const form = new FormData();
  if (resumeId) form.append("ResumeId", resumeId);
  else if (file) form.append("Resume", file);
  form.append("JobText", jobText);
  if (jobTitle.trim()) form.append("JobTitle", jobTitle.trim());

  const token = getAccessToken();
  const headers: HeadersInit = { accept: "text/event-stream" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Mark all three as loading upfront
  onStatusUpdate("ai", "loading");
  onStatusUpdate("keyword", "loading");
  onStatusUpdate("rules", "loading");

  const failedMethods: AnalysisMethod[] = [];

  try {
    const res = await fetch(`${API_BASE}/analyze/stream`, {
      method: "POST",
      headers,
      body: form,
    });

    if (!res.ok || !res.body) {
      onStatusUpdate("ai", "error");
      onStatusUpdate("keyword", "error");
      onStatusUpdate("rules", "error");
      onJobAdNotice(null);
      return ["ai", "keyword", "rules"];
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") break;

        try {
          const evt = JSON.parse(payload) as {
            result: { method: string; score: number; feedback: string };
            jobAdvertisementNotice?: string | null;
          };

          if (evt.jobAdvertisementNotice) {
            onJobAdNotice(evt.jobAdvertisementNotice);
          }

          const methodKey = evt.result.method.toLowerCase() as AnalysisMethod;
          // map "rulebased" -> "rules"
          const mapped: AnalysisMethod =
            methodKey === ("rulebased" as string) ? "rules" : methodKey;

          onResultUpdate(mapped, {
            score: evt.result.score ?? 0,
            feedback: evt.result.feedback ?? "",
          });
          onStatusUpdate(mapped, "done");
        } catch {
          // malformed event, skip
        }
      }
    }
  } catch {
    onStatusUpdate("ai", "error");
    onStatusUpdate("keyword", "error");
    onStatusUpdate("rules", "error");
    onJobAdNotice(null);
    return ["ai", "keyword", "rules"];
  }

  return failedMethods;
}

async function runAnalysisFromMock(
  label: string,
): Promise<{ result: AnalysisResult; label: string }> {
  const res = await fetch("/tempData/data.json");
  const data = (await res.json()) as {
    Analysis: {
      label: string;
      results: Array<{ method: string; score: number; feedback: string }>;
    };
  };
  const { Analysis } = data;
  const getScore = (m: string) =>
    Analysis.results.find((r) => r.method === m)?.score ?? 0;
  return {
    result: {
      score: getScore("AI"),
      keywordScore: getScore("Keyword"),
      rulesScore: getScore("RuleBased"),
      feedback: Analysis.results.find((r) => r.method === "AI")?.feedback,
      keywordFeedback: Analysis.results.find((r) => r.method === "Keyword")
        ?.feedback,
      rulesFeedback: Analysis.results.find((r) => r.method === "RuleBased")
        ?.feedback,
    },
    label: label || Analysis.label,
  };
}

//  Page

export default function AnalysisPage() {
  const { isLoggedIn } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [jobLabel, setJobLabel] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [method, setMethod] = useState<AnalysisMethod>("ai");
  const [scoreActive, setScoreActive] = useState(false);
  const [methodStatuses, setMethodStatuses] = useState<
    Record<AnalysisMethod, AnalysisMethodStatus>
  >({
    ai: "idle",
    keyword: "idle",
    rules: "idle",
  });

  // Resume picker state
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [savedJobAds, setSavedJobAds] = useState<JobAdvertisement[]>([]);
  const [uploadMode, setUploadMode] = useState<"new" | "saved">("new");
  const [jobSourceMode, setJobSourceMode] = useState<"new" | "saved">("new");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobAdId, setSelectedJobAdId] = useState<string | null>(null);
  const [previewJobAd, setPreviewJobAd] = useState<JobAdvertisement | null>(
    null,
  );
  const [jobAdNotice, setJobAdNotice] = useState<string | null>(null);
  const [jobAdToDelete, setJobAdToDelete] = useState<JobAdvertisement | null>(
    null,
  );
  const [deletingJobAdId, setDeletingJobAdId] = useState<string | null>(null);

  // Detect auth + fetch saved resumes
  useEffect(() => {
    if (isLoggedIn !== true) {
      setSavedResumes([]);
      setSavedJobAds([]);
      setSelectedResumeId(null);
      setSelectedJobAdId(null);
      setPreviewJobAd(null);
      setJobAdNotice(null);
      setJobAdToDelete(null);
      setDeletingJobAdId(null);
      setJobSourceMode("new");
      setUploadMode("new");
      return;
    }

    Promise.all([
      authedGet<SavedResume[]>("/user/resume"),
      authedGet<JobAdvertisement[]>("/user/job-advertisement"),
    ])
      .then(([resumes, jobAds]) => {
        setSavedResumes(resumes);
        setSavedJobAds(jobAds);
        if (resumes.length > 0) setUploadMode("saved");
        if (jobAds.length > 0) setJobSourceMode("saved");
      })
      .catch(() => {
        // Non-critical: just can't show saved history items.
      });
  }, [isLoggedIn]);

  useEffect(() => {
    const storedNotice = sessionStorage.getItem("glint:last-job-ad-notice");
    if (storedNotice) {
      setJobAdNotice(storedNotice);
      sessionStorage.removeItem("glint:last-job-ad-notice");
    }
  }, []);

  const handleSelectJobAd = (jobAd: JobAdvertisement) => {
    setJobSourceMode("saved");
    setSelectedJobAdId(jobAd.id);
    setJobLabel(jobAd.title ?? "");
    setJobText(jobAd.rawText);
  };

  const handleDeleteJobAd = async (id: string) => {
    setDeletingJobAdId(id);
    try {
      const res = await authedFetch(
        `${API_BASE}/user/job-advertisement/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        setJobAdNotice("Unable to delete that saved job advertisement.");
        return;
      }

      setSavedJobAds((prev) => prev.filter((jobAd) => jobAd.id !== id));
      if (selectedJobAdId === id) {
        setSelectedJobAdId(null);
        setJobSourceMode("new");
        setJobLabel("");
        setJobText("");
      }
      if (previewJobAd?.id === id) {
        setPreviewJobAd(null);
      }
    } finally {
      setDeletingJobAdId(null);
      setJobAdToDelete(null);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.endsWith(".pdf")) {
      setFileError("PDF files only.");
      return;
    }
    setFile(f);
    setFileError("");
  };

  const handleLabelChange = (val: string) => {
    setSelectedJobAdId(null);
    setJobSourceMode("new");
    setJobLabel(val);
  };

  const handleTextChange = (val: string) => {
    setSelectedJobAdId(null);
    setJobSourceMode("new");
    setJobText(val);
  };

  const canRun = () => {
    if (jobSourceMode === "saved" && !selectedJobAdId) return false;
    if (!jobText.trim() || jobText.trim().length < 20) return false;
    if (uploadMode === "new") return file !== null;
    if (uploadMode === "saved") return selectedResumeId !== null;
    return false;
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setScoreActive(false);
    setError(null);
    setJobAdNotice(null);
    sessionStorage.removeItem("glint:last-job-ad-notice");
    setMethodStatuses({ ai: "loading", keyword: "loading", rules: "loading" });

    try {
      if (API_BASE) {
        const fileToSend = uploadMode === "new" ? file : null;
        const idToSend = uploadMode === "saved" ? selectedResumeId : null;

        // Start with empty result structure
        const currentResult: AnalysisResult = {
          score: 0,
          keywordScore: 0,
          rulesScore: 0,
          feedback: undefined,
          keywordFeedback: undefined,
          rulesFeedback: undefined,
        };

        // Update result as each method completes
        const onResultUpdate = (
          method: AnalysisMethod,
          data: { score: number; feedback: string },
        ) => {
          if (method === "ai") {
            currentResult.score = data.score;
            currentResult.feedback = data.feedback;
          } else if (method === "keyword") {
            currentResult.keywordScore = data.score;
            currentResult.keywordFeedback = data.feedback;
          } else if (method === "rules") {
            currentResult.rulesScore = data.score;
            currentResult.rulesFeedback = data.feedback;
          }
          setResult({ ...currentResult });
          setScoreActive(true);
        };

        const failedMethods = await runAnalysisOnBackend(
          fileToSend,
          idToSend,
          jobText,
          jobLabel,
          (analysisMethod, status) => {
            setMethodStatuses((current) => ({
              ...current,
              [analysisMethod]: status,
            }));
          },
          onResultUpdate,
          (message) => {
            setJobAdNotice(message);
            if (message) {
              sessionStorage.setItem("glint:last-job-ad-notice", message);
            }
          },
        );

        if (failedMethods.length > 0) {
          const labels = failedMethods
            .map((analysisMethod) =>
              analysisMethod === "ai"
                ? "AI"
                : analysisMethod === "keyword"
                  ? "Keyword"
                  : "Rules",
            )
            .join(", ");
          setError(`${labels} analysis failed.`);
        }

        if (isLoggedIn === true) {
          const jobAds = await authedGet<JobAdvertisement[]>(
            "/user/job-advertisement",
          );
          setSavedJobAds(jobAds);
        }
      } else {
        // No API configured: fall back to mock data
        const { result: mockResult, label } =
          await runAnalysisFromMock(jobLabel);
        setResult(mockResult);
        setMethodStatuses({ ai: "done", keyword: "done", rules: "done" });
        setScoreActive(true);
        if (!jobLabel) setJobLabel(label);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayScore = result
    ? method === "ai"
      ? result.score
      : method === "keyword"
        ? result.keywordScore
        : result.rulesScore
    : 0;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto flex-1 min-h-0 h-full">
      <div className="h-1/12 lg:col-span-2 space-y-3">
        {jobAdNotice && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-mono text-xs text-foreground">
            {jobAdNotice}
          </div>
        )}
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted">
          Resumes are limted to 3 entries. Saved job ads are limited to 5
          entries. Adding a new job ad replaces the oldest saved job ad, manage
          your saved items at any time.
        </p>
      </div>
      <div className="min-h-11/12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <AnalysisInputs
          file={file}
          fileError={fileError}
          jobLabel={jobLabel}
          jobText={jobText}
          loading={loading}
          canRun={canRun()}
          onFileChange={handleFile}
          onLabelChange={handleLabelChange}
          onTextChange={handleTextChange}
          onRun={handleRun}
          isLoggedIn={isLoggedIn}
          savedResumes={savedResumes}
          savedJobAds={savedJobAds}
          uploadMode={uploadMode}
          selectedResumeId={selectedResumeId}
          onUploadModeChange={(m) => {
            setUploadMode(m);
            if (m === "new") setSelectedResumeId(null);
            if (m === "saved" && savedResumes.length > 0 && !selectedResumeId) {
              setSelectedResumeId(savedResumes[0].resumeId);
            }
          }}
          onResumeSelect={setSelectedResumeId}
          jobSourceMode={jobSourceMode}
          onJobSourceModeChange={(mode) => {
            setJobSourceMode(mode);
            if (mode === "new") {
              setSelectedJobAdId(null);
            }
          }}
          selectedJobAdId={selectedJobAdId}
          onJobAdSelect={handleSelectJobAd}
          onJobAdPreview={setPreviewJobAd}
          onJobAdDelete={(jobAd) => setJobAdToDelete(jobAd)}
          deletingJobAdId={deletingJobAdId}
        />
        <AnalysisResults
          result={result}
          loading={loading}
          error={error}
          method={method}
          setMethod={setMethod}
          methodStatuses={methodStatuses}
          scoreActive={scoreActive}
          displayScore={displayScore}
          jobLabel={jobLabel}
        />

        <JobAdvertisementPreviewModal
          jobAd={previewJobAd}
          onClose={() => setPreviewJobAd(null)}
          onUse={(jobAd) => {
            handleSelectJobAd(jobAd);
            setPreviewJobAd(null);
          }}
          useLabel="Load into analysis"
        />

        {jobAdToDelete && (
          <ConfirmModal
            title="Delete saved job advertisement"
            ariaLabel="Delete saved job advertisement confirmation"
            message={`This will remove ${jobAdToDelete.title ?? "this saved job advertisement"} from your saved list. This action cannot be undone.`}
            confirmType="simple"
            confirmButtonLabel="Delete"
            cancelButtonLabel="Cancel"
            onClose={() => setJobAdToDelete(null)}
            onConfirm={async () => {
              await handleDeleteJobAd(jobAdToDelete.id);
            }}
          />
        )}
      </div>
    </div>
  );
}
