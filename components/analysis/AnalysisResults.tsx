"use client";

import { useState } from "react";
import { ScoreRing } from "./ScoreRing";
import { SectionLabel } from "@/components/analysis/SectionLabel";
import { Modal } from "@/components/ui/Modal";
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

interface KeywordFeedbackData {
  summary: string;
  matched: string[];
  missing: string[];
  tip: string;
}

function parseKeywordFeedback(raw: string): KeywordFeedbackData | null {
  try {
    const data = JSON.parse(raw);
    if (typeof data?.summary === "string" && Array.isArray(data?.matched)) {
      return data as KeywordFeedbackData;
    }
  } catch { }
  return null;
}

function KeywordFeedbackView({ data }: { data: KeywordFeedbackData }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-mono text-[10px] text-foreground-muted">{data.summary}</p>

      {data.matched.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
            Matched
          </span>
          <div className="flex flex-wrap gap-1">
            {data.matched.map((term) => (
              <span
                key={term}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
              >
                <span className="text-[8px] opacity-70">✓</span>
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.missing.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-widest text-foreground-muted">
            Missing
          </span>
          <div className="flex flex-wrap gap-1">
            {data.missing.map((term) => (
              <span
                key={term}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20"
              >
                <span className="text-[8px] opacity-70">✗</span>
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.tip && (
        <p className="font-mono text-[9px] text-foreground-muted italic border-t border-border pt-2">
          {data.tip}
        </p>
      )}
    </div>
  );
}

function FeedbackContent({
  method,
  result,
}: {
  method: AnalysisMethod;
  result: AnalysisResult;
}) {
  const raw =
    method === "ai"
      ? (result.feedback ?? "")
      : method === "keyword"
        ? (result.keywordFeedback ?? "")
        : (result.rulesFeedback ?? "");

  if (!raw) {
    return (
      <p className="font-mono text-[10px] text-foreground-muted italic">
        No feedback available for this method.
      </p>
    );
  }

  if (method === "keyword") {
    const data = parseKeywordFeedback(raw);
    if (data) return <KeywordFeedbackView data={data} />;
  }

  return (
    <div className="flex flex-col gap-1">
      {raw.split("\n").map((line, i) => (
        <p key={i} className="font-mono text-[10px] leading-relaxed text-foreground-muted italic">
          {line}
        </p>
      ))}
    </div>
  );
}

function getFeedbackRaw(method: AnalysisMethod, result: AnalysisResult) {
  return method === "ai"
    ? (result.feedback ?? "")
    : method === "keyword"
      ? (result.keywordFeedback ?? "")
      : (result.rulesFeedback ?? "");
}

function FeedbackPanel({
  method,
  result,
  compact,
}: {
  method: AnalysisMethod;
  result: AnalysisResult;
  compact: boolean;
}) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const rawFeedback = getFeedbackRaw(method, result);
  const canOpenFeedback = Boolean(rawFeedback);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-background overflow-hidden flex-1">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 shrink-0">
        <span className="text-primary text-xs">◈</span>
        <p className="font-mono text-[9px] tracking-[0.2em] text-foreground-muted uppercase">
          Feedback
        </p>
      </div>

      <div
        className={
          compact
            ? "flex flex-1 min-h-0 flex-col p-3 gap-2"
            : "flex flex-1 min-h-0 flex-col p-4 gap-3"
        }
      >
        {/* Preview — fills all space, clips overflow */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <FeedbackContent method={method} result={result} />
        </div>

        {/* Button row — never grows or shrinks */}
        {canOpenFeedback && (
          <div className="shrink-0 border-t border-border pt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFeedbackOpen(true)}
              className="h-7 px-3 font-mono text-[9px] uppercase tracking-[0.18em]"
            >
              See more
            </Button>
          </div>
        )}
      </div>

      {feedbackOpen && (
        <Modal
          onClose={() => setFeedbackOpen(false)}
          aria-label={`${METHODS.find((item) => item.id === method)?.label ?? "Analysis"} feedback`}
          panelClassName="max-w-4xl max-h-[85vh] overflow-hidden p-0"
        >
          <div className="flex max-h-[85vh] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 pr-14">
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
                  Feedback
                </p>
                <h2 className="mt-2 truncate font-mono text-lg font-semibold text-foreground">
                  {METHODS.find((item) => item.id === method)?.label} ·{" "}
                  {result.score || result.keywordScore || result.rulesScore
                    ? `${Math.round(method === "ai" ? result.score : method === "keyword" ? result.keywordScore : result.rulesScore)} match`
                    : "Full view"}
                </h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="rounded-2xl border border-border bg-background-subtle/60 p-5">
                <FeedbackContent method={method} result={result} />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

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

export const AnalysisResults = (props: Props) => <AnalysisResultsInner {...props} />;

function AnalysisResultsInner({
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
}: Props) {
  return (
    <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-6 h-full overflow-y-auto"}>
      {showLabel && <SectionLabel>03 · Results</SectionLabel>}

      <div className={compact ? "flex flex-col gap-3" : "flex flex-col flex-1 min-h-0"}>
        {error && !loading && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4 space-y-1 shrink-0">
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
          <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-400"}>
            {/* Status bar */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background-subtle px-3 py-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <p className="font-mono text-[10px] tracking-[0.18em] text-foreground-muted uppercase truncate">
                  {loading ? "Running three checks in parallel" : "Analysis complete"}
                </p>
              </div>
              <p className="font-mono text-[10px] text-foreground-muted whitespace-nowrap">
                {Object.values(methodStatuses).filter((s) => s === "done").length}/3 done
              </p>
            </div>

            {/* Method tabs */}
            <div className={compact ? "flex gap-0.5 p-0.5 rounded-lg border border-border bg-background-subtle shrink-0" : "flex gap-1 p-0.5 rounded-lg border border-border bg-background-subtle shrink-0"}>
              {METHODS.map((m) => (
                <Button
                  key={m.id}
                  variant={method === m.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMethod(m.id)}
                  className={compact
                    ? "relative flex-1 flex flex-col items-center gap-0 h-auto py-1.5 rounded-md text-[9px] uppercase tracking-wide"
                    : `${method === m.id ? "bg-primary/70" : ""} relative flex-1 flex flex-col items-center gap-0.5 h-auto py-2 rounded-md text-[10px] uppercase tracking-wide`}
                >
                  <span className="flex items-center justify-center text-sm leading-none">
                    {methodStatuses[m.id] === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <m.icon
                        className={`h-4 w-4 ${methodStatuses[m.id] === "done" ? "text-green-500" : "text-red-500"}`}
                        aria-hidden="true"
                      />
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
            <div className={compact ? "flex items-center gap-3 rounded-lg border border-border bg-background p-3 shrink-0" : "flex items-center gap-5 rounded-xl border border-border bg-background p-5 shrink-0"}>
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/30 bg-background text-destructive">!</div>
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
                    <div className="flex gap-2 mt-1">
                      {METHODS.map((m) => {
                        const s =
                          m.id === "ai" ? result.score
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

            {/* Feedback panel — flex-1 min-h-0 so it fills remaining space */}
            <FeedbackPanel method={method} result={result} compact={compact} />
          </div>
        ) : null}
      </div>
    </div>
  );
}