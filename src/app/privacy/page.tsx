import Link from "next/link";
import { PRIVACY_POLICY_SECTIONS } from "@/lib/privacy-policy-content";

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

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-12 py-8">
      <div className="flex flex-col gap-4 border-b border-border pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Legal
          </p>
        </div>
        <h1 className="font-mono text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          Privacy Policy
        </h1>
        <p className="font-mono text-xs text-foreground-muted">
          Last updated: May 2026 · Applies to glint.app and all Glint services.
        </p>
        <p className="font-mono text-sm leading-relaxed text-foreground-muted max-w-prose mt-2">
          Glint is a resume intelligence tool. We take your privacy seriously —
          especially because you&apos;re sharing personal documents with us.
          This policy explains what data we collect, how we use it, and what
          control you have over it.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-4">
            <h2 className="font-mono text-sm font-semibold text-foreground tracking-wide">
              {section.title}
            </h2>
            <ul className="flex flex-col gap-3">
              {section.content.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <p className="font-mono text-xs leading-relaxed text-foreground-muted">
                    {renderContent(item)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-border pt-8 flex flex-wrap items-center gap-6">
        <Link
          href="/"
          className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
        <Link
          href="/contact"
          className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          Contact us
        </Link>
        <Link
          href="/analysis"
          className="ml-auto font-mono text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Run analysis →
        </Link>
      </div>
    </div>
  );
}
