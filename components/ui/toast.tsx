"use client";

import {
  ToastContainer,
  toast as _toast,
  type ToastContentProps,
  type ToastOptions,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Variant config ──────────────────────────────────────────────────────────

type Variant = "success" | "error" | "warning" | "info";

const VARIANT = {
  success: {
    icon: CheckCircle,
    label: "Success",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    iconFill: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    label: "Error",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    iconFill: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    color: "text-amber-500",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    iconFill: "text-amber-500",
  },
  info: {
    icon: Info,
    label: "Notice",
    color: "text-foreground-muted",
    bg: "bg-background-subtle",
    border: "border-border",
    iconFill: "text-foreground-muted",
  },
} as const;

// ── Toast content ───────────────────────────────────────────────────────────

interface GlintToastProps extends ToastContentProps {
  title?: string;
  message: string;
  variant: Variant;
}

function GlintToastContent({
  closeToast,
  title,
  message,
  variant,
}: GlintToastProps) {
  const cfg = VARIANT[variant];
  const Icon = cfg.icon;

  return (
    <div
      className={`flex items-start gap-3 w-full p-4 ${cfg.bg} ${cfg.border} border rounded-xl`}
    >
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${cfg.iconFill}`}>
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-mono text-[9px] font-semibold tracking-[0.2em] uppercase mb-1 ${cfg.color}`}
        >
          {title ?? cfg.label}
        </p>
        <p className="font-mono text-xs leading-relaxed text-foreground">
          {message}
        </p>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={closeToast}
        aria-label="Dismiss"
        className="shrink-0 mt-0.5 text-foreground-muted hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Styled container ────────────────────────────────────────────────────────

/**
 * Drop this once anywhere in your layout — it replaces the default
 * ToastContainer and injects the CSS overrides.
 */
export function GlintToastProvider() {
  return (
    <>
      {/*
        Override react-toastify's CSS variables and strip its default chrome.
        The actual styling lives on GlintToastContent above, which uses
        Tailwind + Glint CSS variables so dark mode is automatic.
      */}
      <style>{`
        :root {
          --toastify-z-index: 9999;
          --toastify-toast-width: 360px;
          --toastify-toast-offset: 16px;
          --toastify-toast-top: max(var(--toastify-toast-offset), env(safe-area-inset-top));
          --toastify-toast-right: max(var(--toastify-toast-offset), env(safe-area-inset-right));
          --toastify-toast-bottom: max(var(--toastify-toast-offset), env(safe-area-inset-bottom));
        }

        /* Strip the wrapper's default background, padding, border-radius, shadow */
        .Toastify__toast {
          background: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          min-height: 0 !important;
          margin-bottom: 8px !important;
        }

        /* Hide the default progress bar */
        .Toastify__progress-bar {
          display: none !important;
        }

        /* Hide the default close button (we render our own) */
        .Toastify__close-button {
          display: none !important;
        }

        /* Container positioning */
        .Toastify__toast-container {
          padding: 0 !important;
        }

        /* Slide-in from right */
        .Toastify__slide-enter--top-right,
        .Toastify__slide-enter--bottom-right {
          animation: glint-slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .Toastify__slide-exit--top-right,
        .Toastify__slide-exit--bottom-right {
          animation: glint-slide-out 0.18s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        @keyframes glint-slide-in {
          from { opacity: 0; transform: translateX(16px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes glint-slide-out {
          from { opacity: 1; transform: translateX(0)   scale(1); }
          to   { opacity: 0; transform: translateX(16px) scale(0.96); }
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={4500}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        closeButton={false}
        draggable={false}
        pauseOnHover
        pauseOnFocusLoss
        icon={false}
      />
    </>
  );
}

// ── Public API ──────────────────────────────────────────────────────────────

interface ToastInput {
  message: string;
  title?: string;
  options?: ToastOptions;
}

function show(variant: Variant, { message, title, options }: ToastInput) {
  return _toast(
    (props: ToastContentProps) => (
      <GlintToastContent
        {...props}
        message={message}
        title={title}
        variant={variant}
      />
    ),
    {
      // Remove react-toastify's default icon
      icon: false,
      closeButton: false,
      ...options,
    },
  );
}

/**
 * glintToast — drop-in toast helpers styled to match Glint's design system.
 *
 * Usage:
 *   glintToast.success({ message: "Resume uploaded." });
 *   glintToast.error({ message: "Upload failed.", title: "Oops" });
 *   glintToast.warning({ message: "3 resumes max." });
 *   glintToast.info({ message: "Saving your ad..." });
 */
export const glintToast = {
  success: (input: ToastInput) => show("success", input),
  error: (input: ToastInput) => show("error", input),
  warning: (input: ToastInput) => show("warning", input),
  info: (input: ToastInput) => show("info", input),
} as const;

// Also export a direct re-export of the underlying toast for advanced use
export { _toast as rawToast };
