# glint-frontend

Next.js frontend for [Glint](../README.md).

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://localhost:7248
```

If the variable is missing or the backend is unreachable, the app falls back to mock data on the analysis demo and shows a service-down banner on authenticated pages.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Key routes

| Route | Description |
|---|---|
| `/` | Landing page with live analysis demo |
| `/analysis` | Full analysis tool |
| `/user` | Dashboard — history, resumes, job ads, stats |
| `/about` | How Glint works |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms-of-service` | Terms of service |
| `/auth/verify-email` | Email verification (OTC or link) |
| `/auth/reset-password` | Password reset |

Auth modals (`login`, `register`, `forgot password`) open as overlays from any page via `openAuthModal()`.

## Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/
│   ├── analysis/         # Score ring, results panel, inputs
│   ├── auth/             # Auth modal, provider, CTA
│   ├── home/             # Landing page components
│   ├── layout/           # Nav, footer, scroll header
│   ├── ui/               # Shared primitives (Button, Modal, Toast, etc.)
│   └── user/             # Dashboard components
└── lib/
    ├── auth.ts           # Token storage, refresh logic, authedFetch
    └── useSimulatedAnalysis.ts  # Mock data for the landing demo
```

## Authentication

Access tokens are stored in `localStorage` under `glint.auth`. The `authedFetch` wrapper automatically retries with a refreshed token on 401 responses. Auth state is broadcast via a `glint:auth-change` custom event so all tabs and components stay in sync.