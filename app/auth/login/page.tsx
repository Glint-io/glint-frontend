import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                User Login
            </h1>
            <p className="mt-2 text-sm text-foreground-muted">
                MVP login form. Auth can be wired later.
            </p>

            <form className="mt-6 space-y-4" action="#" method="post">
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground-muted">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        placeholder="demo@glint.io"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground-muted">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        placeholder="********"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
                >
                    Sign in
                </button>
            </form>

            <p className="mt-4 text-sm text-foreground-muted">
                For MVP demo, continue directly to{" "}
                <Link href="/user" className="font-medium text-foreground underline">
                    User Page
                </Link>
                .
            </p>
        </div>
    );
}