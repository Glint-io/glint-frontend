export type AnalysisMethod = "ai" | "keyword" | "rules";

export interface AnalysisResult {
  score: number;
  keywordScore: number;
  rulesScore: number;
  feedback?: string;
  feedbackByMethod?: Partial<Record<AnalysisMethod, string>>;
}

export interface TempData {
  Analysis: {
    label: string;
    results: Array<{
      method: string;
      score: number;
      feedback: string;
    }>;
  };
}