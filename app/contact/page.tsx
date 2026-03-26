export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-background-subtle p-6 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Basic contact form for the MVP.
      </p>

      <form className="mt-6 space-y-4" action="#" method="post">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground-muted">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Write your message"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
        >
          Send
        </button>
      </form>
    </div>
  );
}