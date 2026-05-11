import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
};

export function StatCard({ label, value, sub, icon: Icon }: Props) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
          {label}
        </p>
        {Icon ? (
          <Icon
            className="h-4 w-4 shrink-0 text-foreground-muted"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <p className="font-mono text-4xl font-bold text-primary leading-none mt-2">
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[10px] text-foreground-muted">{sub}</p>
      )}
    </div>
  );
}
