"use client";

import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { AnalysisMethod, AnalysisMethodStatus } from "@/types/analysis";
import { useState, useEffect } from "react";
import { useSimulatedAnalysis } from "@/lib/useSimulatedAnalysis";

export function SimulatedAnalysisDemo() {
    const [method, setMethod] = useState<AnalysisMethod>("ai");
    const [loading, setLoading] = useState(true);
    const [methodStatuses, setMethodStatuses] = useState<Record<AnalysisMethod, AnalysisMethodStatus>>({
        ai: "loading",
        keyword: "loading",
        rules: "loading",
    });
    const { result, jobLabel } = useSimulatedAnalysis();

    useEffect(() => {
        // Simulate staggered completion of analysis methods
        const timings = {
            ai: 1200,
            keyword: 1800,
            rules: 2400,
        };

        const timeouts = Object.entries(timings).map(([methodKey, delay]) =>
            setTimeout(() => {
                setMethodStatuses((prev) => ({
                    ...prev,
                    [methodKey as AnalysisMethod]: "done",
                }));
            }, delay)
        );

        // After all methods complete, turn off loading state
        const finalTimeout = setTimeout(() => {
            setLoading(false);
        }, 2500);

        return () => {
            timeouts.forEach((t) => clearTimeout(t));
            clearTimeout(finalTimeout);
        };
    }, []);

    return (
        <AnalysisResults
            result={result}
            loading={loading}
            error={null}
            method={method}
            setMethod={setMethod}
            methodStatuses={methodStatuses}
            scoreActive={!loading}
            displayScore={
                method === "ai"
                    ? result?.score ?? 0
                    : method === "keyword"
                        ? result?.keywordScore ?? 0
                        : result?.rulesScore ?? 0
            }
            jobLabel={jobLabel}
            showLabel={false}
            compact={true}
        />
    );
}
