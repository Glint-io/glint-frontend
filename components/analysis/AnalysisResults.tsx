import { ScoreRing } from "./ScoreRing";
import { SectionLabel } from "@/components/analysis/SectionLabel";
import { AnalysisMethod, AnalysisResult } from "@/types/analysis";

const METHODS: {
  id: AnalysisMethod;
  icon: string;
  label: string;
  desc: string;
}[] = [
  { id: "ai", icon: "✦", label: "AI Analysis", desc: "Semantic understanding" },
  {
    id: "keyword",
    icon: "⌖",
    label: "Keyword Match",
    desc: "Keyword and term overlap",
  },
  {
    id: "rules",
    icon: "⚙",
    label: "Rule-Based",
    desc: "Industry standard criteria",
  },
];

interface Props {
  result: AnalysisResult | null;
  loading: boolean;
  method: AnalysisMethod;
  setMethod: (m: AnalysisMethod) => void;
  scoreActive: boolean;
  displayScore: number;
  jobLabel: string;
}

export const AnalysisResults = ({
  result,
  loading,
  method,
  setMethod,
  scoreActive,
  displayScore,
  jobLabel,
}: Props) => (
  <div className="flex flex-col gap-5 h-full">
    <SectionLabel>02 · Results</SectionLabel>
    <div className="flex flex-col flex-1">
      {!result ? (
        <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed border-border bg-background-subtle py-12 gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
          ) : (
            <p className="font-mono text-xs tracking-widest text-foreground-muted uppercase">
              Ready for analysis
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-background-subtle p-1">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1 rounded-lg py-2.5 font-mono text-[10px] uppercase transition-all ${
                  method === m.id
                    ? "bg-background border border-border text-primary shadow-sm"
                    : "text-foreground-muted"
                }`}
              >
                <span className="text-sm">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Score row */}
          <div className="flex items-center gap-6 rounded-xl border border-border bg-background-subtle p-5">
            <ScoreRing target={displayScore} active={scoreActive} />
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <p className="font-mono text-base font-semibold truncate">
                {jobLabel}
              </p>
              <p className="font-mono text-xs text-foreground-muted">
                {METHODS.find((m) => m.id === method)?.desc}
              </p>
            </div>
          </div>

          {/* Feedback card — grows to fill remaining height */}
          <div className="flex flex-col flex-1 rounded-xl border border-border bg-background-subtle overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="text-primary text-xs">◈</span>
              <p className="font-mono text-[9px] tracking-[0.2em] text-foreground-muted uppercase">
                Feedback
              </p>
            </div>
            <div className="flex-1 p-4">
              <p className="font-mono text-xs leading-relaxed italic">
                {method === "ai"
                  ? result.feedback
                  : `${method.toUpperCase()} analysis loaded from external source.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
