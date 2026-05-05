"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onClose: () => void;
  children: React.ReactNode;
  "aria-label"?: string;
  panelClassName?: string;
};

export function Modal({ onClose, children, "aria-label": ariaLabel, panelClassName }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-120 flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-xl",
          panelClassName,
        )}
      >
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute right-3 top-3 h-auto p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
        {children}
      </div>
    </div>
  );
}
