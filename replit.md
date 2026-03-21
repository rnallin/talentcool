# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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
