export type ThemePreference = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

function applyTheme(theme: ThemePreference) {
    document.documentElement.classList.toggle("dark", theme === "dark");
}

function getSystemTheme(): ThemePreference {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function initTheme(): ThemePreference {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const theme: ThemePreference = saved === "dark" || saved === "light" ? saved : getSystemTheme();
    applyTheme(theme);
    return theme;
}

export function toggleTheme(): ThemePreference {
    const current: ThemePreference = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next: ThemePreference = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    return next;
}