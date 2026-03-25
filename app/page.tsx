import Link from "next/link";

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col gap-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Glint Frontend MVP
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950">
          Analyze CV fit against job ads and follow score trends over time.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
          This MVP includes the main flow: login, user dashboard with CV upload,
          previous analyses, and a page to compare CV text with a job ad.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to Login
          </Link>
          <Link
            href="/user"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Open User Page
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-700">
            Simple sign-in form for the MVP journey.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Analysis</h2>
          <p className="mt-2 text-sm text-slate-700">
            Quick score using overlap between CV keywords and job ad keywords.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-700">
            Trend chart and statistics built from historical analyses.
          </p>
        </div>
      </section>
    </div>
  );
}
