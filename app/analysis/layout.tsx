import type { ReactNode } from "react";

export default function AnalysisLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-0 overflow-hidden h-[calc(100dvh-3.125rem-4rem)] md:h-[calc(100dvh-4.75rem-4rem)]">
            {children}
        </div>
    );
}
