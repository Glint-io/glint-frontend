"use client";

import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { AnalysisMethod } from "@/types/analysis";
import { useState } from "react";
import { useSimulatedAnalysis } from "@/lib/useSimulatedAnalysis";

export function SimulatedAnalysisDemo() {
    const [method, setMethod] = useState<AnalysisMethod>("ai");
    const { result, jobLabel } = useSimulatedAnalysis();

    return (
        <AnalysisResults
            result={result}
            loading={false}
            error={null}
            method={method}
            setMethod={setMethod}
            scoreActive={true}
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
