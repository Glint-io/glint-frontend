"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import type { JobAdvertisement } from "@/types";

type Props = {
  jobAd: JobAdvertisement | null;
  onClose: () => void;
  onUse?: (jobAd: JobAdvertisement) => void;
  useLabel?: string;
};

export function JobAdvertisementPreviewModal({
  jobAd,
  onClose,
  onUse,
  useLabel = "Use this ad",
}: Props) {
  if (!jobAd) return null;

  return (
    <Modal
      onClose={onClose}
      aria-label="Job advertisement preview"
      panelClassName="max-w-4xl max-h-[85vh] overflow-hidden p-0"
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border px-6 py-5 pr-14">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Job advertisement
          </p>
          <h2 className="mt-2 truncate font-mono text-lg font-semibold text-foreground leading-snug">
            {jobAd.title ?? "Untitled job advertisement"}
          </h2>
          <p className="mt-2 font-mono text-xs text-foreground-muted">
            {new Date(jobAd.createdAt).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-border bg-background-subtle/60 p-5">
            <p className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-foreground">
              {jobAd.rawText}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-mono text-xs"
          >
            Close
          </Button>
          {onUse && (
            <Button onClick={() => onUse(jobAd)} className="font-mono text-xs">
              {useLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
