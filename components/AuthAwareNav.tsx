"use client";

import CardNav from "./CardNav";
import type { CardNavItem } from "./CardNav";
import { useAuth } from "@/components/AuthProvider";

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
  const { isLoggedIn } = useAuth();

  const accountItem = isLoggedIn ? LOGGED_IN_ACCOUNT : LOGGED_OUT_ACCOUNT;
  const items: CardNavItem[] = [...SHARED_ITEMS, accountItem];

  // Render nothing until we know the auth state to prevent hydration mismatch
  if (isLoggedIn === null) return null;

  return <CardNav {...props} items={items} />;
}
