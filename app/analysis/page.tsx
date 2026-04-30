"use client";

import { useState, useEffect } from "react";
import { AnalysisInputs } from "@/components/analysis/AnalysisInputs";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import {
  AnalysisMethod,
  AnalysisMethodStatus,
  AnalysisResult,
  SavedResume,
} from "@/types/analysis";
import { getAccessToken, authedGet, authedFormFetch } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

//  Helpers 

async function runAnalysisOnBackend(
  file: File | null,
  resumeId: string | null,
  jobText: string,
  label: string,
  onStatusUpdate: (method: AnalysisMethod, status: AnalysisMethodStatus) => void,
  onResultUpdate: (method: AnalysisMethod, data: { score: number; feedback: string }) => void
): Promise<AnalysisMethod[]> {
  const buildFormData = () => {
    const form = new FormData();
    if (resumeId) {
      form.append("ResumeId", resumeId);
    } else if (file) {
      form.append("Resume", file);
    }
    form.append("JobText", jobText);
    if (label.trim()) form.append("Label", label.trim());
    return form;
  };

  const token = getAccessToken();

  // Call all three endpoints concurrently
  const endpoints = [
    { method: "ai" as AnalysisMethod, url: `${API_BASE}/analyze/ai` },
    { method: "keyword" as AnalysisMethod, url: `${API_BASE}/analyze/keyword` },
    { method: "rules" as AnalysisMethod, url: `${API_BASE}/analyze/rules` },
  ];

  const promises = endpoints.map(async ({ method, url }) => {
    onStatusUpdate(method, "loading");

    try {
      let res: Response;
      const form = buildFormData();

      if (token) {
        res = await authedFormFetch(url, form);
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: { accept: "application/json" },
          body: form,
        });
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = `Analysis failed (${res.status})`;
        try {
          const j = JSON.parse(text) as { error?: string; message?: string };
          msg = j.error ?? j.message ?? msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const data = (await res.json()) as {
        method: string;
        score: number;
        feedback: string;
      };

      onResultUpdate(method, {
        score: data.score,
        feedback: data.feedback,
      });

      onStatusUpdate(method, "done");
      return null;
    } catch (error) {
      onStatusUpdate(method, "error");

      const msg =
        error instanceof Error ? error.message : "Analysis failed. Please try again.";
      return { method, error: `${method} analysis failed: ${msg}` };
    }
  });

  const failures = (await Promise.all(promises)).filter(
    (entry): entry is { method: AnalysisMethod; error: string } => entry !== null
  );

  return failures.map((entry) => entry.method);
}

async function runAnalysisFromMock(label: string): Promise<{ result: AnalysisResult; label: string }> {
  const res = await fetch("/tempData/data.json");
  const data = await res.json() as { Analysis: { label: string; results: Array<{ method: string; score: number; feedback: string }> } };
  const { Analysis } = data;
  const getScore = (m: string) =>
    Analysis.results.find((r) => r.method === m)?.score ?? 0;
  return {
    result: {
      score: getScore("AI"),
      keywordScore: getScore("Keyword"),
      rulesScore: getScore("RuleBased"),
      feedback: Analysis.results.find((r) => r.method === "AI")?.feedback,
      keywordFeedback: Analysis.results.find((r) => r.method === "Keyword")?.feedback,
      rulesFeedback: Analysis.results.find((r) => r.method === "RuleBased")?.feedback,
    },
    label: label || Analysis.label,
  };
}

//  Page 

export default function AnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [jobLabel, setJobLabel] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [method, setMethod] = useState<AnalysisMethod>("ai");
  const [scoreActive, setScoreActive] = useState(false);
  const [methodStatuses, setMethodStatuses] = useState<Record<AnalysisMethod, AnalysisMethodStatus>>({
    ai: "idle",
    keyword: "idle",
    rules: "idle",
  });

  // Resume picker state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [uploadMode, setUploadMode] = useState<"new" | "saved">("new");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // Detect auth + fetch saved resumes
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    setIsLoggedIn(true);

    authedGet<SavedResume[]>("/user/resume")
      .then((resumes: SavedResume[]) => {
        setSavedResumes(resumes);
        if (resumes.length > 0) setUploadMode("saved");
      })
      .catch(() => {
        // Non-critical: just can't show saved resumes
      });
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.endsWith(".pdf")) {
      setFileError("PDF files only.");
      return;
    }
    setFile(f);
    setFileError("");
  };

  const canRun = () => {
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
        const onResultUpdate = (method: AnalysisMethod, data: { score: number; feedback: string }) => {
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
          onResultUpdate
        );

        if (failedMethods.length > 0) {
          const labels = failedMethods
            .map((analysisMethod) =>
              analysisMethod === "ai"
                ? "AI"
                : analysisMethod === "keyword"
                  ? "Keyword"
                  : "Rules"
            )
            .join(", ");
          setError(`${labels} analysis failed.`);
        }
      } else {
        // No API configured: fall back to mock data
        const { result: mockResult, label } = await runAnalysisFromMock(jobLabel);
        setResult(mockResult);
        setMethodStatuses({ ai: "done", keyword: "done", rules: "done" });
        setScoreActive(true);
        if (!jobLabel) setJobLabel(label);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch w-full max-w-7xl mx-auto">
      <AnalysisInputs
        file={file}
        fileError={fileError}
        jobLabel={jobLabel}
        jobText={jobText}
        loading={loading}
        canRun={canRun()}
        onFileChange={handleFile}
        onLabelChange={setJobLabel}
        onTextChange={setJobText}
        onRun={handleRun}
        isLoggedIn={isLoggedIn}
        savedResumes={savedResumes}
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
    </div>
  );
}
