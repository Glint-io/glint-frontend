"use client";

import { useState } from "react";
import { runAnalysisWithFallback } from "../lib/data-source";

type AnalysisView = {
    score: number;
    overlap: string[];
    missing: string[];
    feedback: string;
    source: "api" | "mock";
};

export default function AnalysisPage() {
    const [cvText, setCvText] = useState("");
    const [jobText, setJobText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisView>({
        score: 0,
        overlap: [],
        missing: [],
        feedback: "",
        source: "mock",
    });

    async function handleRunAnalysis() {
        setLoading(true);
        const analysis = await runAnalysisWithFallback(cvText, jobText);
        setResult(analysis);
        setSubmitted(true);
        setLoading(false);
    }

    return (
        <div className="w-full rounded-2xl border border-border bg-background-subtle p-6 shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Analys sida</h1>
            <p className="mt-2 text-sm text-foreground-muted">
                Compare CV text with a job ad using a simple keyword match model.
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground-muted">CV Text</span>
                    <textarea
                        value={cvText}
                        onChange={(event) => setCvText(event.target.value)}
                        rows={12}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        placeholder="Paste CV content here..."
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground-muted">Job Ad Text</span>
                    <textarea
                        value={jobText}
                        onChange={(event) => setJobText(event.target.value)}
                        rows={12}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        placeholder="Paste job ad content here..."
                    />
                </label>
            </div>

            <button
                onClick={handleRunAnalysis}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
                type="button"
                disabled={loading}
            >
                {loading ? "Running..." : "Run analysis"}
            </button>

            {submitted ? (
                <section className="mt-6 rounded-xl border border-border bg-background p-4">
                    <h2 className="text-lg font-semibold text-foreground">Result</h2>
                    <p className="mt-2 text-sm text-foreground-muted">
                        Match score: <strong>{result.score}%</strong>
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                        Source: {result.source === "api" ? "Backend API" : "Mock fallback"}
                    </p>
                    <p className="mt-1 text-sm text-foreground-muted">{result.feedback}</p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-foreground">Matched keywords</p>
                            <p className="mt-1 text-sm text-foreground-muted">
                                {result.overlap.slice(0, 20).join(", ") || "No overlap yet"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Missing keywords</p>
                            <p className="mt-1 text-sm text-foreground-muted">
                                {result.missing.slice(0, 20).join(", ") || "No missing keywords"}
                            </p>
                        </div>
                    </div>
                </section>
            ) : null}
        </div>
    );
}