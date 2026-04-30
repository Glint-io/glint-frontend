import { ScoreRing } from "./ScoreRing";
import { SectionLabel } from "@/components/analysis/SectionLabel";
import { AnalysisMethod, AnalysisResult } from "@/types/analysis";
import { Button } from "@/components/ui/button";

const METHODS: {
  id: AnalysisMethod;
  icon: string;
  label: string;
  desc: string;
}[] = [
    { id: "ai", icon: "✦", label: "AI", desc: "Semantic understanding" },
    { id: "keyword", icon: "⌖", label: "Keyword", desc: "Term overlap" },
    { id: "rules", icon: "⚙", label: "Rules", desc: "Industry criteria" },
  ];

interface Props {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  method: AnalysisMethod;
  setMethod: (m: AnalysisMethod) => void;
  scoreActive: boolean;
  displayScore: number;
  jobLabel: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const AnalysisResults = ({
  result,
  loading,
  error,
  method,
  setMethod,
  scoreActive,
  displayScore,
  jobLabel,
  showLabel = true,
  compact = false,
}: Props) => (
  <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-6 h-full"}>
    {showLabel && <SectionLabel>03 · Results</SectionLabel>}

    <div className={compact ? "flex flex-col gap-3" : "flex flex-col flex-1"}>
      {error && !loading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4">
          <p className="font-mono text-xs text-destructive">{error}</p>
        </div>
      )}

      {!result && !error ? (
        <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed border-border py-16 gap-3">
          {loading ? (
            <>
              <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" />
              <p className="font-mono text-[10px] tracking-widest text-foreground-muted uppercase">
                Running analysis…
              </p>
            </>
          ) : (
            <p className="font-mono text-[10px] tracking-widest text-foreground-muted uppercase">
              Ready
            </p>
          )}
        </div>
      ) : result ? (
        <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-4 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-400"}>
          {/* Method selector */}
          <div className={compact ? "flex gap-0.5 p-0.5 rounded-lg border border-border bg-background-subtle" : "flex gap-1 p-0.5 rounded-lg border border-border bg-background-subtle"}>
            {METHODS.map((m) => (
              <Button
                key={m.id}
                variant={method === m.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setMethod(m.id)}
                className={compact ? "flex-1 flex flex-col items-center gap-0 h-auto py-1.5 rounded-md text-[9px] uppercase tracking-wide" : "flex-1 flex flex-col items-center gap-0.5 h-auto py-2 rounded-md text-[10px] uppercase tracking-wide"}
              >
                <span className="text-sm leading-none">{m.icon}</span>
                {m.label}
              </Button>
            ))}
          </div>

          {/* Score row */}
          <div className={compact ? "flex items-center gap-3 rounded-lg border border-border bg-background p-3" : "flex items-center gap-5 rounded-xl border border-border bg-background p-5"}>
            <ScoreRing target={displayScore} active={scoreActive} compact={compact} />
            <div className="flex flex-col gap-0.5 overflow-hidden min-w-0">
              <p className={compact ? "font-mono text-xs font-semibold truncate leading-tight" : "font-mono text-sm font-semibold truncate leading-tight"}>
                {jobLabel || "Untitled analysis"}
              </p>
              <p className={compact ? "font-mono text-[11px] text-foreground-muted" : "font-mono text-xs text-foreground-muted"}>
                {METHODS.find((m) => m.id === method)?.desc}
              </p>
              {/* All three scores in small */}
              <div className="flex gap-2 mt-1">
                {METHODS.map((m) => {
                  const s =
                    m.id === "ai"
                      ? result.score
                      : m.id === "keyword"
                        ? result.keywordScore
                        : result.rulesScore;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`font-mono text-[9px] transition-colors ${method === m.id
                        ? "text-primary font-semibold"
                        : "text-foreground-muted hover:text-foreground"
                        }`}
                    >
                      {m.icon} {Math.round(s)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className={compact ? "flex flex-col rounded-lg border border-border bg-background overflow-hidden" : "flex flex-col flex-1 rounded-xl border border-border bg-background overflow-hidden"}>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="text-primary text-xs">◈</span>
              <p className="font-mono text-[9px] tracking-[0.2em] text-foreground-muted uppercase">
                Feedback
              </p>
            </div>
            <div className={compact ? "p-3 max-h-24 overflow-y-auto" : "flex-1 p-4"}>
              <p className={compact ? "font-mono text-[10px] leading-relaxed text-foreground-muted" : "font-mono text-xs leading-relaxed text-foreground-muted italic"}>
                {method === "ai"
                  ? (result.feedback ?? "No feedback available for this method.")
                  : method === "keyword"
                    ? (result.keywordFeedback ?? "No feedback available for this method.")
                    : (result.rulesFeedback ?? "No feedback available for this method.")}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </div>
);