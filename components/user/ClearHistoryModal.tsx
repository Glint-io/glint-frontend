"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import {
  GlintSelect,
  type GlintSelectOption,
} from "@/components/ui/GlintSelect";
import type { HistoryRange } from "@/types";

const OPTIONS: GlintSelectOption<HistoryRange>[] = [
  { value: "All", label: "All time" },
  { value: "Today", label: "Today" },
  { value: "Last7Days", label: "Last 7 days" },
  { value: "Last30Days", label: "Last 30 days" },
  { value: "Last365Days", label: "Last year" },
];

type Props = {
  currentRange: HistoryRange;
  onClose: () => void;
  onConfirm: (range: HistoryRange) => void | Promise<void>;
  loading?: boolean;
};

export function ClearHistoryModal({
  currentRange,
  onClose,
  onConfirm,
  loading,
}: Props) {
  const [selected, setSelected] = useState<HistoryRange>(currentRange);

  return (
    <Modal onClose={onClose} aria-label="Clear analysis history dialog">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Clear analysis history
          </p>
          <p className="font-mono text-sm leading-relaxed text-foreground-muted">
            Choose how much of your analysis history to delete. This action
            cannot be undone.
          </p>
        </div>

        <GlintSelect
          label="Select range to clear"
          hint="Only analyses from the selected period will be removed."
          options={OPTIONS}
          value={selected}
          onChange={setSelected}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(selected)}
            disabled={loading}
            className="font-mono text-xs"
          >
            {loading ? "Clearing…" : "Clear history"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ClearHistoryModal;
