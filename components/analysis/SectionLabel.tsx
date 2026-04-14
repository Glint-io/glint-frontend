interface Props {
  children: React.ReactNode;
}

export const SectionLabel = ({ children }: Props) => (
  <div className="flex items-center gap-3">
    <span className="font-mono text-[10px] tracking-[0.2em] text-foreground-muted uppercase whitespace-nowrap">
      {children}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);
