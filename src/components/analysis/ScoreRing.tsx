import { useState, useEffect, useRef } from "react";

interface ScoreRingProps {
  target: number;
  active: boolean;
  compact?: boolean;
}

export const ScoreRing = ({ target, active, compact = false }: ScoreRingProps) => {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(0);
      return;
    }
    const t0 = performance.now();
    const dur = 1100;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setValue(Math.round(ease(p) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, active]);

  const R = 46;
  const circ = 2 * Math.PI * R;
  const offset = circ - (value / 100) * circ;
  const accent =
    value >= 80
      ? "rgb(34,197,94)"
      : value >= 60
        ? "rgb(234,179,8)"
        : "rgb(239,68,68)";

  const size = compact ? 100 : 120;
  const centerOffset = compact ? 50 : 60;
  const strokeWidth = compact ? 6 : 8;

  return (
    <div className={compact ? "relative shrink-0 w-[100px] h-[100px]" : "relative shrink-0 w-[120px] h-[120px]"}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={centerOffset}
          cy={centerOffset}
          r={R}
          fill="none"
          className="stroke-border"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={centerOffset}
          cy={centerOffset}
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={active ? offset : circ}
          strokeLinecap="round"
          className="transition-[stroke] duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={compact ? "font-mono text-2xl font-bold leading-none" : "font-mono text-3xl font-bold leading-none"}
          style={{ color: accent }}
        >
          {value}
        </span>
        <span className={compact ? "font-mono text-[8px] tracking-widest text-foreground-muted mt-0.5 uppercase" : "font-mono text-[9px] tracking-widest text-foreground-muted mt-0.5 uppercase"}>
          Match
        </span>
      </div>
    </div>
  );
};
