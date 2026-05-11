import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <section className="relative pt-12 pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
              About Glint
            </p>
          </div>

          <h1 className="font-mono text-[2.75rem] md:text-4xl lg:text-5xl font-semibold leading-[1.08] tracking-tight text-foreground">
            Understanding the{" "}
            <span className="bg-linear-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              gap between you and the role
            </span>
          </h1>

          <p className="mt-6 font-mono text-sm leading-[1.85] text-foreground-muted max-w-2xl">
            Glint was built to solve a simple problem: job seekers spend hours
            tailoring applications with no real feedback about fit. We believe
            you deserve clarity before investing your time.
          </p>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            Our Mission
          </p>
          <h2 className="font-mono text-3xl font-semibold leading-tight text-foreground mb-6">
            Make resume-to-role alignment transparent
          </h2>
          <p className="font-mono text-sm leading-[1.9] text-foreground-muted mb-4">
            Every job application is a gamble. You spend hours perfecting your
            resume, crafting cover letters, hoping your experience aligns with
            what the hiring team wants. But you never really know.
          </p>
          <p className="font-mono text-sm leading-[1.9] text-foreground-muted mb-4">
            Glint changes that by giving you instant, multi-angle feedback on
            how well your resume actually matches a specific role. Three
            analysis engines work together to give you the full picture.
          </p>
          <p className="font-mono text-sm leading-[1.9] text-foreground-muted">
            No bias. No hidden scoring. Just clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-8 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-lg font-bold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                }}
              >
                AI
              </div>
              <h3 className="font-mono font-semibold text-foreground">
                Semantic Analysis
              </h3>
            </div>
            <p className="font-mono text-xs leading-[1.8] text-foreground-muted">
              Beyond keywords. Our AI understands the concepts behind your
              experience and the role requirements, finding conceptual overlap
              others miss.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-lg font-bold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                }}
              >
                ✓
              </div>
              <h3 className="font-mono font-semibold text-foreground">
                Keyword Matching
              </h3>
            </div>
            <p className="font-mono text-xs leading-[1.8] text-foreground-muted">
              Precise coverage analysis. We check which specific terms from the
              job description appear in your resume, highlighting both strengths
              and gaps.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-lg font-bold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-fg)",
                }}
              >
                ⚙
              </div>
              <h3 className="font-mono font-semibold text-foreground">
                Rule-Based Criteria
              </h3>
            </div>
            <p className="font-mono text-xs leading-[1.8] text-foreground-muted">
              Hard requirements. Years of experience, specific certifications,
              and other must-haves are flagged explicitly.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-20">
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-3">
            How Glint Works
          </p>
          <h2 className="font-mono text-2xl font-semibold text-foreground">
            Three quick steps to clarity
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              n: "01",
              title: "Upload Your Resume",
              body: "Drop a PDF. We parse it locally — your data never touches our servers. Privacy by design.",
            },
            {
              n: "02",
              title: "Paste the Job Ad",
              body: "Add the full job description and title. We analyze everything: description, requirements, nice-to-haves.",
            },
            {
              n: "03",
              title: "Get Your Score",
              body: "Three engines score your match instantly. Review detailed feedback on each dimension. Track how different roles align with your profile.",
            },
            {
              n: "04",
              title: "Learn Over Time",
              body: "Build a history of analyses. See which role types align best with your background. Improve your positioning.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="flex gap-6 p-6 rounded-xl border border-border bg-linear-to-br from-background-subtle/30 to-background/30 hover:border-primary/50 hover:bg-background-subtle/60 transition-all duration-300"
            >
              <div className="shrink-0">
                <span
                  className="flex items-center justify-center w-12 h-12 rounded-lg font-mono text-sm font-bold text-primary-fg"
                  style={{ background: "var(--primary)" }}
                >
                  {step.n}
                </span>
              </div>
              <div>
                <h3 className="font-mono text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="font-mono text-xs leading-[1.8] text-foreground-muted">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
            Privacy First
          </p>
          <h2 className="font-mono text-2xl font-semibold text-foreground mb-6">
            Your data stays yours
          </h2>
          <p className="font-mono text-sm leading-[1.9] text-foreground-muted mb-4">
            We believe privacy isn&apos;t a feature — it&apos;s a right. Glint processes
            your resume locally in your browser. We never store your resume
            unless you explicitly create an account to track analyses over time.
          </p>
          <p className="font-mono text-sm leading-[1.9] text-foreground-muted">
            Analysis metadata (scores, feedback) is encrypted and stored only
            with your explicit consent. You can delete your account and all
            associated data anytime.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-border bg-linear-to-br from-primary/5 via-primary/3 to-background">
          <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase mb-4 font-semibold">
            Built with care
          </p>
          <ul className="space-y-3 font-mono text-sm text-foreground-muted">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>Client-side parsing for instant, private analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>No resume storage without consent</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>Encrypted analysis history (optional)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>Open about our methods and limitations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>No account required to start analyzing</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="py-20 flex flex-col items-center text-center">
        <p className="font-mono text-[10px] tracking-[0.25em] text-foreground-muted uppercase mb-4">
          Ready to get started
        </p>
        <h2 className="font-mono text-3xl font-semibold text-foreground mb-4 max-w-xl">
          See exactly how your resume aligns with your dream role
        </h2>
        <p className="font-mono text-sm text-foreground-muted max-w-lg mb-8">
          No account required. No signup friction. Just upload your resume, add
          a job ad, and get instant feedback from three analysis engines.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/analysis"
            className="inline-flex h-11 items-center gap-2 rounded-lg px-6 font-mono text-sm font-medium transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
          >
            Start analyzing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex h-11 items-center rounded-lg px-6 font-mono text-sm font-medium border border-primary/40 text-foreground transition-all hover:border-primary hover:bg-primary/10"
          >
            Create account
          </Link>
        </div>
      </section>

      <div className="border-t border-border py-6 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-foreground-muted uppercase">
          Glint MVP · {new Date().getFullYear()}
        </span>
        <span className="font-mono text-[10px] text-foreground-muted">
          Resume Intelligence
        </span>
      </div>
    </div>
  );
}
