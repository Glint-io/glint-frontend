"use client";

import { useState, useEffect, useRef } from "react";
import { AnalysisInputs } from "@/components/analysis/AnalysisInputs";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { JobAdvertisementPreviewModal } from "@/components/ui/JobAdvertisementPreviewModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { ServiceDownBanner } from "@/components/ui/ServiceDownBanner";
import { useAuth } from "@/components/auth/AuthProvider";
import { glintToast } from "@/components/ui/toast";
import {
  AnalysisMethod,
  AnalysisMethodStatus,
  AnalysisResult,
  SavedResume,
} from "@/types/analysis";
import type { JobAdvertisement } from "@/types";
import { getAccessToken, authedFetch, authedGet } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://localhost:7248";

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
          const mapped: AnalysisMethod =
            methodKey === ("rulebased" as string) ? "rules" : methodKey;

          onResultUpdate(mapped, {
            score: evt.result.score ?? 0,
            feedback: evt.result.feedback ?? "",
          });
          onStatusUpdate(mapped, "done");
        } catch {
          glintToast.error({
            title: "Error",
            message: "Received malformed analysis result from server.",
          });
        }
      }
    }
  } catch (err) {
    // Rethrow network-level errors so the caller can surface the service down state
    if (err instanceof TypeError) throw err;

    onStatusUpdate("ai", "error");
    onStatusUpdate("keyword", "error");
    onStatusUpdate("rules", "error");
    onJobAdNotice(null);
    return ["ai", "keyword", "rules"];
  }

  return failedMethods;
}

