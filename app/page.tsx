import Link from "next/link";

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col gap-10">
      <section className="rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          Glint Frontend MVP
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
          Analyze CV fit against job ads and follow score trends over time.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground-muted">
          This MVP includes the main flow: login, user dashboard with CV upload,
          previous analyses, and a page to compare CV text with a job ad.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Go to Login
          </Link>
          <Link
            href="/user"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-background-subtle"
          >
            Open User Page
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background-subtle p-5">
          <h2 className="text-lg font-semibold text-foreground">Login</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Simple sign-in form for the MVP journey.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background-subtle p-5">
          <h2 className="text-lg font-semibold text-foreground">Analysis</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Quick score using overlap between CV keywords and job ad keywords.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background-subtle p-5">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Trend chart and statistics built from historical analyses.
          </p>
        </div>
      </section>

      <section id="about" className="rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">About</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground-muted">
          Glint builds lightweight tools that help candidates understand how well
          their profile aligns with role requirements. This MVP focuses on the
          core loop: upload CV, run analysis, and follow score development over
          time.
        </p>
      </section>

      <section id="contact" className="rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Contact</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground-muted">
          Basic contact flow is available in the MVP contact form.
        </p>
        <div className="mt-6">
          <Link
            href="/contact"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Open Contact Form
          </Link>
        </div>
      </section>
    </div>
  );
}
