"use client";

import { useEffect, useState } from "react";
import { AnalysisResult } from "@/types/analysis";

const SAMPLE_JOBS = [
  "Senior Frontend Engineer",
  "Full Stack Developer",
  "Product Manager",
  "Data Scientist",
  "DevOps Engineer",
  "UX/UI Designer",
  "Solutions Architect",
  "Backend Engineer",
];

const FEEDBACK_TEMPLATES = {
  ai: [
    "Strong conceptual overlap with role requirements. Your experience aligns well with the core responsibilities.",
    "Good semantic match. Most technical skills transfer directly to this position.",
    "Moderate alignment. Some experience gaps in specialized areas mentioned in the job description.",
    "Limited overlap. Would need to develop skills in key areas this role emphasizes.",
    "Excellent conceptual fit. Your background covers advanced concepts this role requires.",
  ],
  keyword: [
    "All critical keywords matched. 89% of required terms found in your CV.",
    "Most keywords present. Missing coverage in 2-3 specialized technical areas.",
    "Partial keyword match. Missing several industry-specific terms.",
    "Limited keyword coverage. Would benefit from highlighting relevant experience.",
    "Nearly perfect keyword alignment. You explicitly mention almost all required terms.",
  ],
  rules: [
    "Meets all hard requirements. Experience and certifications check out.",
    "Meets most requirements. One or two criteria partially addressed.",
    "Meets core requirements. Some nice-to-haves not clearly demonstrated.",
    "Missing some key criteria. Would strengthen application if addressed.",
    "Exceeds requirements in multiple areas. Strong profile match.",
  ],
};

export function useSimulatedAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [jobLabel, setJobLabel] = useState("");

  const generateResult = () => {
    // Generate correlated scores (they tend to be in similar ranges)
    const baseScore = Math.random();
    const variance = 0.15;

    const score = Math.max(
      35,
      Math.min(
        98,
        Math.round(baseScore * 100 + (Math.random() - 0.5) * variance * 100)
      )
    );

    const keywordScore = Math.max(
      30,
      Math.min(
        100,
        Math.round(score + (Math.random() - 0.5) * 25)
      )
    );

    const rulesScore = Math.max(
      35,
      Math.min(
        100,
        Math.round(score + (Math.random() - 0.5) * 20)
      )
    );

    const getFeedback = (scores: number[], templates: string[]) => {
      const avg = Math.round((scores[0] + scores[1] + scores[2]) / 3);
      if (avg >= 85) return templates[4];
      if (avg >= 70) return templates[0];
      if (avg >= 55) return templates[1];
      if (avg >= 40) return templates[2];
      return templates[3];
    };

    const scores = [score, keywordScore, rulesScore];

    setJobLabel(
      SAMPLE_JOBS[Math.floor(Math.random() * SAMPLE_JOBS.length)]
    );

    setResult({
      score,
      keywordScore,
      rulesScore,
      feedback: getFeedback(scores, FEEDBACK_TEMPLATES.ai),
      keywordFeedback: getFeedback(scores, FEEDBACK_TEMPLATES.keyword),
      rulesFeedback: getFeedback(scores, FEEDBACK_TEMPLATES.rules),
    });
  };

  useEffect(() => {
    // Generate initial result
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateResult();
  }, []);

  return {
    result,
    jobLabel,
  };
}
