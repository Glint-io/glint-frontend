import { ScoreRing } from "./ScoreRing";
import { SectionLabel } from "@/components/analysis/SectionLabel";
import { AnalysisMethod, AnalysisMethodStatus, AnalysisResult } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { Bot, ListChecks, ScanText, Loader2, type LucideIcon } from "lucide-react";

const METHODS: {
  id: AnalysisMethod;
  icon: LucideIcon;
  label: string;
  desc: string;
}[] = [
    { id: "ai", icon: Bot, label: "AI", desc: "Semantic understanding" },
    { id: "keyword", icon: ScanText, label: "Keyword", desc: "Term overlap" },
    { id: "rules", icon: ListChecks, label: "Rules", desc: "Industry criteria" },
  ];

interface Props {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  method: AnalysisMethod;
  setMethod: (m: AnalysisMethod) => void;
  methodStatuses?: Record<AnalysisMethod, AnalysisMethodStatus>;
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
  methodStatuses = { ai: "idle", keyword: "idle", rules: "idle" },
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4 space-y-1">
          <p className="font-mono text-xs text-destructive">{error}</p>
          <p className="font-mono text-[10px] text-foreground-muted">
            Finished results stay visible so you can compare the methods that completed.
          </p>
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
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background-subtle px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <p className="font-mono text-[10px] tracking-[0.18em] text-foreground-muted uppercase truncate">
                {loading ? "Running three checks in parallel" : "Analysis complete"}
              </p>
            </div>
            <p className="font-mono text-[10px] text-foreground-muted whitespace-nowrap">
              {Object.values(methodStatuses).filter((status) => status === "done").length}/3 done
            </p>
          </div>

          {/* Method selector */}
          <div className={compact ? "flex gap-0.5 p-0.5 rounded-lg border border-border bg-background-subtle" : "flex gap-1 p-0.5 rounded-lg border border-border bg-background-subtle"}>
            {METHODS.map((m) => (
              <Button
                key={m.id}
                variant={method === m.id ? "" : "ghost"}
                size="sm"
                onClick={() => setMethod(m.id)}
                className={compact ? "relative flex-1 flex flex-col items-center gap-0 h-auto py-1.5 rounded-md text-[9px] uppercase tracking-wide" : `${ method === m.id ? "bg-primary/70" : "" } relative flex-1 flex flex-col items-center gap-0.5 h-auto py-2 rounded-md text-[10px] uppercase tracking-wide`}
              >
                <span className="flex items-center justify-center text-sm leading-none">
                  {methodStatuses[m.id] === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <m.icon className={`h-4 w-4 ${methodStatuses[m.id] === "done" ? "text-green-500" : "text-red-500"}`} aria-hidden="true" />
                  )}
                </span>
                {m.label}
                <span className={compact ? "font-mono text-[8px] leading-none text-foreground-muted" : "font-mono text-[9px] leading-none text-foreground-muted"}>
                  {methodStatuses[m.id] === "loading"
                    ? "Running"
                    : methodStatuses[m.id] === "done"
                      ? "Done"
                      : methodStatuses[m.id] === "error"
                        ? "Failed"
                        : "Waiting"}
                </span>
              </Button>
            ))}
          </div>

          {/* Score row */}
          <div className={compact ? "flex items-center gap-3 rounded-lg border border-border bg-background p-3" : "flex items-center gap-5 rounded-xl border border-border bg-background p-5"}>
            {methodStatuses[method] === "loading" ? (
              <div className={compact ? "flex h-25 flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background-subtle px-4 text-center" : "flex h-30 flex-1 items-center justify-center rounded-xl px-5 text-center"}>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" />
                  <p className="font-mono text-[10px] tracking-widest text-foreground-muted uppercase">
                    {METHODS.find((m) => m.id === method)?.label} analysis is still running
                  </p>
                  <p className="font-mono text-[10px] text-foreground-muted max-w-[20rem]">
                    The other checks will fill in automatically as they finish.
                  </p>
                </div>
              </div>
            ) : methodStatuses[method] === "error" ? (
              <div className={compact ? "flex h-25 flex-1 items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 text-center" : "flex h-30 flex-1 items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-5 text-center"}>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/30 bg-background text-destructive">
                    !
                  </div>
                  <p className="font-mono text-[10px] tracking-widest text-destructive uppercase">
                    {METHODS.find((m) => m.id === method)?.label} analysis failed
                  </p>
                </div>
              </div>
            ) : (
              <>
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
                          {Math.round(s)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
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