"use client";

import { useState, useEffect } from "react";
import { AnalysisInputs } from "@/components/analysis/AnalysisInputs";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import {
  AnalysisMethod,
  AnalysisResult,
  ApiAnalyzeResponse,
  SavedResume,
} from "@/types/analysis";
import { getAccessToken, authedGet, authedFormFetch } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://localhost:7248";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapApiResponse(data: ApiAnalyzeResponse): AnalysisResult {
  const byMethod = (m: string) =>
    data.results.find((r) => r.method === m);

  const ai = byMethod("AI");
  const kw = byMethod("Keyword");
  const rb = byMethod("RuleBased");

  return {
    score: ai?.score ?? 0,
    keywordScore: kw?.score ?? 0,
    rulesScore: rb?.score ?? 0,
    feedback: ai?.feedback ?? undefined,
    keywordFeedback: kw?.feedback ?? undefined,
    rulesFeedback: rb?.feedback ?? undefined,
  };
}

async function runAnalysisOnBackend(
  file: File | null,
  resumeId: string | null,
  jobText: string,
  label: string
): Promise<ApiAnalyzeResponse> {
  const form = new FormData();
  if (resumeId) {
    form.append("ResumeId", resumeId);
  } else if (file) {
    form.append("Resume", file);
  }
  form.append("JobText", jobText);
  if (label.trim()) form.append("Label", label.trim());

  const token = getAccessToken();
  let res: Response;

  if (token) {
    res = await authedFormFetch(`${API_BASE}/analyze`, form);
  } else {
    res = await fetch(`${API_BASE}/analyze`, {
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

  return res.json() as Promise<ApiAnalyzeResponse>;
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
    },
    label: label || Analysis.label,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

    try {
      if (API_BASE) {
        const fileToSend = uploadMode === "new" ? file : null;
        const idToSend = uploadMode === "saved" ? selectedResumeId : null;
        const data = await runAnalysisOnBackend(fileToSend, idToSend, jobText, jobLabel);
        const mapped = mapApiResponse(data);
        setResult(mapped);
        if (!jobLabel && data.label) setJobLabel(data.label);
      } else {
        // No API configured: fall back to mock data
        const { result: mockResult, label } = await runAnalysisFromMock(jobLabel);
        setResult(mockResult);
        if (!jobLabel) setJobLabel(label);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      setError(msg);
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
        scoreActive={scoreActive}
        displayScore={displayScore}
        jobLabel={jobLabel}
      />
    </div>
  );
}