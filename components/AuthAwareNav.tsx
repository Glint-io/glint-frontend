"use client";

import { useEffect, useState } from "react";
import CardNav from "./CardNav";
import type { CardNavItem } from "./CardNav";
import { getAccessToken } from "@/lib/auth";

// ─── Nav item sets ─────────────────────────────────────────────────────────────

const SHARED_ITEMS: CardNavItem[] = [
  {
    label: "Landing",
    bgColor: "#2A1E0F",
    textColor: "#FAEFD9",
    links: [
      { label: "Start", href: "/", ariaLabel: "Go to homepage" },
      { label: "About", href: "/#about", ariaLabel: "Go to about section" },
      {
        label: "Contact",
        href: "/#contact",
        ariaLabel: "Go to contact section",
      },
    ],
  },
  {
    label: "Analysis",
    bgColor: "#3A2A18",
    textColor: "#FAEFD9",
    links: [
      { label: "Run analysis", href: "/analysis", ariaLabel: "Run analysis" },
    ],
  },
];

const LOGGED_OUT_ACCOUNT: CardNavItem = {
  label: "Account",
  bgColor: "#E8A736",
  textColor: "#2A1E0F",
  links: [
    { label: "Login", href: "/auth/login", ariaLabel: "Go to login page" },
    {
      label: "Register",
      href: "/auth/register",
      ariaLabel: "Go to registration page",
    },
  ],
};

const LOGGED_IN_ACCOUNT: CardNavItem = {
  label: "Account",
  bgColor: "#E8A736",
  textColor: "#2A1E0F",
  links: [
    { label: "Profile", href: "/user", ariaLabel: "Go to user profile" },
    { label: "Logout", href: "/auth/logout", ariaLabel: "Logout from account" },
  ],
};

// ─── Component ─────────────────────────────────────────────────────────────────

type AuthAwareNavProps = Omit<React.ComponentProps<typeof CardNav>, "items">;

export default function AuthAwareNav(props: AuthAwareNavProps) {
  // Start as null (unknown) to avoid a flash of the wrong state.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(
    () => !!getAccessToken(),
  );

  useEffect(() => {
    // Cross-tab: storage event fires when another tab writes/removes the key
    const onStorage = (e: StorageEvent) => {
      if (e.key === "glint.auth") setIsLoggedIn(!!getAccessToken());
    };

    // Same-tab: dispatched by setAuth() and clearAuth() in auth.ts
    const onAuthChange = () => setIsLoggedIn(!!getAccessToken());

    window.addEventListener("storage", onStorage);
    window.addEventListener("glint:auth-change", onAuthChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("glint:auth-change", onAuthChange);
    };
  }, []);

  const accountItem = isLoggedIn ? LOGGED_IN_ACCOUNT : LOGGED_OUT_ACCOUNT;
  const items: CardNavItem[] = [...SHARED_ITEMS, accountItem];

  // Render nothing until we've read localStorage to prevent hydration mismatch
  if (isLoggedIn === null) return null;

  return <CardNav {...props} items={items} />;
}
