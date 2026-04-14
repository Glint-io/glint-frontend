import { SectionLabel } from "@/components/analysis/SectionLabel";

interface Props {
  file: File | null;
  fileError: string;
  jobLabel: string;
  jobText: string;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLabelChange: (val: string) => void;
  onTextChange: (val: string) => void;
  onRun: () => void;
}

export const AnalysisInputs = ({
  file,
  fileError,
  jobLabel,
  jobText,
  loading,
  onFileChange,
  onLabelChange,
  onTextChange,
  onRun,
}: Props) => (
  <div className="flex flex-col gap-5 h-full">
    <SectionLabel>01 · Inputs</SectionLabel>
    <div className="flex flex-col gap-5 flex-1">
      <label className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background-subtle px-6 py-8 cursor-pointer hover:border-primary transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="sr-only"
        />
        <span className="text-3xl">{file ? "📄" : "⬆"}</span>
        <span className="font-mono text-sm font-medium">
          {file ? file.name : "Upload Resume PDF"}
        </span>
        {fileError && (
          <span className="font-mono text-xs text-destructive">
            {fileError}
          </span>
        )}
      </label>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] tracking-[0.15em] text-foreground-muted uppercase">
          Position Title
        </label>
        <input
          type="text"
          value={jobLabel}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm focus:border-primary outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <label className="font-mono text-[10px] tracking-[0.15em] text-foreground-muted uppercase">
          Job Ad Text
        </label>
        <textarea
          value={jobText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste job description here..."
          className="w-full h-full min-h-65 resize-none rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm focus:border-primary outline-none"
        />
      </div>

      <button
        onClick={onRun}
        disabled={loading || !jobLabel}
        className="w-full rounded-lg bg-primary px-6 py-4 font-mono text-sm font-semibold text-primary-fg uppercase hover:bg-primary-hover disabled:opacity-30 transition-all"
      >
        {loading ? "Analyzing..." : "Run Analysis →"}
      </button>
    </div>
  </div>
);
