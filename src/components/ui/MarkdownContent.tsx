"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: Props) {
  return (
    <div
      className={`max-w-3xl mx-auto w-full prose prose-invert font-mono ${className ?? ""}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="font-mono text-[10px] leading-relaxed text-foreground-muted whitespace-pre-wrap [&+p]:mt-4">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground-muted">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 transition hover:bg-primary/10 rounded"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 pl-5 font-mono text-[10px] text-foreground-muted list-disc marker:text-primary marker:font-semibold">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 font-mono text-[10px] text-foreground-muted marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="wrap-break-word font-mono text-[10px]">
              {children}
            </li>
          ),
          code: ({ children, className: codeClassName }) => (
            <code
              className={`rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary border border-primary/20 ${codeClassName ?? ""}`}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-background px-4 py-3 font-mono text-[10px] leading-relaxed text-foreground-muted shadow-sm">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-primary/60 pl-4 italic font-mono text-[10px] leading-relaxed text-foreground-muted bg-primary/5 rounded-sm">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-border" />,
          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 font-mono text-xl md:text-2xl font-semibold leading-tight text-foreground pl-3 border-l-4 border-primary/80">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 mb-3 font-mono text-lg font-semibold leading-tight text-foreground underline decoration-primary/10 decoration-2 underline-offset-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 font-mono text-sm font-semibold uppercase tracking-wide text-foreground-muted">
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
