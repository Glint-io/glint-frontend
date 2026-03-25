import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                User Login
            </h1>
            <p className="mt-2 text-sm text-slate-600">
                MVP login form. Auth can be wired later.
            </p>

            <form className="mt-6 space-y-4" action="#" method="post">
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="demo@glint.io"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="********"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Sign in
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
                For MVP demo, continue directly to{" "}
                <Link href="/user" className="font-medium text-slate-900 underline">
                    User Page
                </Link>
                .
            </p>
        </div>
    );
}