import { getMockDashboardData, type DashboardData } from "./mock-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

type RemoteAnalysisResponse = {
  score: number;
  overlap?: string[];
  missing?: string[];
  feedback?: string;
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

export async function runAnalysisWithFallback(cvText: string, jobText: string) {
  if (!hasApiBaseUrl()) {
    return runLocalKeywordAnalysis(cvText, jobText);
  }

  try {
    const response = await fetch(`${apiBaseUrl}/analysis/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cvText,
        jobText,
        method: 2,
      }),
    });

    if (!response.ok) {
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
    return runLocalKeywordAnalysis(cvText, jobText);
  }
}