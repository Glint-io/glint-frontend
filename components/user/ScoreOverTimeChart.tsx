"use client";
import { useEffect, useRef } from "react";
import type { HistoryRange, Statistics } from "@/types";

type Props = {
  scoreOverTime: Statistics["scoreOverTime"];
  range: HistoryRange;
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

const FALLBACK_METHOD_STYLE = {
  label: "Other",
  color: "#888780",
  dash: [] as number[],
};

const TICK_FORMATTERS: Record<HistoryRange, Intl.DateTimeFormatOptions> = {
  Today: { hour: "2-digit", minute: "2-digit" },
  Last7Days: { month: "short", day: "numeric" },
  Last30Days: { month: "short", day: "numeric" },
  Last365Days: { month: "short", year: "2-digit" },
  All: { month: "short", year: "numeric" },
};

const FULL_DATE_FORMATTER: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const METHOD_TICK_LIMIT: Record<HistoryRange, number> = {
  Today: 10,
  Last7Days: 8,
  Last30Days: 10,
  Last365Days: 12,
  All: 12,
};

const toEpochMs = (iso: string) => new Date(iso).getTime();

const formatTick = (value: number, range: HistoryRange) =>
  new Date(value).toLocaleDateString(undefined, TICK_FORMATTERS[range]);

const formatFullDate = (value: number) =>
  new Date(value).toLocaleString(undefined, FULL_DATE_FORMATTER);

export function ScoreOverTimeChart({ scoreOverTime, range }: Props) {
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

      const sortedPoints = [...scoreOverTime]
        .filter((d) => Number.isFinite(toEpochMs(d.date)))
        .sort((a, b) => toEpochMs(a.date) - toEpochMs(b.date));

      if (!sortedPoints.length) return;

      const knownMethods = METHOD_ORDER.filter((m) =>
        sortedPoints.some((d) => d.method === m),
      );
      const otherMethods = [...new Set(sortedPoints.map((d) => d.method))].filter(
        (m) => !METHOD_ORDER.includes(m),
      );
      const methodOrder = [...knownMethods, ...otherMethods];

      const xMin = toEpochMs(sortedPoints[0].date);
      const xMax = toEpochMs(sortedPoints[sortedPoints.length - 1].date);
      const hasSinglePoint = xMin === xMax;
      const singlePointPaddingMs = 1000 * 60 * 60 * 12;

      const pointRadius =
        sortedPoints.length > 120 ? 1.5 : sortedPoints.length > 60 ? 2 : 3;

      const datasets = methodOrder.map((method) => {
        const cfg = METHOD_CONFIG[method] ?? {
          ...FALLBACK_METHOD_STYLE,
          label: method,
        };

        const methodPoints = sortedPoints
          .filter((d) => d.method === method)
          .map((d) => ({
            x: toEpochMs(d.date),
            y: d.score,
          }));

        return {
          label: cfg.label,
          data: methodPoints,
          borderColor: cfg.color,
          backgroundColor: cfg.color + "18",
          borderWidth: 1.5,
          borderDash: cfg.dash,
          pointRadius,
          pointHoverRadius: 4,
          pointBackgroundColor: cfg.color,
          pointBorderWidth: 0,
          tension: 0.25,
          spanGaps: false,
          fill: false,
        };
      });

      chartRef.current = new Chart(canvasRef.current!, {
        type: "line",
        data: {
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          parsing: true,
          interaction: {
            mode: "nearest",
            intersect: false,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => {
                  if (!items.length) return "";
                  return formatFullDate(items[0].parsed.x as number);
                },
                label: (ctx) =>
                  ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(1)}`,
              },
            },
          },
          scales: {
            x: {
              type: "linear",
              min: hasSinglePoint ? xMin - singlePointPaddingMs : undefined,
              max: hasSinglePoint ? xMax + singlePointPaddingMs : undefined,
              grid: { color: "rgba(128,128,128,0.08)" },
              ticks: {
                font: { family: "monospace", size: 10 },
                color: "#888",
                autoSkip: true,
                maxTicksLimit: METHOD_TICK_LIMIT[range],
                callback: (value) => formatTick(Number(value), range),
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
  }, [range, scoreOverTime]);

  if (!scoreOverTime?.length) return null;

  const presentMethods = [
    ...METHOD_ORDER.filter((m) => scoreOverTime.some((d) => d.method === m)),
    ...[...new Set(scoreOverTime.map((d) => d.method))].filter(
      (m) => !METHOD_ORDER.includes(m),
    ),
  ];

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
            ...FALLBACK_METHOD_STYLE,
            label: m,
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
