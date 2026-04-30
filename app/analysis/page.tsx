"use client";

import { useState } from "react";
import { AnalysisInputs } from "@/components/analysis/AnalysisInputs";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { AnalysisMethod, AnalysisResult } from "@/types/analysis";
import { authedFetch } from "@/lib/auth";
import { useNotification } from "@/components/NotificationProvider";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

type BackendAnalysisResult = {
  method?: string;
  score?: number;
  feedback?: string;
};

type BackendAnalysisResponse = {
  score?: number;
  keywordScore?: number;
  rulesScore?: number;
  feedback?: string;
  label?: string;
  jobLabel?: string;
  result?: BackendAnalysisResult;
  results?: BackendAnalysisResult[];
  Analysis?: {
    label?: string;
    results?: BackendAnalysisResult[];
  };
  analysis?: {
    label?: string;
    results?: BackendAnalysisResult[];
  };
};

function normalizeMethod(value: string | undefined) {
  return value?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
}

function pickScore(results: BackendAnalysisResult[], variants: string[]) {
  const normalizedVariants = variants.map(normalizeMethod);
  const match = results.find((item) => normalizedVariants.includes(normalizeMethod(item.method)));
  return match?.score;
}

function pickFeedback(results: BackendAnalysisResult[], variants: string[]) {
  const normalizedVariants = variants.map(normalizeMethod);
  const match = results.find((item) => normalizedVariants.includes(normalizeMethod(item.method)));
  return match?.feedback;
}

function normalizeAnalysisResponse(data: BackendAnalysisResponse): AnalysisResult {
  const nestedResults =
    data.results ?? data.Analysis?.results ?? data.analysis?.results ?? (data.result ? [data.result] : []);

  const feedbackByMethod = nestedResults.reduce<Partial<Record<AnalysisMethod, string>>>((acc, item) => {
    const methodKey = normalizeMethod(item.method);

    if (methodKey === "ai") acc.ai = item.feedback;
    if (methodKey === "keyword") acc.keyword = item.feedback;
    if (methodKey === "rulebased" || methodKey === "rules") acc.rules = item.feedback;

    return acc;
  }, {});

  const score = data.score ?? pickScore(nestedResults, ["ai", "analysis", "result"]) ?? 0;
  const keywordScore =
    data.keywordScore ?? pickScore(nestedResults, ["keyword", "keywords"]) ?? score;
  const rulesScore =
    data.rulesScore ?? pickScore(nestedResults, ["rules", "rulebased", "rule-based"]) ?? score;

  return {
    score,
    keywordScore,
    rulesScore,
    feedbackByMethod,
    feedback:
      data.feedback ??
      pickFeedback(nestedResults, ["ai", "analysis", "result"]) ??
      nestedResults[0]?.feedback,
  };
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as { error?: string; message?: string; title?: string };
      return body.error ?? body.message ?? body.title ?? response.statusText;
    } catch {
      return response.statusText;
    }
  }

  try {
    const text = await response.text();
    return text || response.statusText;
  } catch {
    return response.statusText;
  }
}

const AnalysisPage = () => {
  const { notifyError } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [jobLabel, setJobLabel] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [method, setMethod] = useState<AnalysisMethod>("ai");
  const [scoreActive, setScoreActive] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.endsWith(".pdf")) return setFileError("PDF files only.");
    setFile(f);
    setFileError("");
  };

  const handleRun = async () => {
    if (!jobLabel.trim() || !jobText.trim()) {
      const message = "Add both a position title and job description before running analysis.";
      setAnalysisError(message);
      notifyError(message);
      return;
    }

    if (!selectedResumeId && !file) {
      const message = "Choose a saved resume or upload a PDF before running analysis.";
      setAnalysisError(message);
      notifyError(message);
      return;
    }

    setLoading(true);
    setResult(null);
    setScoreActive(false);
    setAnalysisError("");

    try {
      const formData = new FormData();
      formData.append("JobText", jobText);
      formData.append("Label", jobLabel);

      if (selectedResumeId) {
        formData.append("ResumeId", selectedResumeId);
      } else if (file) {
        formData.append("Resume", file);
      }

      const response = await authedFetch(`${apiBaseUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await readErrorMessage(response);
        setAnalysisError(message);
        notifyError(message);
        return;
      }

      const data = (await response.json()) as BackendAnalysisResponse;
      setResult(normalizeAnalysisResponse(data));

      const nextLabel = data.jobLabel ?? data.label ?? data.Analysis?.label ?? data.analysis?.label;
      if (!jobLabel && nextLabel) setJobLabel(nextLabel);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis request failed.";
      console.error("Fetch error:", err);
      setAnalysisError(message);
      notifyError(message);
    } finally {
      setLoading(false);
      setTimeout(() => setScoreActive(true), 150);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full max-w-7xl mx-auto p-8">
      <AnalysisInputs
        file={file}
        fileError={fileError}
        jobLabel={jobLabel}
        jobText={jobText}
        loading={loading}
        selectedResumeId={selectedResumeId}
        onSelectedResumeChange={setSelectedResumeId}
        onFileChange={handleFile}
        onLabelChange={setJobLabel}
        onTextChange={setJobText}
        onRun={handleRun}
      />
      <AnalysisResults
        result={result}
        loading={loading}
        error={analysisError}
        method={method}
        setMethod={setMethod}
        scoreActive={scoreActive}
        displayScore={displayScore}
        jobLabel={jobLabel}
      />
    </div>
  );
};

export default AnalysisPage;
