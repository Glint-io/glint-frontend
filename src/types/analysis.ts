export type AnalysisMethod = "ai" | "keyword" | "rules";

export type AnalysisMethodStatus = "idle" | "loading" | "done" | "error";

export interface AnalysisResult {
  score: number;
  keywordScore: number;
  rulesScore: number;
  feedback?: string;
  keywordFeedback?: string;
  rulesFeedback?: string;
}

export interface ApiAnalysisResultItem {
  id: string;
  method: string;
  score: number | null;
  feedback: string | null;
  completedAt: string | null;
}

export interface ApiAnalyzeResponse {
  analysisId: string;
  label: string | null;
  status: string;
  createdAt: string;
  results: ApiAnalysisResultItem[];
}

export interface SavedResume {
  resumeId: string;
  fileName: string;
  uploadedAt: string;
  sizeBytes?: number;
}