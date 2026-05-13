"use client";

import { MarkdownContent } from "@/components/ui/MarkdownContent";
import {
  KeywordFeedbackView,
  parseKeywordFeedback,
  RulesFeedbackView,
  parseRulesFeedback,
} from "@/components/analysis/AnalysisResults";
import { Modal } from "@/components/ui/Modal";
import { GradientScorePill } from "@/components/user/GradientScorePill";
import { Button } from "@/components/ui/Button";
import type { HistoryItem, JobAdvertisement } from "@/types";
import {
  Bot,
  Eye,
  Hash,
  ListChecks,
  ScanText,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

type Props = {
  item: HistoryItem;
  onClose: () => void;
  jobAdvertisements?: JobAdvertisement[];
  onJobAdPreview?: (jobAd: JobAdvertisement) => void;
};

const METHOD_LABELS: Record<string, string> = {
  AI: "AI Semantic",
  RuleBased: "Rule-Based",
  Keyword: "Keyword Match",
};

const METHOD_ICONS: Record<string, LucideIcon> = {
  AI: Bot,
  RuleBased: ListChecks,
  Keyword: ScanText,
};

const METHOD_ORDER: Record<string, number> = {
  AI: 0,
  RuleBased: 1,
  Keyword: 2,
};

// All methods that should always appear, even if missing from results
const ALL_METHODS = ["AI", "RuleBased", "Keyword"] as const;

/** Returns true when a result is a known failure (score=0 + error-like feedback) */
function isFailedResult(result: HistoryItem["results"][number]): boolean {
  if (result.score !== 0 && result.score !== null) return false;
  if (!result.feedback) return false;
  const lower = result.feedback.toLowerCase();
  return (
    lower.includes("failed") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("rate limit") ||
    lower.includes("api_key") ||
    lower.includes("error") ||
    lower.includes("blocked") ||
    lower.includes("googleapis") ||
    lower.includes("rule evaluation failed")
  );
}

/** Extracts a short, human-readable reason from an error feedback string */
function extractErrorReason(feedback: string): string {
  // Rule evaluation failures
  if (feedback.toLowerCase().includes("rule evaluation failed")) {
    return "Rule evaluation failed. This can happen due to temporary service issues.";
  }
  // AI quota / rate limit
  if (
    feedback.toLowerCase().includes("rate limit") ||
    feedback.toLowerCase().includes("high demand") ||
    feedback.toLowerCase().includes("429")
  ) {
    return "Service temporarily unavailable due to high demand. Try running a new analysis.";
  }
  // Google API blocked
  if (
    feedback.toLowerCase().includes("googleapis") ||
    feedback.toLowerCase().includes("api_key") ||
    feedback.toLowerCase().includes("blocked")
  ) {
    return "AI provider returned an error. This is usually temporary.";
  }
  // Generic fallback
  return "This analysis method encountered an error. Try running a new analysis.";
}

const ScoreBar = ({ score }: { score: number | null }) => {
  if (score == null)
    return <span className="font-mono text-xs text-foreground-muted">—</span>;
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-sm font-semibold text-foreground w-10 text-right">
        {score.toFixed(1)}
      </span>
    </div>
  );
};

