type AnalysisResult = {
  id: string;
  method: string;
  score: number | null;
  feedback: string | null;
  completedAt: string | null;
};

export const GradientScorePill = ({
  results,
}: {
  results: AnalysisResult[];
}) => {
  const scores = results
    .filter((r) => r.score != null)
    .map((r) => Math.round(r.score!));

  if (scores.length === 0)
    return <span className="text-xs text-foreground-muted">—</span>;

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
      {scores.map((score, i) => (
        <span
          key={i}
          className="text-xs font-semibold"
          style={{ color: `rgb(${colors[i].r},${colors[i].g},${colors[i].b})` }}
        >
          {score}
        </span>
      ))}
    </div>
  );
};
