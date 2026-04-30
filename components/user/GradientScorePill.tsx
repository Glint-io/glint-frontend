import { Bot, Hash, ListChecks, ScanText } from "lucide-react";

type AnalysisResult = {
  id: string;
  method: string;
  score: number | null;
  feedback: string | null;
  completedAt: string | null;
};

const METHOD_ORDER: Record<string, number> = {
  AI: 0,
  RuleBased: 1,
  Keyword: 2,
};

export const GradientScorePill = ({
  results,
}: {
  results: AnalysisResult[];
}) => {
  const scoredResults = results
    .filter((r) => r.score != null)
    .map((r) => ({ ...r, roundedScore: Math.round(r.score!) }))
    .sort((a, b) => {
      const aRank = METHOD_ORDER[a.method] ?? Number.MAX_SAFE_INTEGER;
      const bRank = METHOD_ORDER[b.method] ?? Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return a.method.localeCompare(b.method);
    });

  const scores = scoredResults.map((r) => r.roundedScore);

  if (scores.length === 0)
    return <span className="text-xs text-foreground-muted">—</span>;

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "AI":
        return Bot;
      case "RuleBased":
        return ListChecks;
      case "Keyword":
        return ScanText;
      default:
        return Hash;
    }
  };

  const getColor = (score: number) =>
    score >= 80
      ? { r: 34, g: 197, b: 94 }
      : score >= 60
        ? { r: 234, g: 179, b: 8 }
        : { r: 239, g: 68, b: 68 };

  const colors = scores.map(getColor);

  const gradientStops = colors
    .map(
      (c, i) =>
        `rgba(${c.r},${c.g},${c.b},0.15) ${(i / (colors.length - 1)) * 100}%`,
    )
    .join(", ");

  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-full px-3 py-1"
      style={{
        background:
          scores.length === 1
            ? `rgba(${colors[0].r},${colors[0].g},${colors[0].b},0.15)`
            : `linear-gradient(to right, ${gradientStops})`,
        boxShadow: `0 0 0 1px rgba(${colors[0].r},${colors[0].g},${colors[0].b},0.35)`,
      }}
    >
      {scores.map((score, i) => {
        const Icon = getMethodIcon(scoredResults[i].method);

        return (
          <span
            key={scoredResults[i].id}
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: `rgb(${colors[i].r},${colors[i].g},${colors[i].b})` }}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {score}
          </span>
        );
      })}
    </div>
  );
};
