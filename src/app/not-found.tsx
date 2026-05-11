import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex h-[100vh - 1vh] w-full items-center justify-center bg-background">
            <div className="rounded-2xl border border-border bg-background-subtle p-8 shadow-sm">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">404 - Page Not Found</h1>
                <p className="mt-4 text-sm leading-7 text-foreground-muted">
                    The page you are looking for does not exist. Please check the URL or return to the homepage.
                </p>
                <div className="mt-8">
                    <Link
                        href="/"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}