"use client";

import { toggleTheme } from "../lib/theme";

export function ThemeSwitcher() {
    return (
        <button
            type="button"
            onClick={() => toggleTheme()}
            className="absolute bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-background-subtle px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
            Theme
        </button>
    );
}
