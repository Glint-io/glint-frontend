import { SectionLabel } from "@/components/analysis/SectionLabel";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

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

// Placeholder data for uploaded CVs
const UPLOADED_CVS = [
  {
    id: 1,
    name: "Senior_Engineer_Resume.pdf",
    uploadedAt: "2 weeks ago",
    size: "245 KB",
  },
  {
    id: 2,
    name: "Product_Manager_CV.pdf",
    uploadedAt: "1 month ago",
    size: "189 KB",
  },
  {
    id: 3,
    name: "Full_Stack_Resume.pdf",
    uploadedAt: "3 weeks ago",
    size: "267 KB",
  },
];

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
}: Props) => {
  const { isLoggedIn } = useAuth();
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [showUploadOption, setShowUploadOption] = useState(false);

  // Show loading state while auth status is being determined
  if (isLoggedIn === null) {
    return (
      <div className="flex flex-col gap-5 h-full">
        <SectionLabel>01 · Inputs</SectionLabel>
        <div className="flex items-center justify-center flex-1">
          <span className="font-mono text-sm text-foreground-muted">Loading...</span>
        </div>
      </div>
    );
  }

  const selectedCV = UPLOADED_CVS.find((cv) => cv.id === selectedCVId);

  return (
    <div className="flex flex-col gap-5 h-full">
      <SectionLabel>01 · Inputs</SectionLabel>
      <div className="flex flex-col gap-5 flex-1">
        {/* CV Selection Section - Only show if logged in */}
        {isLoggedIn && (
          <div className="flex flex-col gap-3">
            <label className="font-mono text-[10px] tracking-[0.15em] text-foreground-muted uppercase">
              Select Resume
            </label>
            {!showUploadOption ? (
              <div className="flex flex-col gap-2">
                <div className="grid gap-2">
                  {UPLOADED_CVS.map((cv) => (
                    <button
                      key={cv.id}
                      onClick={() => setSelectedCVId(cv.id)}
                      className={`flex flex-col gap-1 rounded-lg border-2 px-4 py-3 text-left transition-colors ${selectedCVId === cv.id
                        ? "border-primary bg-background-subtle"
                        : "border-border hover:border-foreground-muted"
                        }`}
                    >
                      <span className="font-mono text-sm font-medium">
                        {cv.name}
                      </span>
                      <span className="font-mono text-xs text-foreground-muted">
                        {cv.uploadedAt} · {cv.size}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowUploadOption(true)}
                  className="font-mono text-xs text-primary hover:underline text-left py-2"
                >
                  Upload a new resume instead →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
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
                <button
                  onClick={() => {
                    setShowUploadOption(false);
                    setSelectedCVId(null);
                  }}
                  className="font-mono text-xs text-primary hover:underline text-left py-2"
                >
                  ← Use existing resume instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Section - Only show if not logged in */}
        {!isLoggedIn && (
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
        )}

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

        <Button
          onClick={onRun}
          disabled={loading || !jobLabel || (!file && !selectedCV)}
          className="w-full"
        >
          {loading ? "Analyzing..." : "Run Analysis →"}
        </Button>
      </div>
    </div>
  );
};
