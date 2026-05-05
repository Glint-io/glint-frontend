"use client";

import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { KeywordFeedbackView, parseKeywordFeedback } from "@/components/analysis/AnalysisResults"
import { Modal } from "@/components/ui/Modal";
import { GradientScorePill } from "@/components/user/GradientScorePill";
import type { HistoryItem } from "@/types";
import { Bot, Hash, ListChecks, ScanText, type LucideIcon } from "lucide-react";

type Props = {
  item: HistoryItem;
  onClose: () => void;
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

const formatMethodFeedback = (result: HistoryItem["results"][number]) => {
  if (!result.feedback) return null;

  if (result.method === "AI") {
    return (
      <MarkdownContent
        content={result.feedback}
        className="rounded-xl border border-border bg-background-subtle/60 p-3.5"
      />
    );
  }

  if(result.method === "Keyword") {
    const data = parseKeywordFeedback(result.feedback || "");
    if (data) {
      return <KeywordFeedbackView data={data} />;
    }
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

export function AnalysisDetailModal({ item, onClose }: Props) {
  const orderedResults = [...item.results].sort((a, b) => {
    const aRank = METHOD_ORDER[a.method] ?? Number.MAX_SAFE_INTEGER;
    const bRank = METHOD_ORDER[b.method] ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.method.localeCompare(b.method);
  });

  return (
    <Modal
      onClose={onClose}
      aria-label="Analysis detail"
      panelClassName="max-w-4xl max-h-[85vh] max-w-[80vw] overflow-hidden p-0"
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-border px-6 py-5 pr-14">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
              Analysis detail
            </p>
            <h2 className="mt-2 truncate font-mono text-lg font-semibold text-foreground leading-snug">
              {item.jobTitle ?? "—"}
            </h2>
            <div className="mt-2 grid min-w-0 grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-3">
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
              <span className="min-w-0 font-mono text-xs text-foreground-muted break-all">
                {item.resumeFileName}
              </span>
            </div>
          </div>
        </div>

        {/* Body — flex column, never scrolls itself */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-6 py-5 gap-6">
          {/* Overall pill — pinned, never scrolls */}
          <div className="shrink-0 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
            <span className="font-mono text-xs text-foreground-muted uppercase tracking-widest">
              Overall
            </span>
            <GradientScorePill results={item.results} />
          </div>

          {/* Per-method breakdown — fills remaining height */}
          <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 md:grid-cols-3">
            {orderedResults.map((result) => {
              const Icon = METHOD_ICONS[result.method] ?? Hash;

              return (
                <div
                  key={result.id}
                  className="min-h-0 min-w-0 rounded-xl border border-border bg-background flex flex-col overflow-hidden"
                >
                  {/* Card header — pinned */}
                  <div className="shrink-0 flex flex-col gap-3 px-5 pt-4 pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="min-w-0 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate">
                          {METHOD_LABELS[result.method] ?? result.method}
                        </span>
                      </span>
                    </div>
                    <ScoreBar score={result.score} />
                  </div>

                  {/* Card content — scrolls */}
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 py-4">
                    {formatMethodFeedback(result)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}