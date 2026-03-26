import Link from "next/link";
import { ScoreTrendChart } from "../../components/score-trend-chart";
import { getUserDashboardData } from "../lib/data-source";
import { getDashboardStats } from "../lib/mock-data";

function getMethodLabel(method: number) {
    if (method === 0) {
        return "AI";
    }
    if (method === 1) {
        return "RuleBased";
    }

    return "Keyword";
}

export default async function UserPage() {
    const dashboard = await getUserDashboardData();
    const stats = getDashboardStats(dashboard.history);
    const trendPoints = dashboard.history.map((item) => item.score);

    return (
        <div className="flex w-full flex-col gap-6">
            <section className="rounded-2xl border border-border bg-background-subtle p-6 shadow-sm">
                <p className="text-sm font-medium text-foreground-muted">Signed in as</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    Demo User
                </h1>
                <p className="mt-1 text-sm text-foreground-muted">{dashboard.user.Email}</p>
                <p className="mt-1 text-xs text-foreground-muted">
                    UserId: {dashboard.user.Id} • Verified: {dashboard.user.IsEmailVerified ? "Yes" : "No"}
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Analyses" value={stats.totalAnalyses.toString()} />
                <StatCard label="Latest Score" value={`${stats.latest}%`} />
                <StatCard label="Average Score" value={`${stats.average}%`} />
                <StatCard
                    label="Progress"
                    value={`${stats.deltaFromFirst >= 0 ? "+" : ""}${stats.deltaFromFirst}%`}
                />
            </section>

            <ScoreTrendChart points={trendPoints} />

            <section className="rounded-2xl border border-border bg-background-subtle p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-foreground">CV Upload</h2>
                <p className="mt-2 text-sm text-foreground-muted">
                    Upload your latest CV file for future analysis.
                </p>
                {dashboard.latestResume ? (
                    <p className="mt-2 text-xs text-foreground-muted">
                        Latest resume: {dashboard.latestResume.FileName} ({dashboard.latestResume.UploadedAt.slice(0, 10)})
                    </p>
                ) : null}
                <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center" action="#" method="post">
                    <input
                        type="file"
                        name="cv"
                        accept=".pdf,.doc,.docx,.txt"
                        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
                    >
                        Upload CV
                    </button>
                </form>
            </section>

            <section className="rounded-2xl border border-border bg-background-subtle p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Tidigare analyser</h2>
                    <Link
                        href="/analysis"
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-background-subtle"
                    >
                        New analysis
                    </Link>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-foreground-muted">
                                <th className="px-3 py-2 font-medium">Role</th>
                                <th className="px-3 py-2 font-medium">Company</th>
                                <th className="px-3 py-2 font-medium">Date</th>
                                <th className="px-3 py-2 font-medium">Score</th>
                                <th className="px-3 py-2 font-medium">Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.history.map((item) => (
                                <tr key={item.analysisId} className="border-b border-border text-foreground">
                                    <td className="px-3 py-2">{item.title}</td>
                                    <td className="px-3 py-2">{item.company}</td>
                                    <td className="px-3 py-2">{item.createdAt.slice(0, 10)}</td>
                                    <td className="px-3 py-2 font-medium">{item.score}%</td>
                                    <td className="px-3 py-2">{getMethodLabel(item.method)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

type StatCardProps = {
    label: string;
    value: string;
};

function StatCard({ label, value }: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-background-subtle p-4">
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
    );
}