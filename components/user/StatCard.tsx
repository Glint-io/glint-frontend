type Props = {
  label: string;
  value: string | number;
  sub?: string;
};

export function StatCard({ label, value, sub }: Props) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 flex flex-col gap-1">
      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
        {label}
      </p>
      <p className="font-mono text-4xl font-bold text-primary leading-none mt-2">
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[10px] text-foreground-muted">{sub}</p>
      )}
    </div>
  );
}
