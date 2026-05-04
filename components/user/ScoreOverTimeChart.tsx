"use client";
import { useEffect, useRef } from "react";
import type { Statistics } from "@/types";

type Props = {
  scoreOverTime: Statistics["scoreOverTime"];
};

const METHOD_CONFIG: Record<
  string,
  { label: string; color: string; dash: number[] }
> = {
  AI: { label: "AI", color: "#7F77DD", dash: [] },
  RuleBased: { label: "Rule-based", color: "#1D9E75", dash: [5, 3] },
  Keyword: { label: "Keyword", color: "#D85A30", dash: [2, 2] },
};

const METHOD_ORDER = ["AI", "RuleBased", "Keyword"];

const toDateKey = (iso: string) => iso.slice(0, 10);

/**
 * For each (date, method) pair keep only the latest entry.
 * "Latest" = the entry with the lexicographically greatest `date` string,
 * which works correctly for ISO-8601 timestamps.
 */
function aggregateLatestPerDay(
  data: Statistics["scoreOverTime"],
): Statistics["scoreOverTime"] {
  const map = new Map<string, (typeof data)[number]>();

  for (const point of data) {
    const key = `${toDateKey(point.date)}__${point.method}`;
    const existing = map.get(key);
    if (!existing || point.date > existing.date) {
      map.set(key, point);
    }
  }

  return [...map.values()];
}

export function ScoreOverTimeChart({ scoreOverTime }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !scoreOverTime?.length) return;

    import("chart.js/auto").then((mod) => {
      const Chart = mod.default;

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const aggregated = aggregateLatestPerDay(scoreOverTime);

      const allDates = [
        ...new Set(aggregated.map((d) => toDateKey(d.date))),
      ].sort();

      const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

      const datasets = METHOD_ORDER.filter((m) =>
        aggregated.some((d) => d.method === m),
      ).map((m) => {
        const cfg = METHOD_CONFIG[m] ?? {
          label: m,
          color: "#888780",
          dash: [],
        };
        return {
          label: cfg.label,
          data: allDates.map((date) => {
            const point = aggregated.find(
              (d) => toDateKey(d.date) === date && d.method === m,
            );
            return point ? point.score : null;
          }),
          borderColor: cfg.color,
          backgroundColor: cfg.color + "18",
          borderWidth: 1.5,
          borderDash: cfg.dash,
          pointRadius: 3,
          pointBackgroundColor: cfg.color,
          tension: 0.35,
          spanGaps: false,
        };
      });

      chartRef.current = new Chart(canvasRef.current!, {
        type: "line",
        data: {
          labels: allDates.map(formatDate),
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(1)}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(128,128,128,0.08)" },
              ticks: {
                font: { family: "monospace", size: 10 },
                color: "#888",
                autoSkip: true,
                maxTicksLimit: 8,
              },
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: "rgba(128,128,128,0.08)" },
              ticks: {
                font: { family: "monospace", size: 10 },
                color: "#888",
                stepSize: 25,
              },
            },
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [scoreOverTime]);

  if (!scoreOverTime?.length) return null;

  const presentMethods = METHOD_ORDER.filter((m) =>
    scoreOverTime.some((d) => d.method === m),
  );

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted mb-5">
        Score over time
      </p>

      <div className="relative w-full" style={{ height: 220 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Line chart showing analysis scores over time by method"
        >
          Score over time by method.
        </canvas>
      </div>

      {/* Custom legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {presentMethods.map((m) => {
          const cfg = METHOD_CONFIG[m] ?? {
            label: m,
            color: "#888780",
            dash: [],
          };
          return (
            <span
              key={m}
              className="flex items-center gap-1.5 font-mono text-[10px] text-foreground-muted"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: cfg.color }}
              />
              {cfg.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
