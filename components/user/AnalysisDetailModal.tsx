"use client";

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

export function AnalysisDetailModal({ item, onClose }: Props) {
  const orderedResults = [...item.results].sort((a, b) => {
    const aRank = METHOD_ORDER[a.method] ?? Number.MAX_SAFE_INTEGER;
    const bRank = METHOD_ORDER[b.method] ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.method.localeCompare(b.method);
  });

  return (
    <Modal onClose={onClose} aria-label="Analysis detail">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted mb-2">
          Analysis detail
        </p>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted mb-2">
          Job title
        </p>
        <h2 className="font-mono text-lg font-semibold text-foreground leading-snug">
          {item.jobTitle ?? "—"}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
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
          <span className="font-mono text-xs text-foreground-muted">
            {item.resumeFileName}
          </span>
        </div>
      </div>

      {/* Overall pill */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 mb-6">
        <span className="font-mono text-xs text-foreground-muted uppercase tracking-widest">
          Overall
        </span>
        <GradientScorePill results={item.results} />
      </div>

      {/* Per-method breakdown */}
      <div className="flex flex-col gap-4">
        {orderedResults.map((result) => {
          const Icon = METHOD_ICONS[result.method] ?? Hash;

          return (
            <div
              key={result.id}
              className="rounded-xl border border-border bg-background px-5 py-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {METHOD_LABELS[result.method] ?? result.method}
                </span>
              </div>

              <ScoreBar score={result.score} />

              {result.feedback && (
                <p className="font-mono text-xs leading-relaxed text-foreground-muted border-t border-border pt-3">
                  {result.feedback}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
