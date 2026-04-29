import { getMockDashboardData, mockResumes, type DashboardData } from "./mock-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

type RemoteAnalysisResponse = {
  score: number;
  overlap?: string[];
  missing?: string[];
  feedback?: string;
};

export type SavedResume = {
  resumeId: string;
  fileName: string;
  uploadedAt: string;
};

function hasApiBaseUrl() {
  return apiBaseUrl.length > 0;
}

export async function getUserDashboardData(userId?: string): Promise<DashboardData> {
  if (!hasApiBaseUrl()) {
    return getMockDashboardData(userId);
  }

  try {
    const endpoint = `${apiBaseUrl}/dashboard${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`;
    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      return getMockDashboardData(userId);
    }

    const data = (await response.json()) as DashboardData;
    if (!data || !Array.isArray(data.history)) {
      return getMockDashboardData(userId);
    }

    return data;
  } catch {
    return getMockDashboardData(userId);
  }
}

// Fetch saved resumes for the current authenticated user.
// Falls back to mock resumes when no API is configured.
export async function getSavedResumes(token?: string): Promise<SavedResume[]> {
  if (!hasApiBaseUrl()) {
    // Return mock resumes shaped like the backend DTO
    return mockResumes.map((r) => ({
      resumeId: r.Id,
      fileName: r.FileName,
      uploadedAt: r.UploadedAt,
    }));
  }

  try {
    const response = await fetch(`${apiBaseUrl}/user/resume`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!response.ok) return [];

    return (await response.json()) as SavedResume[];
  } catch {
    return [];
  }
}

function extractKeywords(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function unique(tokens: string[]) {
  return Array.from(new Set(tokens));
}

function runLocalKeywordAnalysis(cvText: string, jobText: string) {
  const cvKeywords = unique(extractKeywords(cvText));
  const jobKeywords = unique(extractKeywords(jobText));

  if (cvKeywords.length === 0 || jobKeywords.length === 0) {
    return {
      score: 0,
      overlap: [] as string[],
      missing: [] as string[],
      feedback: "Insufficient text to compare.",
      source: "mock" as const,
    };
  }

  const cvSet = new Set(cvKeywords);
  const overlap = jobKeywords.filter((word) => cvSet.has(word));
  const missing = jobKeywords.filter((word) => !cvSet.has(word));
  const score = Math.round((overlap.length / jobKeywords.length) * 100);

  return {
    score,
    overlap,
    missing,
    feedback: "Mock keyword analysis used because API is unavailable.",
    source: "mock" as const,
  };
}

// Run analysis using either an uploaded file or a saved resume ID.
// When a resumeId is supplied the file argument is ignored.
export async function runAnalysisWithFallback(
  jobText: string,
  options:
    | { mode: "upload"; file: File; cvText: string }
    | { mode: "saved"; resumeId: string; token?: string }
) {
  // Local mock path – used when no API base URL is configured or the saved
  // resume mode is chosen without an API (we synthesise CV text from the
  // mock file name so the keyword fallback still works).
  if (!hasApiBaseUrl()) {
    const cvText =
      options.mode === "upload"
        ? options.cvText
        : `mock resume content for ${options.resumeId}`;
    return runLocalKeywordAnalysis(cvText, jobText);
  }

  try {
    const formData = new FormData();
    formData.append("JobText", jobText);

    if (options.mode === "upload") {
      formData.append("Resume", options.file);
    } else {
      formData.append("ResumeId", options.resumeId);
    }

    const headers: Record<string, string> = {};
    if (options.mode === "saved" && options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const response = await fetch(`${apiBaseUrl}/analyze`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const cvText = options.mode === "upload" ? options.cvText : "";
      return runLocalKeywordAnalysis(cvText, jobText);
    }

    const data = (await response.json()) as RemoteAnalysisResponse;

    return {
      score: data.score ?? 0,
      overlap: data.overlap ?? [],
      missing: data.missing ?? [],
      feedback: data.feedback ?? "API analysis completed.",
      source: "api" as const,
    };
  } catch {
    const cvText = options.mode === "upload" ? options.cvText : "";
    return runLocalKeywordAnalysis(cvText, jobText);
  }
}