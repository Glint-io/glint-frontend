type Props = {
  icon: string;
  message: string;
};

export function EmptyState({ icon, message }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-foreground-muted">
      <span className="text-4xl">{icon}</span>
      <p className="font-mono text-xs">{message}</p>
    </div>
  );
}
