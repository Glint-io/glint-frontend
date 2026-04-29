import Link from "next/link";
import AuthCTA from "@/components/AuthCTA";

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col">

      {/*  Hero  */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-background-subtle">

        {/* dot-grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* amber top-edge accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 h-px"
          style={{ background: "var(--primary)" }}
        />

        <div className="relative grid gap-0 lg:grid-cols-[1fr_auto]">
          {/* Left: text */}
          <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
            <div>
              <p className="mb-6 font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase">
                Glint · CV Intelligence
              </p>
              <h1
                className="max-w-lg font-mono text-3xl font-semibold leading-snug tracking-tight md:text-4xl lg:text-5xl"
                style={{ color: "var(--foreground)" }}
              >
                Know exactly how well your CV{" "}
                <span style={{ color: "var(--primary)" }}>fits the role</span>
                {" "}before you apply.
              </h1>
              <p className="mt-6 max-w-md font-mono text-sm leading-7 text-foreground-muted">
                Upload your CV, paste a job ad, and get a precision match score
                in seconds. Three analysis engines. One clear answer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/analysis"
                className="inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium transition-opacity hover:opacity-85"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                }}
              >
                Run your first analysis →
              </Link>
              <AuthCTA />
            </div>
          </div>

          {/* Right: oversized score display */}
          <div
            className="hidden lg:flex flex-col items-center justify-center gap-3 border-l border-border px-12 py-10"
            style={{ background: "color-mix(in srgb, var(--primary) 6%, transparent)" }}
          >
            <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase">
              Sample score
            </p>
            <div className="relative flex items-center justify-center">
              <svg width="160" height="160" className="-rotate-90" aria-hidden>
                <circle cx="80" cy="80" r="68" fill="none" stroke="var(--border)" strokeWidth="6" />
                <circle
                  cx="80" cy="80" r="68" fill="none"
                  stroke="var(--primary)" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 68}`}
                  strokeDashoffset={`${2 * Math.PI * 68 * (1 - 0.87)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-5xl font-bold" style={{ color: "var(--primary)" }}>87</span>
                <span className="font-mono text-[9px] tracking-widest text-foreground-muted uppercase mt-1">match</span>
              </div>
            </div>
            <p className="max-w-[130px] text-center font-mono text-[11px] leading-snug text-foreground-muted">
              Senior Frontend Engineer · Acme Corp
            </p>
          </div>
        </div>
      </section>

      {/*  How it works  */}
      <section className="mt-16">
        <div className="mb-8 flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase whitespace-nowrap">
            How it works
          </span>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="grid gap-px border border-border rounded-xl overflow-hidden bg-border sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Upload your CV",
              body: "Drop a PDF resume. We parse it locally — your data stays yours.",
              icon: "⬆",
            },
            {
              n: "02",
              title: "Paste the job ad",
              body: "Add the full job description and a title so you can track it later.",
              icon: "⌖",
            },
            {
              n: "03",
              title: "Get your score",
              body: "Three engines — AI semantic, keyword overlap, rule-based — give you the full picture.",
              icon: "✦",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-4 bg-background-subtle p-7"
            >
              <div className="flex items-start justify-between">
                <span
                  className="font-mono text-5xl font-bold leading-none"
                  style={{ color: "var(--primary)", opacity: 0.25 }}
                >
                  {step.n}
                </span>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div>
                <h3 className="font-mono text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-foreground-muted">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  Feature spotlight  */}
      <section className="mt-16 grid gap-4 lg:grid-cols-5">
        {/* Main feature */}
        <div
          className="relative overflow-hidden rounded-xl border border-border lg:col-span-3 p-8"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--background-subtle)), var(--background-subtle))",
          }}
        >
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase">
            Three analysis methods
          </p>
          <h2 className="mt-3 font-mono text-2xl font-semibold leading-snug text-foreground">
            AI doesn&apos;t replace precision —{" "}
            <span style={{ color: "var(--primary)" }}>it adds to it.</span>
          </h2>
          <p className="mt-3 font-mono text-xs leading-relaxed text-foreground-muted max-w-sm">
            Semantic AI finds conceptual overlap. Keyword match checks literal
            coverage. Rule-based criteria flag industry requirements. Together
            they leave no blind spots.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {[
              { label: "AI Semantic", pct: 87 },
              { label: "Keyword Match", pct: 73 },
              { label: "Rule-Based", pct: 91 },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-28 font-mono text-[10px] text-foreground-muted shrink-0">
                  {m.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${m.pct}%`, background: "var(--primary)" }}
                  />
                </div>
                <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--primary)" }}>
                  {m.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side features */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex-1 rounded-xl border border-border bg-background-subtle p-6">
            <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase">
              Score history
            </p>
            <h3 className="mt-2 font-mono text-lg font-semibold text-foreground">
              Track your progress over time.
            </h3>
            <p className="mt-2 font-mono text-xs leading-relaxed text-foreground-muted">
              Every analysis is saved to your dashboard. Watch your scores climb
              as you refine your CV for a specific role.
            </p>
            {/* sparkline mock */}
            <div className="mt-4 flex items-end gap-1 h-10">
              {[40, 55, 52, 68, 72, 79, 87].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 6 ? "var(--primary)" : "var(--border)",
                    opacity: i === 6 ? 1 : 0.7 + i * 0.04,
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border border-border p-6"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.25em] uppercase"
              style={{ color: "color-mix(in srgb, var(--background) 55%, transparent)" }}
            >
              Ready?
            </p>
            <h3 className="mt-2 font-mono text-lg font-semibold">
              Start your first analysis.
            </h3>
            <Link
              href="/analysis"
              className="mt-4 inline-flex h-9 items-center rounded-lg px-4 font-mono text-sm font-medium transition-opacity hover:opacity-85"
              style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
            >
              Get started →
            </Link>
          </div>
        </div>
      </section>

      {/*  About + Contact  */}
      <section id="about" className="mt-16 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-background-subtle p-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase whitespace-nowrap">
              About Glint
            </span>
            <div className="flex-1 border-t border-border" />
          </div>
          <p className="font-mono text-xs leading-7 text-foreground-muted">
            Glint builds lightweight tools that help candidates understand how
            well their profile aligns with role requirements. This MVP focuses
            on the core loop: upload CV, run analysis, and follow score
            development over time.
          </p>
        </div>

        <div id="contact" className="rounded-xl border border-border bg-background-subtle p-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase whitespace-nowrap">
              Contact
            </span>
            <div className="flex-1 border-t border-border" />
          </div>
          <p className="font-mono text-xs leading-7 text-foreground-muted">
            Questions, feedback, or partnership inquiries — we&apos;d love to hear
            from you. Use the contact form to get in touch.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 font-mono text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
          >
            Open contact form
          </Link>
        </div>
      </section>

      {/*  Footer strip  */}
      <div className="mt-16 border-t border-border pt-6 pb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-foreground-muted uppercase">
          Glint MVP · {new Date().getFullYear()}
        </span>
        <span className="font-mono text-[10px] text-foreground-muted">
          CV Intelligence
        </span>
      </div>

    </div>
  );
}