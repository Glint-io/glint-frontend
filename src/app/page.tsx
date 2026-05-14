"use client";
import Link from "next/link";
import { SimulatedAnalysisDemo } from "@/components/home/SimulatedAnalysisDemo";
import AnimatedMethodStats from "@/components/home/AnimatedMethodStats";
import { useAuth } from "@/components/auth/AuthProvider";

const steps = [
  {
    n: "01",
    title: "Upload your resume",
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

export default function Home() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="flex w-full flex-1 flex-col">
      <section className="relative pt-12 pb-24 grid gap-16 lg:grid-cols-[1fr_320px] lg:items-center overflow-hidden">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
              Glint · Resume Intelligence
            </p>
          </div>

          <h1 className="font-mono text-[2.75rem] md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.08] tracking-tight text-foreground">
            Know exactly how your resume{" "}
            <span className="bg-linear-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              fits the role
            </span>{" "}
            before you apply.
          </h1>

          <p className="mt-6 font-mono text-sm leading-[1.85] text-foreground-muted max-w-md">
            Upload your resume, paste a job ad. Three analysis engines give you
            a match score in seconds. No account required.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/analysis"
              className="inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium transition-all hover:shadow-lg hover:scale-105 active:scale-95 origin-left"
              style={{
                background: "var(--primary)",
                color: "var(--primary-fg)",
              }}
            >
              Analyze →
            </Link>
            {!isLoggedIn ? (
              <Link
                href="/auth/register"
                className="inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium border border-primary/40 text-foreground transition-all hover:border-primary hover:bg-primary/10"
              >
                Create account
              </Link>
            ) : (
              <Link
                href="/user"
                className="inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium border border-primary/40 text-foreground transition-all hover:border-primary hover:bg-primary/10"
              >
                View dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <SimulatedAnalysisDemo />
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-10 sm:py-20">
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-3">
            Simple process
          </p>
          <h2 className="font-mono text-2xl font-semibold text-foreground">
            Three steps to better insights
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.n}
              className="group relative p-6 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30 hover:border-primary/50 hover:bg-background-subtle/60 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300 -z-10"></div>

              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0">
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-lg font-mono text-xs font-bold text-primary-fg transition-all group-hover:scale-110"
                    style={{ background: "var(--primary)" }}
                  >
                    {step.n}
                  </span>
                </div>
              </div>
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

      <div className="h-px bg-border" />

      <section className="py-10 sm:py-20 grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            Three analysis methods
          </p>
          <h2 className="font-mono text-3xl font-semibold leading-tight tracking-tight text-foreground">
            AI doesn&apos;t replace precision.{" "}
            <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              It adds to it.
            </span>
          </h2>
          <p className="mt-6 font-mono text-xs leading-[1.9] text-foreground-muted max-w-sm">
            <span className="text-foreground">AI Semantic</span> finds
            conceptual overlap in your experience.{" "}
            <span className="text-foreground">Keyword Match</span> checks your
            coverage of specific terms.{" "}
            <span className="text-foreground">Rule-Based</span> flags hard
            requirements. Together they leave nothing out.
          </p>

          <Link
            href="/analysis"
            className="mt-8 inline-flex h-10 items-center rounded-lg border border-primary/40 bg-primary/10 px-5 font-mono text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/20 hover:shadow-lg"
          >
            Try it now →
          </Link>
        </div>

        <AnimatedMethodStats />
      </section>

      <div className="h-px bg-border" />

      <section className="py-10 sm:py-20 grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            About Glint
          </p>
          <h2 className="font-mono text-3xl font-semibold leading-tight text-foreground mb-6">
            Built for job seekers who want{" "}
            <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              clarity, not guesswork
            </span>
          </h2>
          <p className="font-mono text-sm leading-[1.9] text-foreground-muted mb-6">
            We believe you deserve honest feedback about how your resume aligns
            with a role before you invest hours tailoring your application.
            Glint was built to be transparent, fast, and truly private.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium transition-all hover:shadow-lg hover:scale-105 active:scale-95 origin-left"
              style={{
                background: "var(--primary)",
                color: "var(--primary-fg)",
              }}
            >
              Learn more →
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 font-mono text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="p-8 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30">
            <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-3 font-semibold">
              Privacy First
            </p>
            <p className="font-mono text-sm leading-[1.8] text-foreground-muted">
              Your resume never leaves your device. We process everything
              locally in your browser. No storage without consent.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30">
            <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-3 font-semibold">
              Three Angles
            </p>
            <p className="font-mono text-sm leading-[1.8] text-foreground-muted">
              AI semantic analysis, precise keyword matching, and rule-based
              criteria together reveal the complete picture.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30">
            <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-3 font-semibold">
              No Sign Up Friction
            </p>
            <p className="font-mono text-sm leading-[1.8] text-foreground-muted">
              Start analyzing immediately. Create an account whenever
              you&apos;re ready to track your progress over time.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="my-8 sm:my-16 py-8 sm:py-16 px-8 rounded-2xl bg-linear-to-r from-primary/5 via-primary/3 to-background border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-mono text-2xl font-semibold text-foreground">
            Ready to get started?
          </h2>
          <p className="mt-2 font-mono text-xs text-foreground-muted">
            See how well your resume aligns with your target role in seconds.
          </p>
        </div>
        <div className="shrink-0 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/analysis"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg px-6 font-mono text-sm font-medium transition-all hover:shadow-lg hover:scale-105 active:scale-95 origin-left sm:w-auto"
            style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
          >
            Analyze →
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg px-6 font-mono text-sm font-medium border border-primary/40 text-foreground transition-all hover:border-primary hover:bg-primary/10 sm:w-auto"
          >
            Create account
          </Link>
        </div>
      </section>
    </div>
  );
}