const FailedResultCard = ({
  method,
  feedback,
}: {
  method: string;
  feedback: string | null;
}) => {
  const Icon = METHOD_ICONS[method] ?? Hash;
  const reason = feedback
    ? extractErrorReason(feedback)
    : "This analysis method did not complete.";

  return (
    <div className="rounded-xl border border-border bg-background flex flex-col overflow-hidden max-h-64 md:max-h-none opacity-70">
      {/* Header */}
      <div className="shrink-0 flex flex-col gap-2.5 px-3 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-border">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{METHOD_LABELS[method] ?? method}</span>
        </span>
        {/* Flat grey bar for failed */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-0 rounded-full bg-border" />
          </div>
          <span className="font-mono text-sm font-semibold text-foreground-muted w-10 text-right">
            —
          </span>
        </div>
      </div>

      {/* Error body */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-5 text-center">
        <AlertCircle
          className="h-5 w-5 text-foreground-muted shrink-0"
          aria-hidden="true"
        />
        <p className="font-mono text-[10px] leading-relaxed text-foreground-muted max-w-[22ch]">
          {reason}
        </p>
      </div>
    </div>
  );
};

const MissingResultCard = ({ method }: { method: string }) => {
  const Icon = METHOD_ICONS[method] ?? Hash;

  return (
    <div className="rounded-xl border border-dashed border-border bg-background/50 flex flex-col overflow-hidden max-h-64 md:max-h-none opacity-50">
      <div className="shrink-0 flex flex-col gap-2.5 px-3 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-border/50">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-foreground-muted">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{METHOD_LABELS[method] ?? method}</span>
        </span>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-border" />
          <span className="font-mono text-sm font-semibold text-foreground-muted w-10 text-right">
            —
          </span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-5">
        <p className="font-mono text-[10px] text-foreground-muted text-center">
          No result recorded.
        </p>
      </div>
    </div>
  );
};

const formatMethodFeedback = (result: HistoryItem["results"][number]) => {
  if (!result.feedback) return null;

  if (result.method === "AI") {
    return <MarkdownContent content={result.feedback} />;
  }

  if (result.method === "Keyword") {
    const data = parseKeywordFeedback(result.feedback || "");
    if (data) return <KeywordFeedbackView data={data} />;
    return (
      <p className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-foreground-muted">
        {result.feedback}
      </p>
    );
  }

  if (result.method === "RuleBased") {
    const data = parseRulesFeedback(result.feedback || "");
    if (data) return <RulesFeedbackView data={data} />;
    return (
      <p className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-foreground-muted">
        {result.feedback}
      </p>
    );
  }

  return (
    <p className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-foreground-muted">
      {result.feedback}
    </p>
  );
};

export function AnalysisDetailModal({
  item,
  onClose,
  jobAdvertisements = [],
  onJobAdPreview,
}: Props) {
  // Build a lookup by method name for quick access
  const resultByMethod = Object.fromEntries(
    item.results.map((r) => [r.method, r]),
  );

  const matchingJobAd = (() => {
    if (!item.jobAdSnippet) return undefined;
    return jobAdvertisements.find((ad) =>
      ad.rawText.includes(item.jobAdSnippet!.substring(0, 50)),
    );
  })();

  return (
    <Modal
      onClose={onClose}
      aria-label="Analysis detail"
      panelClassName="w-[95vw] max-w-8xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden p-0"
    >
      <div className="flex max-h-[92vh] sm:max-h-[85vh] flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-border px-4 sm:px-6 py-4 pr-12 sm:pr-14">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Analysis detail
          </p>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h2 className="min-w-0 font-mono text-lg font-semibold leading-snug text-foreground truncate">
              {item.jobTitle ?? "—"}
            </h2>
            <div className="mt-1.5 sm:mt-0 sm:shrink-0">
              <GradientScorePill orientation="row" results={item.results} />
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-0.5">
            <span className="font-mono text-xs text-foreground-muted break-all">
              {item.resumeFileName}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-foreground-muted">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="font-mono text-xs text-foreground-muted">
                {new Date(item.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-3 px-3 sm:px-6 py-3 sm:py-5">
            {/* Job advertisement */}
            <div className="shrink-0 relative rounded-xl border border-border bg-background-subtle/50 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                  Job advertisement
                </span>
                <p className="mt-1.5 max-h-32 overflow-y-auto whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-foreground-muted pr-10">
                  {item.jobAdSnippet || "No job advertisement text available."}
                </p>
              </div>
              {item.jobAdSnippet && onJobAdPreview && matchingJobAd && (
                <button
                  type="button"
                  onClick={() => onJobAdPreview(matchingJobAd)}
                  className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
                  aria-label="Preview job advertisement"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Method cards — always render all three slots */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {ALL_METHODS.map((method) => {
                const result = resultByMethod[method];

                // Method not present at all (very old analyses)
                if (!result) {
                  return <MissingResultCard key={method} method={method} />;
                }

                // Method ran but failed
                if (isFailedResult(result)) {
                  return (
                    <FailedResultCard
                      key={result.id}
                      method={result.method}
                      feedback={result.feedback}
                    />
                  );
                }

                // Normal result
                const Icon = METHOD_ICONS[result.method] ?? Hash;
                return (
                  <div
                    key={result.id}
                    className="rounded-xl border border-border bg-background flex flex-col overflow-hidden max-h-64 md:max-h-none"
                  >
                    <div className="shrink-0 flex flex-col gap-2.5 px-3 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-border">
                      <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                        <Icon
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {METHOD_LABELS[result.method] ?? result.method}
                        </span>
                      </span>
                      <ScoreBar score={result.score} />
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-5 py-3 sm:py-4">
                      {formatMethodFeedback(result)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
