# AGENTS.md

## Cursor Cloud specific instructions

Standard commands, ports, and env vars are documented in `README.md`, `CONTRIBUTING.md`, and `TESTING.md`. This section only captures non-obvious, durable gotchas for running this pnpm monorepo in a Cloud VM. The update script already runs `pnpm install` on startup.

### Environment / services
- Toolchain: Node 22, pnpm 11. One-command dev stack: `pnpm run dev:local` — starts the Express API on `:8080` (embedded PGLite) and the Vite app SPA on `:5173` (proxies `/api` → `:8080`). Health check: `GET http://localhost:8080/api/healthz`.
- Required local env files are gitignored and live only in the VM snapshot; recreate them if missing:
  - Root `.env`: `DATABASE_URL=local`, `PGLITE_DATA_DIR=/workspace/.data/pglite` (see PGLite note), `PORT=8080`/`API_PORT=8080`/`WEB_PORT=5173`, `SYNC_AUTH_DISABLED=1`, `ADMIN_PHONES=9999999999`.
  - `artifacts/trustkeyper/.env.local` and `artifacts/website/.env.local`: placeholder `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (any non-empty values). Without them the Supabase client throws at import and the app/website render blank (the website build test fails).

### PGLite data dir gotcha (breaks `dev:local` on a fresh checkout)
- `PGLITE_DATA_DIR` MUST be an absolute path (e.g. `/workspace/.data/pglite`). `db:push` resolves it relative to the repo root, but the API server resolves it relative to its own cwd (`artifacts/api-server`), so a relative value silently creates two different databases.
- PGLite's `mkdir` is not recursive: the parent dir must already exist. Run `mkdir -p /workspace/.data/pglite` before the first `dev:local`/`db:push` if the dir is absent.

### Building workspace libs before tests
- `lib/*` packages resolve to their built `dist/` (their `.` export's `import`/`default` point at `dist`), so `pnpm run test:run` and the app fail with "Failed to resolve entry for package @workspace/…" until they are built. Build them with `pnpm run build:deploy` (or `pnpm -r --filter "./lib/**" --if-present run build`). `pnpm run dev:api` rebuilds the libs it needs on start, and `pnpm run typecheck` also builds via `tsc --build`.

### Lint / test / build
- No ESLint is configured. The lint gate is `pnpm run typecheck` (TypeScript strict). 
- Tests: `pnpm run test:run` (trustkeyper + website Vitest) and `pnpm run test:api` (API handlers). The website suite includes a Playwright build test that needs Chromium: `pnpm --filter @workspace/website exec playwright install chromium`.

### Auth is Supabase phone OTP — local limits
- Real login requires a real Supabase project (phone OTP). The app is local-first: a "logged-in" session is just `sessionStorage` keys `tk_active_phone` + `tk_active_role`, so for local UI testing you can seed a session directly instead of logging in.
- Cloud sync (`/api/sync`) and property image upload both require a Supabase access token client-side (`syncAuthHeaders` returns null without one). With `SYNC_AUTH_DISABLED=1` the API accepts requests regardless of token validity, so injecting a fake Supabase session into `localStorage['tk-auth-session']` (future `expires_at`) makes UI writes sync to PGLite.
- The Add-Property wizard requires at least one uploaded image, and `/api/upload-property-image` hard-requires Vercel Blob (`BLOB_READ_WRITE_TOKEN`) with no local fallback — so that specific flow cannot be completed locally without Blob + Supabase secrets. Other owner actions (e.g. logging a maintenance ticket) work fully local-first.
