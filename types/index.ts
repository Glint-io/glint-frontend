export type Statistics = {
  totalAnalyses: number;
  byMethod: {
    method: string;
    averageScore: number;
    count: number;
  }[];
  scoreOverTime: {
    date: string;
    score: number;
    method: string;
  }[];
};

export type AnalysisResult = {
  id: string;
  method: string;
  score: number | null;
  feedback: string | null;
  completedAt: string | null;
};

export type HistoryItem = {
  id: string;
  jobTitle: string | null;
  createdAt: string;
  status: string;
  resumeFileName: string;
  jobAdSnippet: string;
  results: AnalysisResult[];
};

export type PaginatedHistory = {
  items: HistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type Resume = {
  resumeId: string;
  fileName: string;
  uploadedAt: string;
  sizeBytes?: number;
};