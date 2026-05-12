import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ServiceDownBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex w-full flex-1 items-center justify-center py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-background p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-border/50">
          <WifiOff className="h-6 w-6 text-foreground-muted" />
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Service unavailable
          </p>
          <h2 className="mt-2 font-mono text-base font-semibold text-foreground">
            Can&apos;t reach the server
          </h2>
          <p className="mt-1.5 font-mono text-xs text-foreground-muted">
            The API is currently unreachable. Check your connection or try again
            in a moment.
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={onRetry}
          >
            <RefreshCw className="mr-1.5 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
