# Working Notes — College Student Lifestyle & Productivity Survey

Developer reference for architecture, decisions, and known issues.

---

## Architecture Overview

This is a **pnpm monorepo** with two runnable artifacts:

1. **`artifacts/api-server`** — Express 5 Node.js API. Handles all data persistence and aggregation. Runs on its own port and is served at the `/api` path prefix by a reverse proxy.

2. **`artifacts/survey-app`** — React + Vite SPA. Served as static files in production. Communicates with the API via the `/api` prefix.

Both artifacts share libraries from the `lib/` directory:

| Library             | Purpose                                                          |
|---------------------|------------------------------------------------------------------|
| `lib/api-spec`      | Source of truth — OpenAPI 3.1 YAML + Orval config               |
| `lib/api-zod`       | Auto-generated Zod schemas (used by api-server for validation)   |
| `lib/api-client-react` | Auto-generated React Query hooks (used by survey-app)         |
| `lib/db`            | Drizzle ORM schema + PostgreSQL connection pool                  |

---

## Database Structure

### Table: `survey_responses`

| Column               | Type          | Notes                              |
|----------------------|---------------|------------------------------------|
| `id`                 | serial PK     | Auto-increment primary key         |
| `major`              | text          | Free-text, required                |
| `class_attendance`   | text          | Enum value (e.g. `every_class`)    |
| `study_hours_per_week` | text        | Enum value (e.g. `6_10`)          |
| `distractions`       | text[]        | Array of enum values               |
| `feels_productive`   | text          | `yes` or `no`                      |
| `sleep_hours`        | text          | Enum value (e.g. `7_8`)           |
| `productivity_habits`| text[]        | Array of enum values               |
| `routine_change`     | text nullable | Optional free-text answer          |
| `created_at`         | timestamptz   | Auto-set on insert                 |

**Why text for enum columns?** Postgres `text` is used instead of native Postgres `enum` types to allow easier future value additions without schema migrations.

**Why text arrays?** Drizzle supports `.array()` on text columns. Multi-select questions (distractions, habits) are stored as Postgres text arrays.

### Schema location

```
lib/db/src/schema/survey.ts   ← Drizzle table definition + Zod insert schema
lib/db/src/schema/index.ts    ← Barrel re-export
```

### Migrations

Development: use `pnpm --filter @workspace/db run push` to sync schema changes.
Production: Replit handles migrations on publish. Manual environment: run `push` before deploying.

---

## API Design Decisions

### Contract-first with OpenAPI

All API contracts are defined in `lib/api-spec/openapi.yaml` first. Running `pnpm --filter @workspace/api-spec run codegen` generates:
- `lib/api-zod/src/generated/api.ts` — Zod schemas for server-side validation
- `lib/api-client-react/src/generated/api.ts` — React Query hooks + fetch client
- `lib/api-client-react/src/generated/api.schemas.ts` — TypeScript types for the frontend

**Do not edit generated files.** Re-run codegen after any spec change.

### Results aggregation

Aggregation runs in-memory on the server (`artifacts/api-server/src/routes/survey.ts`). All rows are fetched from the DB and computed in Node.js. This is fine for small datasets (thousands of responses). For large scale, move to SQL-level aggregation with `GROUP BY`.

Array fields (distractions, habits) are unnested manually in JS by looping over all rows and counting occurrences per value.

### Label mapping

Raw DB enum values (e.g. `phone_social_media`) are mapped to human-readable labels (e.g. `Phone/social media`) in the server route before being sent to the client. The mapping lives in `artifacts/api-server/src/routes/survey.ts` in the `labelMap` object.

---

## Frontend Architecture

### Routing

Wouter is used for client-side routing (lightweight alternative to React Router).

| Route        | Page         |
|--------------|--------------|
| `/`          | Survey form  |
| `/thank-you` | Confirmation |
| `/results`   | Dashboard    |

All routes are defined in `artifacts/survey-app/src/App.tsx`.

### Form validation

`react-hook-form` with `zodResolver` handles validation. Zod schemas mirror the OpenAPI contract but are defined inline in `Home.tsx`. Checkbox fields require at least one selection.

### API calls

All API calls go through the Orval-generated hooks from `@workspace/api-client-react`. Never write raw `fetch` calls or manual `useQuery` hooks for routes that have generated hooks.

Hook import rule: always import from `@workspace/api-client-react` (the package root), never from `@workspace/api-client-react/src/generated/...` — the deep path is not exported and will break Vite's module resolution.

---

## Proxy & Routing

In development (Replit), a global reverse proxy routes requests:
- `/api/*` → API server (port 8080)
- `/*` → Vite dev server (port varies)

In production (Azure Static Web Apps), the proxy is replaced by:
- Static file serving for the frontend
- `navigationFallback` for SPA client-side routing
- `backend` proxy to the separately deployed Express API

---

## Known Issues & Limitations

1. **In-memory aggregation** — Results are computed by fetching all rows. Works fine up to ~10k responses. Beyond that, add SQL `GROUP BY` aggregation.

2. **No pagination on results** — The `/api/survey/results` endpoint always returns the full aggregated result. There is no cursor or limit.

3. **No deduplication** — A user can submit the survey multiple times. There is no IP-based or session-based deduplication.

4. **No auth** — The survey and results are fully public. Anyone with the URL can view all aggregated results.

5. **Free-text `major` field** — Aggregation groups by exact string match. "Computer Science" and "computer science" are counted as different majors. Consider normalizing to lowercase or adding a canonical list.

6. **Azure deployment** — The backend (Express API) must be deployed separately from the frontend (Static Web Apps). The `staticwebapp.config.json` includes an API proxy block; update `backendUri` to point to your deployed backend URL before publishing.

---

## Development Notes

### Codegen workflow

Whenever `lib/api-spec/openapi.yaml` changes:
1. Run `pnpm --filter @workspace/api-spec run codegen`
2. Check `lib/api-client-react/src/generated/api.ts` for new hook names
3. Update frontend usage if hook signatures changed
4. Do NOT edit generated files

### Adding a new survey question

1. Add the field to the OpenAPI spec (`lib/api-spec/openapi.yaml`) — both `SurveySubmission` and `SurveyResults` schemas
2. Run codegen
3. Add the DB column to `lib/db/src/schema/survey.ts`
4. Run `pnpm --filter @workspace/db run push`
5. Update the server route (`artifacts/api-server/src/routes/survey.ts`) — insert logic + aggregation
6. Update the frontend form (`artifacts/survey-app/src/pages/Home.tsx`)
7. Update the results page (`artifacts/survey-app/src/pages/Results.tsx`)

### TypeScript project structure

`lib/*` packages are **composite** TypeScript projects — they emit `.d.ts` declarations via `tsc --build`. `artifacts/*` are **leaf** packages checked with `tsc --noEmit`. Never add `artifacts/*` to the root `tsconfig.json` references.

---

## Environment Variables

| Variable       | Used by      | Description                              |
|----------------|--------------|------------------------------------------|
| `DATABASE_URL` | api-server   | Full PostgreSQL connection string        |
| `SESSION_SECRET` | api-server | Secret for session signing              |
| `PORT`         | Both         | Port each service listens on             |
| `BASE_PATH`    | survey-app   | URL base path for Vite (`/` in prod)    |
| `NODE_ENV`     | api-server   | `development` or `production`            |
