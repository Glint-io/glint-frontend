"use client";

export function CapacityDots({
  used,
  max,
  atCapacityLabel,
}: {
  used: number;
  max: number;
  atCapacityLabel?: string;
}) {
  const atCapacity = used >= max;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.75 leading-none">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`inline-block h-1.25 w-1.25 shrink-0 rounded-full transition-colors ${
              i < used ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </span>
      <span
        className={`font-mono text-[9px] leading-none tracking-wide ${
          atCapacity ? "text-primary" : "text-foreground-muted"
        }`}
      >
        {atCapacity
          ? (atCapacityLabel ?? `${used} / ${max} · limit reached`)
          : `${used} / ${max}`}
      </span>
    </span>
  );
}