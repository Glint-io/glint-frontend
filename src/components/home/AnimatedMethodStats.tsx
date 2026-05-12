"use client";

import { useEffect, useRef, useState } from "react";
import { useSimulatedAnalysis } from "@/lib/useSimulatedAnalysis";

const getScoreColor = (score: number) =>
  score >= 80
    ? "rgb(34,197,94)"
    : score >= 60
      ? "rgb(234,179,8)"
      : "rgb(239,68,68)";

export default function AnimatedMethodStats() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { result } = useSimulatedAnalysis();

  const methods = [
    { label: "AI Semantic", pct: result.score },
    { label: "Keyword Match", pct: result.keywordScore },
    { label: "Rule-Based", pct: result.rulesScore },
  ];
  const highlightScore = result.score;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  if (false) {
    return (
      <div ref={rootRef} className="flex flex-col gap-4">
        {[
          { label: "AI Semantic", pct: 0 },
          { label: "Keyword Match", pct: 0 },
          { label: "Rule-Based", pct: 0 },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-foreground-muted w-28 shrink-0">
              {m.label}
            </span>
            <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full"
                style={
                  {
                    "--fill-percent": `${m.pct}%`,
                    "--anim-delay": "0s",
                    background: "rgb(229,231,235)",
                  } as React.CSSProperties
                }
              />
            </div>
            <span
              className="font-mono text-xs font-semibold w-5 text-right"
              style={{ color: "rgb(229,231,235)" }}
            >
              {m.pct}
            </span>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-border">
          <p className="font-mono text-[10px] text-foreground-muted tracking-wide uppercase mb-3">
            Score over time
          </p>
          <div className="flex items-end gap-1 h-10">
            {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={
                  {
                    "--bar-height": `${h}%`,
                    "--anim-delay": "0s",
                    background: "var(--border)",
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-4">
      {methods.map((m, i) => (
        <div key={m.label} className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-foreground-muted w-28 shrink-0">
            {m.label}
          </span>
          <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full ${isVisible ? "animate-fill-bar" : ""}`}
              style={
                {
                  "--fill-percent": `${m.pct}%`,
                  "--anim-delay": `${0.1 + i * 0.12}s`,
                  background: getScoreColor(m.pct),
                } as React.CSSProperties
              }
            />
          </div>
          <span
            className="font-mono text-xs font-semibold w-5 text-right"
            style={{ color: getScoreColor(m.pct) }}
          >
            {m.pct}
          </span>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-border">
        <p className="font-mono text-[10px] text-foreground-muted tracking-wide uppercase mb-3">
          Score over time
        </p>
        <div className="flex items-end gap-1 h-10">
          {[40, 55, 52, 68, 72, 79, 87].map((h, i, arr) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all ${isVisible ? "animate-rise-bar" : ""}`}
              style={
                {
                  "--bar-height": `${h}%`,
                  "--anim-delay": `${0.05 + i * 0.09}s`,
                  background:
                    i === arr.length - 1
                      ? getScoreColor(highlightScore)
                      : "var(--border)",
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
