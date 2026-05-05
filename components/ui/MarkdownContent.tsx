"use client";

import ReactMarkdown from "react-markdown";

type Props = {
    content: string;
    className?: string;
};

export function MarkdownContent({ content, className }: Props) {
    return (
        <div className={className}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => (
                        <p className="font-mono text-[10px] leading-relaxed text-foreground-muted whitespace-pre-wrap wrap-break-word [&+p]:mt-2">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-foreground-muted">{children}</em>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-2 transition hover:opacity-80"
                        >
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-2 list-disc space-y-1 pl-4 font-mono text-[10px] leading-relaxed text-foreground-muted">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-2 list-decimal space-y-1 pl-4 font-mono text-[10px] leading-relaxed text-foreground-muted">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="wrap-break-word">{children}</li>
                    ),
                    code: ({ children, className }) => (
                        <code
                            className={`rounded bg-background px-1 py-0.5 font-mono text-[0.9em] text-foreground ${className ?? ""}`}
                        >
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-background px-3 py-2 font-mono text-[10px] leading-relaxed text-foreground-muted">
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="my-2 border-l-2 border-border pl-3 font-mono text-[10px] italic leading-relaxed text-foreground-muted">
                            {children}
                        </blockquote>
                    ),
                    hr: () => <hr className="my-3 border-border" />,
                    h1: ({ children }) => (
                        <h1 className="mt-3 font-mono text-sm font-semibold text-foreground">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-3 font-mono text-[11px] font-semibold text-foreground">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
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