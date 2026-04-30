type Props = {
  children: React.ReactNode;
};

export function SectionLabel({ children }: Props) {
  return (
    <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted mb-4">
      {children}
    </p>
  );
}
