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
}: Props) => (
  <div className="flex flex-col gap-6 h-full">
    <SectionLabel>03 · Results</SectionLabel>

    <div className="flex flex-col flex-1">
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
        <div className="flex flex-col gap-4 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-400">
          {/* Method selector */}
          <div className="flex gap-1 p-0.5 rounded-lg border border-border bg-background-subtle">
            {METHODS.map((m) => (
              <Button
                key={m.id}
                variant={method === m.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setMethod(m.id)}
                className="flex-1 flex flex-col items-center gap-0.5 h-auto py-2 rounded-md text-[10px] uppercase tracking-wide"
              >
                <span className="text-sm leading-none">{m.icon}</span>
                {m.label}
              </Button>
            ))}
          </div>

          {/* Score row */}
          <div className="flex items-center gap-5 rounded-xl border border-border bg-background p-5">
            <ScoreRing target={displayScore} active={scoreActive} />
            <div className="flex flex-col gap-1 overflow-hidden min-w-0">
              <p className="font-mono text-sm font-semibold truncate leading-tight">
                {jobLabel || "Untitled analysis"}
              </p>
              <p className="font-mono text-xs text-foreground-muted">
                {METHODS.find((m) => m.id === method)?.desc}
              </p>
              {/* All three scores in small */}
              <div className="flex gap-3 mt-1.5">
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
                      className={`font-mono text-[10px] transition-colors ${method === m.id
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
          <div className="flex flex-col flex-1 rounded-xl border border-border bg-background overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="text-primary text-xs">◈</span>
              <p className="font-mono text-[9px] tracking-[0.2em] text-foreground-muted uppercase">
                Feedback
              </p>
            </div>
            <div className="flex-1 p-4">
              <p className="font-mono text-xs leading-relaxed text-foreground-muted italic">
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