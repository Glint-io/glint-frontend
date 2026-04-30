import Link from "next/link";
import AuthCTA from "@/components/AuthCTA";
import { SimulatedAnalysisDemo } from "@/components/SimulatedAnalysisDemo";

const steps = [
  {
    n: "01",
    title: "Upload your CV",
    body: "Drop a PDF resume. Parsed locally — your data stays with you.",
  },
  {
    n: "02",
    title: "Paste the job ad",
    body: "Add the full description and a title to track it later.",
  },
  {
    n: "03",
    title: "Read your score",
    body: "Three engines give you the full picture. No blind spots.",
  },
];

const methods = [
  { label: "AI Semantic", pct: 87 },
  { label: "Keyword Match", pct: 73 },
  { label: "Rule-Based", pct: 91 },
];

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col">

      {/*  Hero  */}
      <section className="pt-6 pb-20 grid gap-16 lg:grid-cols-[1fr_320px] lg:items-center">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted mb-7">
            Glint · CV Intelligence
          </p>

          <h1 className="font-mono text-[2.75rem] md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.08] tracking-tight text-foreground">
            Know exactly how your CV{" "}
            <span className="text-primary">fits the role</span>{" "}
            before you apply.
          </h1>

          <p className="mt-6 font-mono text-sm leading-[1.85] text-foreground-muted">
            Upload your CV, paste a job ad. Three analysis engines give you a
            match score in seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/analysis"
              className="inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium transition-opacity hover:opacity-85"
              style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
            >
              Run your first analysis →
            </Link>
            <AuthCTA />
          </div>
        </div>

        {/* Interactive demo */}
        <div className="hidden lg:block">
          <SimulatedAnalysisDemo />
        </div>
      </section>

      {/*  Divider  */}
      <div className="h-px bg-border" />

      {/*  How it works  */}
      <section className="py-16">
        <div className="grid sm:grid-cols-3 gap-10 sm:gap-6">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col gap-4">
              <span
                className="font-mono text-[4rem] font-bold leading-none select-none"
                style={{ color: "var(--primary)", opacity: 0.18 }}
                aria-hidden
              >
                {step.n}
              </span>
              <div>
                <h3 className="font-mono text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-[1.8] text-foreground-muted">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  Divider  */}
      <div className="h-px bg-border" />

      {/*  Analysis methods  */}
      <section className="py-16 grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            Three analysis methods
          </p>
          <h2 className="font-mono text-2xl font-semibold leading-tight tracking-tight text-foreground">
            AI doesn&apos;t replace precision. It adds to it.
          </h2>
          <p className="mt-4 font-mono text-xs leading-[1.9] text-foreground-muted max-w-sm">
            Semantic AI finds conceptual overlap. Keyword match checks literal
            coverage. Rule-based criteria flag industry requirements. Together
            they leave nothing out.
          </p>

          <Link
            href="/analysis"
            className="mt-8 inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 font-mono text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
          >
            Try it now
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {methods.map((m) => (
            <div key={m.label} className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-foreground-muted w-28 shrink-0">
                {m.label}
              </span>
              <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.pct}%`, background: "var(--primary)" }}
                />
              </div>
              <span
                className="font-mono text-xs font-semibold w-5 text-right"
                style={{ color: "var(--primary)" }}
              >
                {m.pct}
              </span>
            </div>
          ))}

          {/* Score trend sparkline */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="font-mono text-[10px] text-foreground-muted tracking-wide uppercase mb-3">
              Score over time
            </p>
            <div className="flex items-end gap-1 h-10">
              {[40, 55, 52, 68, 72, 79, 87].map((h, i, arr) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background: i === arr.length - 1 ? "var(--primary)" : "var(--border)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*  Divider  */}
      <div className="h-px bg-border" />

      {/*  CTA strip  */}
      <section className="py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-mono text-xl font-semibold text-foreground">
            Start your first analysis.
          </h2>
          <p className="mt-1.5 font-mono text-xs text-foreground-muted">
            No account required to try it.
          </p>
        </div>
        <Link
          href="/analysis"
          className="shrink-0 inline-flex h-10 items-center rounded-lg px-6 font-mono text-sm font-medium transition-opacity hover:opacity-85"
          style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
        >
          Get started →
        </Link>
      </section>

      {/*  Divider  */}
      <div className="h-px bg-border" />

      {/*  About + Contact  */}
      <section
        id="about"
        className="py-14 grid sm:grid-cols-2 gap-10"
      >
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            About Glint
          </p>
          <p className="font-mono text-xs leading-[1.9] text-foreground-muted max-w-xs">
            Glint builds lightweight tools that help candidates understand how
            well their profile aligns with role requirements. This MVP focuses
            on the core loop: upload CV, run analysis, follow your score over time.
          </p>
        </div>

        <div id="contact">
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            Contact
          </p>
          <p className="font-mono text-xs leading-[1.9] text-foreground-muted max-w-xs">
            Questions, feedback, or partnership inquiries. Use the contact form
            to get in touch.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 font-mono text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
          >
            Open contact form
          </Link>
        </div>
      </section>

      {/*  Footer  */}
      <div className="border-t border-border py-6 flex items-center justify-between">
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