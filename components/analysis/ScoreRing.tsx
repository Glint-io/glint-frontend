import { useState, useEffect, useRef } from "react";

interface ScoreRingProps {
  target: number;
  active: boolean;
}

export const ScoreRing = ({ target, active }: ScoreRingProps) => {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
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
    value >= 75
      ? "var(--color-primary)"
      : value >= 50
        ? "#eab308"
        : "var(--color-destructive)";

  return (
    <div className="relative shrink-0 w-[120px] h-[120px]">
      <svg width="120" height="120" className="-rotate-90">
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          className="stroke-border"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={active ? offset : circ}
          strokeLinecap="round"
          className="transition-[stroke] duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-3xl font-bold leading-none"
          style={{ color: accent }}
        >
          {value}
        </span>
        <span className="font-mono text-[9px] tracking-widest text-foreground-muted mt-0.5 uppercase">
          Match
        </span>
      </div>
    </div>
  );
};
