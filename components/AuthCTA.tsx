"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredAuth } from "@/lib/auth";

export default function AuthCTA({ className = "" }: { className?: string }) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    //TODO: find a better way to avoid hydration mismatch than rendering nothing on the server, which causes CLS and hurts SEO

    const check = () => {
      const auth = getStoredAuth();
      setLoggedIn(Boolean(auth?.accessToken));
    };

    check();
    const handler = () => check();
    window.addEventListener("glint:auth-change", handler);
    return () => window.removeEventListener("glint:auth-change", handler);
  }, []);

  // Avoid flashing the unauthenticated CTA during first render
  if (!isMounted) {
    return (
      <div
        aria-hidden
        className={
          "inline-flex h-10 items-center rounded-lg px-5 " +
          className +
          " invisible"
        }
      />
    );
  }

  if (loggedIn) {
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
    <Link
      href="/auth/register"
      className={
        "inline-flex h-10 items-center rounded-lg border border-border bg-background px-5 font-mono text-sm font-medium text-foreground transition-colors hover:bg-background-subtle " +
        className
      }
    >
      Create free account
    </Link>
  );
}
