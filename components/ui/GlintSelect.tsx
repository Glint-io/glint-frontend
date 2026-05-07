"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type GlintSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type Props<T extends string = string> = {
  options: GlintSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  hint?: string;
  id?: string;
  disabled?: boolean;
};

export function GlintSelect<T extends string = string>({
  options,
  value,
  onChange,
  label,
  hint,
  id,
  disabled = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        const idx = options.findIndex((o) => o.value === value);
        const next = options[idx + 1];
        if (next) onChange(next.value);
      }
      if (e.key === "ArrowUp") {
        const idx = options.findIndex((o) => o.value === value);
        const prev = options[idx - 1];
        if (prev) onChange(prev.value);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, value, options, onChange]);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? options[0]?.label;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted"
        >
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-background-subtle px-3 py-2.5 font-mono text-sm text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary/60 hover:bg-background-subtle cursor-pointer"
            }`}
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-foreground-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && !disabled && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 font-mono text-sm cursor-pointer transition-colors duration-100
                  ${
                    value === opt.value
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                  }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && (
        <p className="font-mono text-xs text-foreground-muted">{hint}</p>
      )}
    </div>
  );
}
