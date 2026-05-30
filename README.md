# TrustKeyper

Property rental management prototype for **owners** and **brokers**: onboarding, listings, tenants, agreements, and cloud sync across devices.

**Production:** [app.trustkeyper.com](https://app.trustkeyper.com)

---

## Architecture

| Layer | Location | Notes |
|--------|-----------|--------|
| Frontend (Vite + React) | `artifacts/trustkeyper/` | SPA; phone OTP via Supabase Auth |
| Vercel serverless API | `api/` | `/api/healthz`, `/api/sync/*` (Postgres on Vercel) |
| Local Express API | `artifacts/api-server/` | Dev only; proxies from Vite |
| Shared libs | `lib/db`, `lib/sync-store`, `lib/auth-server` | Drizzle + PGlite locally; JWT verify on sync |
| Auth | Supabase (Twilio SMS) | Anon key in browser; no service role in frontend |

```
Browser ──► Supabase Auth (OTP) ──► JWT on protected sync calls
       └──► /api/sync/... ──► Postgres (user_data, RLS enabled) or mock store
```

**Monorepo:** pnpm workspaces. Vercel **Root Directory** must be the repo root (`.`).

---

## Prerequisites

- **Node.js** 22+
- **pnpm** 11 (`corepack enable` or `npm i -g pnpm`)
- For real SMS OTP: [Supabase](https://supabase.com) project with Phone auth + Twilio

---

## Quick start (local)

```bash
pnpm install
cp .env.example .env
```

**Frontend + embedded DB (simplest):**

```bash
pnpm run dev:local
```

Opens the Vite app (default port from `PORT` in `.env`, often 5173). API runs on `8080` and is proxied at `/api`.

**Supabase OTP in dev** — create `artifacts/trustkeyper/.env.local`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

For **local sync JWT checks** (optional), add the same values to root `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`, or set `SYNC_AUTH_DISABLED=1` to skip server auth in mock mode.

**Docker Postgres instead of PGlite:**

```bash
pnpm run dev:local:docker
```

Set `DATABASE_URL` in `.env` per `.env.example`.

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Root `.env` / Vercel | `local` / PGlite path, or Postgres URL (pooler in prod) |
| `USE_MOCK_DB` | Root | Force in-memory mock API (demos) |
| `VITE_SUPABASE_URL` | Vercel + `.env.local` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Public anon key only — never service role |
| `SUPABASE_URL` | Root `.env` / Vercel | Same project URL — server JWT verification |
| `SUPABASE_ANON_KEY` | Root `.env` / Vercel | Anon key for `auth.getUser()` on sync routes |
| `SYNC_AUTH_DISABLED` | Root | `1` = skip sync JWT (local mock only) |
| `PORT` / `API_PORT` | Root | Local API port (default 8080) |

See [.env.example](.env.example) and [docs/vercel-prototype-database.md](docs/vercel-prototype-database.md) for mock-mode behavior.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev:local` | PGlite init + API + frontend |
| `pnpm run dev:web` | Frontend only |
| `pnpm run dev:api` | Express API only |
| `pnpm run typecheck:deploy` | CI/Vercel-safe typecheck (libs, `api/`, artifacts) |
| `pnpm run build:deploy` | Production build (frontend + api-server bundle) |
| `pnpm run db:push` | Ensure local `user_data` table (PGlite) |
| `pnpm run seed:prototype` | Seed file-based prototype store |

---

## Deploying to Vercel

1. Connect the GitHub repo; set **Root Directory** to `.` (repository root).
2. Production env:
   - `DATABASE_URL` — Supabase **transaction pooler** URL (SSL)
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (frontend)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (server — same values, for sync JWT)
3. Apply RLS on Supabase once: run [supabase/migrations/20250529120000_user_data_rls.sql](supabase/migrations/20250529120000_user_data_rls.sql) in the SQL editor.
4. `vercel.json` runs `typecheck:deploy` + Vite build; rewrites `/api/sync/*` to the catch-all handler.

**Smoke tests after deploy:**

```bash
curl -sS https://app.trustkeyper.com/api/healthz
curl -sS "https://app.trustkeyper.com/api/sync/accounts/9999999999/owner/exists"
```

---

## Project layout

```
api/                    # Vercel serverless (sync, healthz)
artifacts/
  trustkeyper/          # Main React app
  api-server/           # Local Express server
lib/
  auth-server/          # Supabase JWT verification for sync API
  db/                   # Drizzle schema + queries
  sync-store/           # Cloud sync abstraction (mock / postgres / blob)
docs/                   # Deployment, security, database notes
supabase/migrations/    # Postgres migrations (RLS, etc.)
```

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) on `main` and PRs:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck:deploy`
- `pnpm run build:deploy`

---

## Security

- **OTP:** Supabase phone auth (Twilio) on login and signup.
- **Sync API:** Protected read/write routes require `Authorization: Bearer <jwt>`; JWT phone must match URL. Public `/exists` and `/roles` for pre-OTP UX.
- **Postgres:** RLS enabled on `user_data`; no anon/authenticated policies.
- **Secrets:** Anon key in browser only; `DATABASE_URL` and service role never in `VITE_*`.

Full model: [docs/security.md](docs/security.md). Hardening notes: [docs/deployment-hardening.md](docs/deployment-hardening.md).

**Still recommended for scale:** rate limiting on public routes, audit logging, optional `auth_user_id` column when moving beyond phone-as-key.

---

## License

MIT
