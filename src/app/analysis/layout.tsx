import type { ReactNode } from "react";

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:min-h-0 md:overflow-hidden md:h-[calc(100dvh-4.75rem-4rem)]">
      {children}
    </div>
  );
}
