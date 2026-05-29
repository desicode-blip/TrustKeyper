# Security architecture

TrustKeyper uses **Supabase phone OTP** for identity and **JWT-gated sync API** for cloud data.

## Sync API access model

| Route | Auth | Purpose |
|-------|------|---------|
| `GET .../exists` | Public | Pre-OTP signup/login checks |
| `GET .../roles` | Public | Role picker before session |
| `GET .../:role` | JWT required | Pull account blob |
| `PUT .../:role` | JWT required | Bulk save |
| `PUT .../:role/:key` | JWT required | Single key save |

When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set on the server, protected routes call `assertSyncAccountAuth` in `@workspace/auth-server`, which:

1. Validates the Bearer token via `supabase.auth.getUser(token)`
2. Extracts the user's phone from Supabase Auth
3. Requires an exact match with the `:phone` path segment

Set `SYNC_AUTH_DISABLED=1` only for local mock demos without Supabase server env.

## Postgres `user_data`

- RLS is **enabled** with no `anon`/`authenticated` policies (see `supabase/migrations/`).
- Production API uses a direct Postgres connection; app-layer JWT checks are the primary control.
- RLS is defense in depth if the table is ever exposed via Supabase Data API.

## Environment (production)

| Variable | Scope |
|----------|--------|
| `VITE_SUPABASE_URL` | Browser |
| `VITE_SUPABASE_ANON_KEY` | Browser |
| `SUPABASE_URL` | Server (same project) |
| `SUPABASE_ANON_KEY` | Server (JWT verify only) |
| `DATABASE_URL` | Server only |

Never put `service_role` or `DATABASE_URL` in `VITE_*` variables.

## Future scalability

- **Rate limiting** on public `/exists` and `/roles` (Vercel middleware or edge)
- **`auth_user_id` column** on `user_data` when moving off phone-as-key
- **Supabase RLS policies** if sync moves to client SDK + PostgREST
- **Audit log** table for sync writes
