"use client";

import {
  ToastContainer,
  toast as _toast,
  type ToastContentProps,
  type ToastOptions,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Config ──────────────────────────────────────────────────────────────────

const AUTO_CLOSE_MS = 7000;

type Variant = "success" | "error" | "warning" | "info";

// All colors use CSS variables so dark mode is automatic
const VARIANT: Record<
  Variant,
  {
    icon: typeof CheckCircle;
    label: string;
    style: React.CSSProperties;
    labelStyle: React.CSSProperties;
    iconStyle: React.CSSProperties;
    progressStyle: React.CSSProperties;
  }
> = {
  success: {
    icon: CheckCircle,
    label: "Success",
    style: {
      background: "color-mix(in srgb, #22c55e 12%, var(--background))",
      border: "1px solid color-mix(in srgb, #22c55e 30%, transparent)",
    },
    labelStyle: { color: "#16a34a" },
    iconStyle: { color: "#22c55e" },
    progressStyle: { background: "#22c55e" },
  },
  error: {
    icon: XCircle,
    label: "Error",
    style: {
      background: "color-mix(in srgb, #ef4444 12%, var(--background))",
      border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)",
    },
    labelStyle: { color: "#dc2626" },
    iconStyle: { color: "#ef4444" },
    progressStyle: { background: "#ef4444" },
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    style: {
      background: "color-mix(in srgb, var(--primary) 12%, var(--background))",
      border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
    },
    labelStyle: { color: "var(--primary)" },
    iconStyle: { color: "var(--primary)" },
    progressStyle: { background: "var(--primary)" },
  },
  info: {
    icon: Info,
    label: "Notice",
    style: {
      background: "var(--background-subtle)",
      border: "1px solid var(--border)",
    },
    labelStyle: { color: "var(--foreground-muted)" },
    iconStyle: { color: "var(--foreground-muted)" },
    progressStyle: { background: "var(--foreground-muted)" },
  },
};

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
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px 18px",
        borderRadius: "10px",
        overflow: "hidden",
        ...cfg.style,
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: "1px", ...cfg.iconStyle }}>
        <Icon size={15} strokeWidth={2} aria-hidden="true" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "3px",
            ...cfg.labelStyle,
          }}
        >
          {title ?? cfg.label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            lineHeight: 1.5,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={closeToast}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          marginTop: "1px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "var(--foreground-muted)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={13} strokeWidth={2} />
      </button>

      {/* Progress bar */}
      <div
        className="glint-progress-bar"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          borderRadius: "0 0 0 10px",
          ...cfg.progressStyle,
        }}
      />
    </div>
  );
}

// ── Provider ────────────────────────────────────────────────────────────────

export function GlintToastProvider() {
  return (
    <>
      <style>{`
        :root {
          --toastify-z-index: 9999;
          --toastify-toast-width: 360px;
          --toastify-toast-offset: 16px;
          --toastify-toast-top: max(var(--toastify-toast-offset), env(safe-area-inset-top));
          --toastify-toast-right: max(var(--toastify-toast-offset), env(safe-area-inset-right));
        }

        /* Strip toastify's default chrome entirely */
        .Toastify__toast {
          background: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          min-height: 0 !important;
          margin-bottom: 8px !important;
        }
        .Toastify__toast-body {
          padding: 0 !important;
          margin: 0 !important;
        }
        .Toastify__progress-bar { display: none !important; }
        .Toastify__close-button { display: none !important; }
        .Toastify__toast-container { padding: 0 !important; }

        /* Progress bar animation */
        @keyframes glint-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }

        .glint-progress-bar {
          animation: glint-progress ${AUTO_CLOSE_MS}ms linear forwards;
        }

        /* Pause the bar when toastify pauses on hover/focus */
        .Toastify__toast:is([class*="--paused"]) .glint-progress-bar,
        .Toastify__toast:hover .glint-progress-bar {
          animation-play-state: paused;
        }

        /* Slide-in / out */
        .Toastify__slide-enter--top-right {
          animation: glint-slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .Toastify__slide-exit--top-right {
          animation: glint-slide-out 0.18s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes glint-slide-in {
          from { opacity: 0; transform: translateX(16px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes glint-slide-out {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(16px) scale(0.96); }
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={AUTO_CLOSE_MS}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        closeButton={false}
        draggable={false}
        pauseOnHover
        pauseOnFocusLoss={false}
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
  const toastId = _toast(
    (props: ToastContentProps) => (
      <GlintToastContent
        {...props}
        message={message}
        title={title}
        variant={variant}
      />
    ),
    {
      icon: false,
      closeButton: false,
      ...options,
      autoClose: AUTO_CLOSE_MS,
    },
  );

  window.setTimeout(() => {
    _toast.dismiss(toastId);
  }, AUTO_CLOSE_MS);

  return toastId;
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

export { _toast as rawToast };
