"use client";
import { useEffect, useRef } from "react";
import type { HistoryRange, Statistics } from "@/types";

type ScorePoint = {
  date: string;
  score: number;
  method: string;
  feedback?: string;
};

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
  Today: 8,
  Last7Days: 8,
  Last30Days: 10,
  Last365Days: 12,
  All: 12,
};

const toEpochMs = (iso: string) => new Date(iso).getTime();

const allSameDay = (timestamps: number[]) => {
  if (timestamps.length < 2) return true;
  const d0 = new Date(timestamps[0]);
  return timestamps.every((t) => {
    const d = new Date(t);
    return (
      d.getFullYear() === d0.getFullYear() &&
      d.getMonth() === d0.getMonth() &&
      d.getDate() === d0.getDate()
    );
  });
};

const formatTick = (value: number, range: HistoryRange, forceTime: boolean) => {
  const opts: Intl.DateTimeFormatOptions = forceTime
    ? { hour: "2-digit", minute: "2-digit" }
    : TICK_FORMATTERS[range];
  return new Date(value).toLocaleString(undefined, opts);
};

const formatFullDate = (value: number) =>
  new Date(value).toLocaleString(undefined, FULL_DATE_FORMATTER);

const isErrorResult = (
  score: number,
  feedback: string | undefined,
): boolean => {
  if (score !== 0) return false;
  if (!feedback) return false;
  const lower = feedback.toLowerCase();
  return (
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("rule evaluation failed") ||
    lower.includes("please try again")
  );
};

export function ScoreOverTimeChart({ scoreOverTime, range }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const points = (scoreOverTime ?? []) as ScorePoint[];

  useEffect(() => {
    if (!canvasRef.current || !points.length) return;

    import("chart.js/auto").then((mod) => {
      const Chart = mod.default;

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const validPoints = points.filter(
        (d) =>
          Number.isFinite(toEpochMs(d.date)) &&
          !isErrorResult(d.score, d.feedback),
      );

      const sortedPoints = [...validPoints].sort(
        (a, b) => toEpochMs(a.date) - toEpochMs(b.date),
      );

      if (!sortedPoints.length) return;

      const allTs = sortedPoints.map((d) => toEpochMs(d.date));
      const forceTime = allSameDay(allTs);

      const knownMethods = METHOD_ORDER.filter((m) =>
        sortedPoints.some((d) => d.method === m),
      );
      const otherMethods = [
        ...new Set(sortedPoints.map((d) => d.method)),
      ].filter((m) => !METHOD_ORDER.includes(m));
      const methodOrder = [...knownMethods, ...otherMethods];

      const xMin = allTs[0];
      const xMax = allTs[allTs.length - 1];
      const hasSinglePoint = xMin === xMax;
      const singlePointPaddingMs = 1000 * 60 * 30;

      const pointRadius =
        sortedPoints.length > 120 ? 1.5 : sortedPoints.length > 60 ? 2 : 3.5;

      const datasets = methodOrder.map((method) => {
        const cfg = METHOD_CONFIG[method] ?? {
          ...FALLBACK_METHOD_STYLE,
          label: method,
        };

        const methodPoints = sortedPoints
          .filter((d) => d.method === method)
          .map((d) => ({ x: toEpochMs(d.date), y: d.score }));

        const tension = methodPoints.length <= 5 ? 0 : 0.2;

        return {
          label: cfg.label,
          data: methodPoints,
          borderColor: cfg.color,
          backgroundColor: cfg.color + "12",
          borderWidth: 1.5,
          borderDash: cfg.dash,
          pointRadius,
          pointHoverRadius: 5,
          pointBackgroundColor: cfg.color,
          pointBorderColor: cfg.color + "40",
          pointBorderWidth: 2,
          tension,
          spanGaps: false,
          fill: false,
        };
      });

      chartRef.current = new Chart(canvasRef.current!, {
        type: "line",
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "nearest",
            intersect: false,
            axis: "x",
          },
          animation: { duration: 300 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(20,20,20,0.92)",
              borderColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              titleColor: "#aaa",
              bodyColor: "#eee",
              padding: 10,
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
              border: { display: false },
              grid: {
                color: "rgba(128,128,128,0.07)",
                drawTicks: false,
              },
              ticks: {
                font: { family: "monospace", size: 10 },
                color: "#666",
                autoSkip: true,
                maxTicksLimit: METHOD_TICK_LIMIT[range],
                padding: 8,
                callback: (value) =>
                  formatTick(Number(value), range, forceTime),
              },
            },
            y: {
              min: 0,
              max: 100,
              border: { display: false },
              grid: { color: "rgba(128,128,128,0.07)", drawTicks: false },
              ticks: {
                font: { family: "monospace", size: 10 },
                color: "#666",
                stepSize: 25,
                padding: 8,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, scoreOverTime]);

  if (!points.length) return null;

  const presentMethods = [
    ...METHOD_ORDER.filter((m) =>
      points.some((d) => d.method === m && !isErrorResult(d.score, d.feedback)),
    ),
    ...[...new Set(points.map((d) => d.method))].filter(
      (m) =>
        !METHOD_ORDER.includes(m) &&
        points.some(
          (d) => d.method === m && !isErrorResult(d.score, d.feedback),
        ),
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

      <div className="flex flex-wrap items-center gap-4 mt-4">
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

        {points.some((d) => isErrorResult(d.score, d.feedback)) && (
          <span className="ml-auto font-mono text-[9px] text-foreground-muted opacity-50">
            Some results omitted due to errors
          </span>
        )}
      </div>
    </div>
  );
}
