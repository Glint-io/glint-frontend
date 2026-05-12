"use client";

import { Modal } from "@/components/ui/Modal";
import { TERMS_OF_SERVICE_SECTIONS } from "@/lib/terms-of-service-content";

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({
  isOpen,
  onClose,
}: TermsOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} aria-label="Terms of Service">
      <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            Terms of Service
          </h2>
          <p className="font-mono text-xs text-foreground-muted">
            Last updated: May 2026
          </p>
          <p className="font-mono text-sm leading-relaxed text-foreground-muted">
            Welcome to Glint. These terms of service govern your use of our
            resume analysis platform. By creating an account and using Glint,
            you agree to these terms in their entirety.
          </p>
        </div>

        {TERMS_OF_SERVICE_SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h3 className="font-mono text-xs font-semibold text-foreground">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {section.content.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <p className="font-mono text-xs leading-relaxed text-foreground-muted">
                    {renderContent(item)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}
