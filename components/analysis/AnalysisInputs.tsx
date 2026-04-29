import { SectionLabel } from "@/components/analysis/SectionLabel";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { authedGet } from "@/lib/auth";

type Resume = {
  resumeId: string;
  fileName: string;
  uploadedAt: string;
  sizeBytes?: number;
};

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
}: Props) => {
  const { isLoggedIn } = useAuth();
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchResumes = async () => {
        setResumesLoading(true);
        try {
          const data = await authedGet<Resume[]>("/user/resume");
          setResumes(data || []);
        } catch (err) {
          console.error("Failed to fetch resumes:", err);
          setResumes([]);
        } finally {
          setResumesLoading(false);
        }
      };
      fetchResumes();
    }
  }, [isLoggedIn]);

  async function handleViewResume(resumeId: string) {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
      "https://localhost:7248";

    try {
      const auth = localStorage.getItem("glint.auth");
      const token = auth ? JSON.parse(auth).accessToken : "";

      const res = await fetch(`${base}/user/resume/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to view resume:", err);
    }
  }

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

  const selectedCV = resumes.find((cv) => cv.resumeId === selectedCVId);

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
                {resumesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="font-mono text-xs text-foreground-muted">Loading resumes...</span>
                  </div>
                ) : resumes.length > 0 ? (
                  <div className="grid gap-2">
                    {resumes.map((cv) => (
                      <div
                        key={cv.resumeId}
                        className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors ${selectedCVId === cv.resumeId
                            ? "border-primary bg-background-subtle"
                            : "border-border hover:border-foreground-muted"
                          }`}
                      >
                        <button
                          onClick={() => setSelectedCVId(cv.resumeId)}
                          className="flex-1 text-left"
                        >
                          <span className="font-mono text-sm font-medium">
                            {cv.fileName}
                          </span>
                          <span className="font-mono text-xs text-foreground-muted block">
                            {new Date(cv.uploadedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            {cv.sizeBytes != null &&
                              ` · ${(cv.sizeBytes / 1024).toFixed(0)} KB`}
                          </span>
                        </button>
                        <button
                          onClick={() => handleViewResume(cv.resumeId)}
                          className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                          title="View resume"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <span className="font-mono text-xs text-foreground-muted">No resumes saved yet. Upload one below.</span>
                  </div>
                )}
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
