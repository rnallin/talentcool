# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Talent Cool — HR Platform (pt-BR)

4-module HR platform for SMBs: job openings & Kanban hiring pipeline, open position cost calculation, HR performance metrics, and strategic salary benchmarking by Brazilian region.

### DB Tables
- `departments`, `jobs`, `candidates`, `benchmarks` — core data
- `pipeline_stages` — configurable Kanban columns (6 default stages), CRUD via `/api/pipeline/stages`
- `company_settings` — key/value config (charges_rate, working_days_per_month, company_name), CRUD via `/api/settings`
- `email_drafts` — saved email drafts (subject, recipients, content, template, status draft/sent, timestamps)
- `email_automations` — scheduled email automations (name, template, recipients, frequency, dayOfWeek, hour, isActive, nextRunAt)

### Key Design Decisions
- Pipeline stages are dynamic (DB-driven), not hardcoded in the frontend
- Cost calculations use `charges_rate` from `company_settings` table (not hardcoded constant)
- Benchmark filter uses `and(...conditions)` for correct SQL predicate composition
- API codegen (Orval) runs from `lib/api-spec/openapi.yaml`; after codegen, fix `lib/api-zod/src/index.ts` to export only `./generated/api`
- After adding new DB schema tables, run `pnpm --filter @workspace/db push` then build libs with `npx tsc -p tsconfig.json` in each lib dir

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, Recharts, @hello-pangea/dnd, react-hook-form

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── hr-platform/        # HR Platform React+Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed.ts         # Database seed script
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/hr-platform` (`@workspace/hr-platform`)

HR Platform frontend. React + Vite app with 5 modules:
- Dashboard: KPIs overview (open jobs, candidates, time-to-hire, cost)
- Vagas e Pipeline: job listing + Kanban candidate pipeline
- Custo de Vagas: financial impact of open positions
- Métricas: time-to-hire by dept, funnel conversion, hires over time
- Benchmarking: salary benchmarks by role, seniority, and Brazilian region

### Design System

Color palette (Dribbble-inspired clean dashboard):
- Primary: `#145338` (dark green, HSL 155 63% 21%)
- Foreground: `#000402` (near-black)
- Sage: `#97A09B` (muted green-gray)
- Gray: `#6A6E6C` (neutral text)
- Accent green: `#2d8a5e` (lighter green for charts/gradients)
- Background: pure white (`#FFFFFF`)
- Sidebar: white/light with section labels (GERAL, FERRAMENTAS, OUTROS)

### AI Assistant
- Search bar in top header with sparkle icon navigates to /assistente with query
- /assistente page: chat interface with suggestion buttons, SSE streaming responses
- Backend: POST /api/ai/search gathers all platform data (jobs, candidates, departments, metrics) and sends as context to GPT-4o-mini
- ROI Report: POST /api/ai/roi-report — dedicated endpoint that calculates ROI metrics (time-to-hire reduction, cost savings, operational time savings, KPI impact) from real platform data and streams an executive report with charts
- ROI Report triggered via special card on assistant home page (uses `__ROI_REPORT__` trigger constant)
- Uses Replit AI Integrations (OpenAI proxy) — no API key needed, billed to credits
- Lazy OpenAI client initialization to avoid startup failures

### Internal Email Module
- /emails page: send templated emails via Resend integration
- 3 templates: Relatório de RH (full report), Insights & Alertas (smart analysis), E-mail Personalizado (custom)
- Preview panel with iframe rendering before sending
- Backend: POST /api/email/send and /api/email/preview
- Uses Replit connector credentials for Resend (auto-managed API key)
- Input validation: email format check, max 10 recipients
- Email HTML templates with Talent Cool green branding (#145338)

### Mobile App (`artifacts/mobile`)

React Native (Expo) mobile app mirroring key HR features:
- **Dashboard tab**: 6 KPI cards (open jobs, candidates, avg time-to-hire, total cost, cost/hire, hires this month) + recent jobs list
- **Vagas tab**: Searchable/filterable job list with status chips (Todas/Abertas/Pausadas/Fechadas)
- **Custos tab**: CoV (Cost of Vacancy) report with total loss, per-job breakdown, and CoV simulator
- **Metricas tab**: Overview grid, hiring funnel bars, time-to-hire by department
- **Job detail screen**: `/job/[id]` with candidate pipeline grouped by stage
- Uses NativeTabs (liquid glass iOS 26+) with ClassicTabs fallback
- Brand colors: primary #145338, accent #2d8a5e, background #FAFBFA
- Custom components: KPICard, JobCard, ErrorBoundary/ErrorFallback
- API consumption via `@workspace/api-client-react` generated hooks

### Landing Page (`artifacts/landing`)

Talent Cool marketing landing page with hero, features, metrics, testimonials, pricing, footer — all in pt-BR with green accent palette matching the platform.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`:
- `departments.ts` — GET /departments, POST /departments
- `jobs.ts` — CRUD for job openings
- `candidates.ts` — candidate management + pipeline stage updates
- `metrics.ts` — GET /metrics/overview, time-to-hire, funnel, hires-over-time
- `cost.ts` — GET /cost/open-jobs (financial cost calculation, 68% charges rate)
- `benchmark.ts` — GET /benchmark (salary benchmarks), /regions, /job-titles

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Tables:
- `departments` — company departments
- `jobs` — job openings with status, salary, location, work mode
- `candidates` — candidates with pipeline stage tracking
- `benchmarks` — salary benchmark data by role/seniority/region

Seed command: `pnpm --filter @workspace/scripts run seed`

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `scripts` (`@workspace/scripts`)

Utility scripts package. Run `pnpm --filter @workspace/scripts run seed` to populate the DB with sample data.
