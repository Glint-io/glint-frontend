"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Send, CheckCircle } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

const SUBJECTS = [
  "General question",
  "Bug report",
  "Feature request",
  "Data / privacy request",
  "Partnership inquiry",
  "Other",
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length >= 10 &&
    formState !== "submitting";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg(null);

    // In a real deployment this would POST to a backend endpoint or a
    // third-party form service (e.g. Resend, Formspree). For now we
    // simulate a short network delay so the UX is realistic.
    await new Promise((r) => setTimeout(r, 900));

    // TODO: replace simulation with real API call, e.g.:
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ name, email, subject, message }),
    // });
    // if (!res.ok) { setFormState("error"); ... return; }

    setFormState("success");
  }

  if (formState === "success") {
    return (
      <div className="mx-auto w-full max-w-lg flex flex-col items-center gap-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <CheckCircle className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-mono text-2xl font-semibold text-foreground">
            Message sent
          </h1>
          <p className="mt-3 font-mono text-sm leading-relaxed text-foreground-muted max-w-sm">
            Thanks for reaching out. We typically respond within 5 business
            days. Check your inbox — we&apos;ll reply to{" "}
            <span className="text-foreground">{email}</span>.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <Link href="/">
            <Button variant="outline" className="font-mono text-xs">
              Back to home
            </Button>
          </Link>
          <Link href="/analysis">
            <Button className="font-mono text-xs">Run analysis →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-10 py-8">
      <div className="flex flex-col gap-4 border-b border-border pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground-muted">
            Contact
          </p>
        </div>
        <h1 className="font-mono text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
          Get in touch
        </h1>
        <p className="font-mono text-sm leading-relaxed text-foreground-muted max-w-prose mt-1">
          Questions, feedback, bug reports, or data requests — fill out the form
          below and we&apos;ll get back to you within 5 business days.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Privacy policy",
            desc: "How we handle your data",
            href: "/privacy",
          },
          {
            label: "Analysis",
            desc: "Try the tool for free",
            href: "/analysis",
          },
          {
            label: "Dashboard",
            desc: "Manage your account",
            href: "/user",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col gap-1 rounded-xl border border-border bg-background-subtle/60 p-4 transition-all hover:border-primary/40 hover:bg-primary/3"
          >
            <p className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.label} →
            </p>
            <p className="font-mono text-[10px] text-foreground-muted">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-name"
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={formState === "submitting"}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground-muted/50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-email"
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={formState === "submitting"}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground-muted/50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-subject"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted"
          >
            Subject
          </label>
          <select
            id="contact-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={formState === "submitting"}
            className="rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 appearance-none"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-message"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted flex items-center justify-between"
          >
            <span>Message</span>
            {message.length > 0 && (
              <span
                className={
                  message.length < 10
                    ? "text-destructive"
                    : "text-foreground-muted"
                }
              >
                {message.length} chars
              </span>
            )}
          </label>
          <textarea
            id="contact-message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your question or feedback in detail…"
            rows={6}
            disabled={formState === "submitting"}
            className="resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground-muted/50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
          {message.length > 0 && message.length < 10 && (
            <p className="font-mono text-[10px] text-destructive">
              At least 10 characters required.
            </p>
          )}
        </div>

        {errorMsg && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="font-mono text-[10px] text-foreground-muted max-w-xs">
            By submitting you agree to our{" "}
            <Link
              href="/privacy"
              className="underline hover:text-foreground transition-colors"
            >
              privacy policy
            </Link>
            .
          </p>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 font-mono text-xs gap-2"
          >
            {formState === "submitting" ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send message
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