export default function AnalysisPage() {
  const { isLoggedIn } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const jobAdNoticeShownRef = useRef(false);
  const [serviceDown, setServiceDown] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [jobLabel, setJobLabel] = useState("");
  const [submittedJobLabel, setSubmittedJobLabel] = useState("");
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

  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [savedJobAds, setSavedJobAds] = useState<JobAdvertisement[]>([]);
  const [uploadMode, setUploadMode] = useState<"new" | "saved">("new");
  const [jobSourceMode, setJobSourceMode] = useState<"new" | "saved">("new");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobAdId, setSelectedJobAdId] = useState<string | null>(null);
  const [previewJobAd, setPreviewJobAd] = useState<JobAdvertisement | null>(
    null,
  );
  const [previewResume, setPreviewResume] = useState<{
    resumeId: string;
    fileName: string;
    objectUrl: string;
  } | null>(null);
  const [jobAdToDelete, setJobAdToDelete] = useState<JobAdvertisement | null>(
    null,
  );
  const [resumeToDelete, setResumeToDelete] = useState<SavedResume | null>(
    null,
  );
  const [deletingJobAdId, setDeletingJobAdId] = useState<string | null>(null);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewResume?.objectUrl) {
        URL.revokeObjectURL(previewResume.objectUrl);
      }
    };
  }, [previewResume]);

  const fetchSaved = async () => {
    setLoadingData(true);
    try {
      const [resumes, jobAds] = await Promise.all([
        authedGet<SavedResume[]>("/user/resume"),
        authedGet<JobAdvertisement[]>("/user/job-advertisement"),
      ]);
      setSavedResumes(resumes);
      setSavedJobAds(jobAds);
      if (resumes.length > 0) setUploadMode("saved");
      if (jobAds.length > 0) setJobSourceMode("saved");
    } catch (err) {
      if (err instanceof TypeError) {
        setServiceDown(true);
      } else {
        glintToast.error({
          title: "Error",
          message: "Failed to load saved resumes and job advertisements.",
        });
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn === null) return;

    if (isLoggedIn === false) {
      setSavedResumes([]);
      setSavedJobAds([]);
      setSelectedResumeId(null);
      setSelectedJobAdId(null);
      setPreviewJobAd(null);
      setPreviewResume(null);
      setJobAdToDelete(null);
      setResumeToDelete(null);
      setDeletingJobAdId(null);
      setDeletingResumeId(null);
      setJobSourceMode("new");
      setUploadMode("new");
      return;
    }

    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSelectJobAd = (jobAd: JobAdvertisement) => {
    setJobSourceMode("saved");
    setSelectedJobAdId(jobAd.id);
    setJobLabel(jobAd.title ?? "");
    setJobText(jobAd.rawText);
  };

  const handleDeleteJobAd = async (id: string) => {
    setDeletingJobAdId(id);
    try {
      const jobAd = savedJobAds.find((item) => item.id === id);
      const res = await authedFetch(
        `${API_BASE}/user/job-advertisement/${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        glintToast.error({
          message:
            "Failed to delete saved job advertisement. Please try again.",
          title: "Error",
        });
        return;
      }

      setSavedJobAds((prev) => prev.filter((jobAd) => jobAd.id !== id));
      if (selectedJobAdId === id) {
        setSelectedJobAdId(null);
        setJobSourceMode("new");
        setJobLabel("");
        setJobText("");
      }
      if (previewJobAd?.id === id) setPreviewJobAd(null);

      glintToast.success({
        title: "Deleted",
        message: `${jobAd?.title ?? "Saved job advertisement"} has been deleted.`,
      });
    } catch {
      glintToast.error({
        message: "Failed to delete saved job advertisement. Please try again.",
        title: "Error",
      });
    } finally {
      setDeletingJobAdId(null);
      setJobAdToDelete(null);
    }
  };

  const handlePreviewResume = async (resume: SavedResume) => {
    try {
      const res = await authedFetch(
        `${API_BASE}/user/resume/${resume.resumeId}`,
      );
      if (!res.ok) {
        glintToast.error({
          title: "Error",
          message: "Unable to preview that resume.",
        });
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewResume({
        resumeId: resume.resumeId,
        fileName: resume.fileName,
        objectUrl,
      });
    } catch {
      glintToast.error({
        title: "Error",
        message: "Unable to preview that resume.",
      });
    }
  };

  const handleDeleteResume = async (id: string) => {
    setDeletingResumeId(id);
    try {
      const resume = savedResumes.find((item) => item.resumeId === id);
      const res = await authedFetch(`${API_BASE}/user/resume/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        glintToast.error({
          title: "Error",
          message: "Failed to delete saved resume. Please try again.",
        });
        return;
      }

      setSavedResumes((prev) => {
        const remaining = prev.filter((resume) => resume.resumeId !== id);
        if (selectedResumeId === id) {
          const nextSelected = remaining[0]?.resumeId ?? null;
          setSelectedResumeId(nextSelected);
          setUploadMode(nextSelected ? "saved" : "new");
          if (!nextSelected) setFile(null);
        }
        return remaining;
      });

      if (previewResume?.resumeId === id) setPreviewResume(null);

      glintToast.success({
        title: "Deleted",
        message: `${resume?.fileName ?? "Saved resume"} has been deleted.`,
      });
    } catch {
      glintToast.error({
        title: "Error",
        message: "Failed to delete saved resume. Please try again.",
      });
    } finally {
      setDeletingResumeId(null);
      setResumeToDelete(null);
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
    setSubmittedJobLabel(jobLabel);
    setMethodStatuses({ ai: "loading", keyword: "loading", rules: "loading" });
    jobAdNoticeShownRef.current = false;
    const shouldRefreshSavedResumes =
      isLoggedIn === true && uploadMode === "new";

    try {
      if (API_BASE) {
        const fileToSend = uploadMode === "new" ? file : null;
        const idToSend = uploadMode === "saved" ? selectedResumeId : null;

        const currentResult: AnalysisResult = {
          score: 0,
          keywordScore: 0,
          rulesScore: 0,
          feedback: undefined,
          keywordFeedback: undefined,
          rulesFeedback: undefined,
        };

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
            if (message && !jobAdNoticeShownRef.current) {
              jobAdNoticeShownRef.current = true;
              glintToast.info({ message, title: "Notice" });
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
          const [resumes, jobAds] = await Promise.all([
            shouldRefreshSavedResumes
              ? authedGet<SavedResume[]>("/user/resume")
              : Promise.resolve(null),
            authedGet<JobAdvertisement[]>("/user/job-advertisement"),
          ]);

          if (resumes) setSavedResumes(resumes);
          setSavedJobAds(jobAds);
        }
      } else {
        setError("Analysis backend is not configured.");
      }
    } catch (err) {
      if (err instanceof TypeError) {
        // Network-level failure — show the service down state
        setServiceDown(true);
        setMethodStatuses({ ai: "error", keyword: "error", rules: "error" });
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Analysis failed. Please try again.",
        );
      }
    } finally {
      if (shouldRefreshSavedResumes && isLoggedIn === true && API_BASE) {
        try {
          const resumes = await authedGet<SavedResume[]>("/user/resume");
          setSavedResumes(resumes);
        } catch {
          glintToast.error({
            title: "Error",
            message: "Failed to refresh saved resumes after analysis.",
          });
        }
      }

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

  if (serviceDown) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <ServiceDownBanner
          onRetry={() => {
            setServiceDown(false);
            if (isLoggedIn === true) fetchSaved();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto flex-1 md:min-h-0 md:h-full">
      <div className="md:min-h-full md:max-h-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <AnalysisInputs
          file={file}
          fileError={fileError}
          jobLabel={jobLabel}
          jobText={jobText}
          loading={loading}
          loadingData={loadingData}
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
          onResumePreview={handlePreviewResume}
          onResumeDelete={(resume) => setResumeToDelete(resume)}
          deletingResumeId={deletingResumeId}
          jobSourceMode={jobSourceMode}
          onJobSourceModeChange={(mode) => {
            setJobSourceMode(mode);
            if (mode === "new") setSelectedJobAdId(null);
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
          jobLabel={submittedJobLabel}
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

        {previewResume && (
          <Modal
            onClose={() => setPreviewResume(null)}
            aria-label="Resume preview"
            panelClassName="max-w-5xl p-0 overflow-hidden"
          >
            <div className="flex h-[80vh] flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
                    Resume preview
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium text-foreground">
                    {previewResume.fileName}
                  </p>
                </div>
              </div>
              <iframe
                src={previewResume.objectUrl}
                title={`Preview of ${previewResume.fileName}`}
                className="h-full w-full bg-background-subtle"
              />
            </div>
          </Modal>
        )}

        {resumeToDelete && (
          <ConfirmModal
            title="Delete resume"
            ariaLabel="Delete resume confirmation"
            message={`This will permanently remove ${resumeToDelete.fileName} from your saved resumes. This action cannot be undone.`}
            confirmType="simple"
            confirmButtonLabel="Delete"
            cancelButtonLabel="Cancel"
            onClose={() => setResumeToDelete(null)}
            onConfirm={async () => {
              await handleDeleteResume(resumeToDelete.resumeId);
            }}
          />
        )}

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
