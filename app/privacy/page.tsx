import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      "**Account data.** When you register, we collect your email address and a hashed version of your password. We never store your password in plain text.",
      "**Resume files.** PDFs you upload are stored encrypted at rest and are only used to perform the analysis you request. You can delete them at any time from your dashboard.",
      "**Job advertisement text.** Text you paste into the job description field is stored per analysis so you can review past results. Up to 5 ads are saved per account; older ones are replaced automatically.",
      "**Usage data.** We log analysis requests (timestamps, scores, method used) so you can track your progress over time. We do not sell or share this data with third parties.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide, operate, and improve the Glint service.",
      "To send transactional emails (email verification, password reset). We do not send marketing emails unless you explicitly opt in.",
      "To detect and prevent abuse, fraud, and security threats.",
      "To calculate aggregate, anonymised statistics about service performance. No individual user is identifiable in these statistics.",
    ],
  },
  {
    title: "3. Data Retention",
    content: [
      "**Active accounts.** Resume files and analysis history are retained for as long as your account exists.",
      "**Deleted data.** When you delete a resume or analysis, it is removed from our database immediately and cannot be recovered.",
      "**Account deletion.** If you close your account, all personal data — email, resumes, job ads, analysis history — is permanently deleted within 30 days.",
      "**Verification codes.** One-time codes expire after 15 minutes and are marked as used immediately after verification.",
    ],
  },
  {
    title: "4. Data Sharing",
    content: [
      "We do not sell your personal data.",
      "**AI providers.** Resume text and job ad text are sent to Google Gemini's API solely to generate analysis results. Google's data processing terms apply to this transfer. Text is not used to train Gemini models under our API agreement.",
      "**Infrastructure.** We use standard cloud hosting and database providers. All data is stored within the EU/EEA.",
      "**Legal requirements.** We may disclose data if required by law, court order, or to protect the rights and safety of our users.",
    ],
  },
  {
    title: "5. Security",
    content: [
      "All data is transmitted over HTTPS/TLS.",
      "Passwords are hashed with bcrypt before storage.",
      "Resume files are stored encrypted at rest.",
      "Access tokens expire after a short window; refresh tokens are rotated on each use and can be revoked.",
      "We conduct periodic security reviews, but no system is 100% secure. If you discover a vulnerability, please contact us at the address below.",
    ],
  },
  {
    title: "6. Your Rights",
    content: [
      "**Access.** You can view all data we hold about you by logging in to your dashboard.",
      "**Deletion.** You can delete individual resumes, job ads, or your entire account from the dashboard at any time.",
      "**Portability.** Contact us to request a machine-readable export of your data.",
      "**Correction.** If any data we hold is inaccurate, contact us and we will correct it promptly.",
      "If you are in the EU/EEA, you also have the right to lodge a complaint with your local data protection authority.",
    ],
  },
  {
    title: "7. Cookies",
    content: [
      "Glint does not use tracking or advertising cookies.",
      "We use a single, strictly necessary session mechanism — an access token stored in localStorage — to keep you logged in. This is not a cookie and is not accessible to third parties.",
    ],
  },
  {
    title: "8. Children",
    content: [
      "Glint is not directed at children under 16. We do not knowingly collect data from anyone under 16. If you believe a child has created an account, please contact us and we will delete the account promptly.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      "We may update this policy from time to time. When we make material changes, we will notify you by email (if you have an account) and update the 'Last updated' date at the top of this page. Continued use of Glint after changes take effect constitutes acceptance of the revised policy.",
    ],
  },
  {
    title: "10. Contact",
    content: [
      "Questions or requests regarding this privacy policy can be sent via our contact form or by email to the address listed there. We aim to respond within 5 business days.",
    ],
  },
];

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
      {/* Header */}
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

      {/* Sections */}
      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
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

      {/* Footer nav */}
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
