"use client";

import { useMemo, useState } from "react";
import { Button } from "./Button";
import { Modal } from "@/components/ui/Modal";

type ConfirmType = "simple" | "strict" | "input";

type Props = {
  message: string;
  confirmType: ConfirmType;
  onConfirm: (value?: string) => void | Promise<void>;
  onClose: () => void;
  confirmText?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  title?: string;
  ariaLabel?: string;
  // "input" mode props
  inputLabel?: string;
  inputType?: string;
  inputPlaceholder?: string;
};

export function ConfirmModal({
  message,
  confirmType,
  onConfirm,
  onClose,
  confirmText,
  confirmButtonLabel = "Delete",
  cancelButtonLabel = "Cancel",
  title = "Confirm action",
  ariaLabel = "Confirmation dialog",
  inputLabel,
  inputType = "text",
  inputPlaceholder,
}: Props) {
  const [typedText, setTypedText] = useState("");

  const requiredText = useMemo(
    () => (confirmType === "strict" ? (confirmText ?? "") : ""),
    [confirmText, confirmType],
  );

  const isStrictConfirmed =
    confirmType === "strict" ? typedText.trim() === requiredText : true;

  const isInputConfirmed =
    confirmType === "input" ? typedText.trim().length > 0 : true;

  const canConfirm = isStrictConfirmed && isInputConfirmed;

  const handleConfirm = () => {
    if (confirmType === "input" || confirmType === "strict") {
      onConfirm(typedText);
    } else {
      onConfirm();
    }
  };

  return (
    <Modal onClose={onClose} aria-label={ariaLabel}>
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            {title}
          </p>
          <p className="font-mono text-sm leading-relaxed text-foreground-muted">
            {message}
          </p>
        </div>

        {confirmType === "strict" && (
          <div className="space-y-2">
            <label
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted"
              htmlFor="confirm-text"
            >
              Type {requiredText || "the confirmation text"} to continue
            </label>
            <input
              id="confirm-text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requiredText || "Type here"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {confirmType === "input" && (
          <div className="space-y-2">
            {inputLabel && (
              <label
                className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted"
                htmlFor="confirm-input"
              >
                {inputLabel}
              </label>
            )}
            <input
              id="confirm-input"
              type={inputType}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={inputPlaceholder ?? ""}
              autoComplete={
                inputType === "password" ? "current-password" : undefined
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-mono text-xs"
          >
            {cancelButtonLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="font-mono text-xs"
          >
            {confirmButtonLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
