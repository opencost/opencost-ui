# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (modern UI)
npm run legacy       # Start dev server (legacy UI mode)
npm run build        # Production build (modern)
npm run build:legacy # Production build (legacy mode)
npm run build:all    # Build both modern and legacy
npm run typecheck    # Type-check + generate React Router types
```

There is no `npm test` or `npm run lint` script — ESLint is configured but not wired to a script.

## Architecture

**Framework:** React Router v7 (file-based routing, SSR disabled). Route definitions in `app/routes.ts` conditionally load legacy or modern routes. Route components live in `app/routes/`.

**Two UI modes** controlled by `VITE_LEGACY_MODE` env var:
- **Modern (default):** Dashboard-based UI — users create/manage dashboards composed of widgets
- **Legacy:** Traditional allocation/cloud-cost/external-costs pages under a `/legacy` basename

**State management:** React Context API only (no Redux/Zustand).
- `DashboardContext` — dashboard CRUD, persisted to `localStorage` under key `opencost-dashboards-v2`
- `ThemeContext` — light/dark Carbon theme, persisted to `localStorage` under key `opencost-theme`
- `AllocationFiltersContext` — filter state for cost allocation views

**API layer:** Axios client at `app/services/api-client.ts`. Base URL defaults to `/model` (overridden by `VITE_BASE_API_URL`). The client has built-in 30-second TTL caching and in-flight request deduplication. Domain-specific services (allocation, cloud-cost, assets, etc.) call through this client. Mock data fallback is enabled by `VITE_REACT_APP_USE_MOCK_DATA`.

**UI frameworks:**
- **Carbon Design System** (`@carbon/react`, `@carbon/charts`) — primary component library and theming
- **Tailwind CSS v4** — utility classes, applied alongside Carbon SCSS variables (`--cds-*` custom properties)
- **Material UI v7** — supplemental components (date pickers, etc.)
- Carbon SCSS theme setup is in `app/app.scss`; Tailwind entry is `app/tailwind.css`

## Key Directories

- `app/routes/` — route-level page components
- `app/components/` — reusable components (widgets, charts, context providers, shared UI)
- `app/components/legacy/` — legacy-mode-only components
- `app/services/` — API service modules + Axios client
- `app/lib/` — utility functions and data transformation helpers
- `app/constants/` — static data (colors, currency codes, chart options)

## Path Aliases

`~/*` maps to `./app/*` (configured in `tsconfig.json` and Vite).

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BASE_API_URL` | `/model` | Backend API base URL |
| `VITE_LEGACY_MODE` | — | Enable legacy UI |
| `VITE_LEGACY_BASENAME` | `/legacy` | Path prefix for legacy mode |
| `VITE_REACT_APP_USE_MOCK_DATA` | — | Use mock API responses |

At runtime in Docker, `BASE_URL_OVERRIDE` rewrites the API base URL via Nginx.
