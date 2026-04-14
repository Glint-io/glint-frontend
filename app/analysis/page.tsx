"use client";

import { useState } from "react";
import { AnalysisInputs } from "@/components/analysis/AnalysisInputs";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { AnalysisMethod, AnalysisResult, TempData } from "@/types/analysis";

const AnalysisPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [jobLabel, setJobLabel] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [method, setMethod] = useState<AnalysisMethod>("ai");
  const [scoreActive, setScoreActive] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.endsWith(".pdf")) return setFileError("PDF files only.");
    setFile(f);
    setFileError("");
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setScoreActive(false);

    try {
      const res = await fetch("/tempData/data.json");
      const data: TempData = await res.json();
      const { Analysis } = data;

      const getScore = (m: string) =>
        Analysis.results.find((r) => r.method === m)?.score || 0;

      setResult({
        score: getScore("AI"),
        keywordScore: getScore("Keyword"),
        rulesScore: getScore("RuleBased"),
        feedback: Analysis.results.find((r) => r.method === "AI")?.feedback,
      });

      if (!jobLabel) setJobLabel(Analysis.label);
    } catch (err) {
      console.error("Fetch error:", err);
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
        onFileChange={handleFile}
        onLabelChange={setJobLabel}
        onTextChange={setJobText}
        onRun={handleRun}
      />
      <AnalysisResults
        result={result}
        loading={loading}
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
