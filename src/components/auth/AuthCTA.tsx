"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { openAuthModal } from "./AuthModal";

export default function AuthCTA({ className = "" }: { className?: string }) {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn === null) {
    return (
      <div
        className={
          "inline-flex h-10 items-center rounded-lg border border-border bg-background px-5 font-mono text-sm font-medium text-foreground opacity-0 " +
          className
        }
      >
        Loading...
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <Link
        href="/user"
        className={
          "inline-flex h-10 items-center rounded-lg px-5 font-mono text-sm font-medium transition-opacity hover:opacity-85 " +
          className
        }
      >
        Your account
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openAuthModal("register")}
      className={
        "inline-flex h-10 items-center rounded-lg border border-border bg-background px-5 font-mono text-sm font-medium text-foreground transition-colors hover:bg-background-subtle " +
        className
      }
    >
      Create free account
    </button>
  );
}
