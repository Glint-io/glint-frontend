const methods = [
  {
    name: "Keyword overlap",
    description:
      "Counts shared terms between CV and job ad to produce a quick fit score.",
  },
  {
    name: "Trend tracking",
    description:
      "Stores score history so users can see whether their CV alignment improves.",
  },
  {
    name: "Actionable gaps",
    description:
      "Highlights missing job-ad keywords to guide CV updates.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Om oss</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
        Glint builds lightweight tools that help candidates understand how well
        their profile aligns with role requirements. This MVP focuses on the
        core loop: upload CV, run analysis, and follow score development over
        time.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-950">Metoder i MVP</h2>
      <ul className="mt-3 space-y-3">
        {methods.map((method) => (
          <li key={method.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-900">{method.name}</p>
            <p className="mt-1 text-sm text-slate-700">{method.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}