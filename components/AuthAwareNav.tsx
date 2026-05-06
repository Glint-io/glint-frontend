"use client";

import CardNav from "./CardNav";
import type { CardNavItem } from "./CardNav";
import { useAuth } from "@/components/AuthProvider";
import { LogIn, UserRound } from "lucide-react";

//  Nav item sets

const SHARED_ITEMS: CardNavItem[] = [
  {
    label: "Landing",
    // Use theme-aware CSS variables so nav matches the rest of the site
    bgColor: "var(--background-subtle)",
    textColor: "var(--foreground)",
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
    bgColor: "var(--background-subtle)",
    textColor: "var(--foreground)",
    links: [
      { label: "Run analysis", href: "/analysis", ariaLabel: "Run analysis" },
    ],
  },
];

const LOGGED_OUT_ACCOUNT: CardNavItem = {
  label: "Account",
  bgColor: "var(--primary)",
  textColor: "var(--primary-fg)",
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
  bgColor: "var(--primary)",
  textColor: "var(--primary-fg)",
  links: [
    { label: "Profile", href: "/user", ariaLabel: "Go to user profile" },
    { label: "Logout", href: "/auth/logout", ariaLabel: "Logout from account" },
  ],
};

//  Component

type AuthAwareNavProps = Omit<React.ComponentProps<typeof CardNav>, "items">;

export default function AuthAwareNav(props: AuthAwareNavProps) {
  const { isLoggedIn } = useAuth();

  const accountItem = isLoggedIn ? LOGGED_IN_ACCOUNT : LOGGED_OUT_ACCOUNT;
  const items: CardNavItem[] = [...SHARED_ITEMS, accountItem];
  const secondaryAction = isLoggedIn
    ? {
        href: "/user",
        ariaLabel: "Go to your user page",
        Icon: UserRound,
      }
    : {
        href: "/auth/login",
        ariaLabel: "Sign in to your account",
        Icon: LogIn,
      };

  // Render nothing until we know the auth state to prevent hydration mismatch
  if (isLoggedIn === null) return null;

  return <CardNav {...props} items={items} secondaryAction={secondaryAction} />;
}
