# TrustKeyper — Architecture

This document describes the system design, data model, key architectural decisions, and the reasoning behind them. Update this document when any of these change.

---

## System Overview

TrustKeyper is a property management platform for NRI and remote property owners. It is a local-first SPA with cloud sync, served via Vercel, backed by Supabase PostgreSQL.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                        │
│                                                          │
│  React + Vite + Tailwind                                 │
│  Local state: localStorage + sessionStorage              │
│  Auth: Supabase Phone OTP                                │
│  Sync: periodic push/pull to /api/sync                   │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────────────────────┐
│               Vercel Edge / Serverless                   │
│                                                          │
│  /api/sync          — data sync (JWT protected)          │
│  /api/invitations   — tenant invitations                 │
│  /api/feedback      — feedback + Gemini AI               │
│  /api/managed-interest — managed plan interest email     │
│  /api/admin/*       — admin portal (allowlist protected) │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase                                │
│                                                          │
│  PostgreSQL — user_data, tenant_invitations, feedback    │
│  Auth — Phone OTP (SMS via Vonage)                       │
│  RLS — API-only access (no direct client DB access)      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Design decision: local-first with cloud sync

**Why:** The app was built to work offline and across poor network conditions (common for NRI users in different timezones). All user data is written to localStorage first and synced to Postgres asynchronously.

**Consequence:** Data lives in two places — browser storage and Postgres. The sync layer (`lib/sync-store/`) reconciles them. This works well for single-user scenarios but requires care when building multi-device or multi-user features.

**Direction:** New features should push toward server-authoritative data. The `tenant_invitations` table is the model — it's a proper relational table, server-owned, not stored in localStorage blobs.

---

### Database Tables

#### `user_data` — key/value blob store

The core storage table. All user data (profiles, properties, tenants, agreements, maintenance tickets, documents) is serialised as JSON and stored here.

```sql
CREATE TABLE user_data (
  phone       text NOT NULL,
  role        text NOT NULL,
  data_key    text NOT NULL,
  value       text NOT NULL,          -- JSON string
  updated_at  timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY (phone, role, data_key)
);
```

**Logical schema** — the `data_key` values and what they contain:

| `data_key` | Contents |
|---|---|
| `profile` | User profile: name, email, phone, bank details, UPI, KYC docs |
| `properties` | `Property[]` array |
| `tenants` | `Tenant[]` array (broker role) |
| `agreements` | `Agreement[]` array |
| `agreement_draft` | In-progress agreement wizard state |
| `onboarding_data` | Owner property onboarding draft |
| `add_property_data` | Broker add-property draft |
| `owner_tenant_inquiries` | Owner tenant inquiries |
| `owner_tenant_invites` | Owner tenant invites (local mirror — see note below) |
| `owner_property_maintenance` | Maintenance tickets per property |
| `owner_property_documents` | Document uploads per property |

**Important note on invites:** `owner_tenant_invites` in `user_data` is a local cache. The source of truth for invitations is the `tenant_invitations` table. The local cache exists for offline display only.

**RLS:** Enabled. All access is via the API using the service role connection. No direct client access.

---

#### `tenant_invitations` — invitation lifecycle

A proper relational table. Source of truth for all tenant invitation state.

```sql
CREATE TABLE tenant_invitations (
  id                   text PRIMARY KEY,
  token                text NOT NULL UNIQUE,
  owner_phone          text NOT NULL,
  owner_name           text NOT NULL,
  property_id          text NOT NULL,        -- references property id in owner's user_data blob
  property_label       text NOT NULL,
  tenant_name          text NOT NULL,
  tenant_phone         text NOT NULL,
  monthly_rent         text NOT NULL DEFAULT '',
  maintenance_included boolean NOT NULL DEFAULT false,
  monthly_maintenance  text NOT NULL DEFAULT '',
  security_deposit     text NOT NULL DEFAULT '',
  start_date           text NOT NULL DEFAULT '',
  status               text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','accepted','declined','expired')),
  expires_at           timestamptz NOT NULL,
  accepted_at          timestamptz,
  declined_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
```

**Indexes:** `owner_phone`, `token`

**Token-based access:** The `token` is the credential for public accept/decline operations. No auth required — knowing the token is sufficient. Tokens expire at `expires_at`.

---

#### `feedback` — user feedback

Stores in-app feedback submissions. Gemini AI analysis runs asynchronously after submission.

| Column | Type | Notes |
|---|---|---|
| `id` | text | UUID, server-generated |
| `message` | text | Required |
| `rating` | integer | 1–5 |
| `category` | text | `bug`, `feature`, `general`, `ux`, `other` |
| `user_phone` | text | Optional, from session |
| `user_role` | text | Optional, from session |
| `page_url` | text | Page where feedback was submitted |
| `ai_summary` | text | Gemini-generated summary (async) |
| `ai_sentiment` | text | Gemini-generated sentiment |
| `ai_tags` | text | JSON array of tags |
| `email_sent` | boolean | Whether notification email was sent |
| `created_at` | timestamptz | |

**No migration file** — table is created via runtime DDL in `api/_lib/feedbackDb.ts`. This should be migrated to a proper SQL migration file.

---

### Relations

There are no foreign key constraints in the database. Logical relationships are:

| Relationship | How linked |
|---|---|
| Invitation → Property | `tenant_invitations.property_id` matches a property `id` inside the owner's `user_data` properties JSON blob |
| Invitation → Owner | `tenant_invitations.owner_phone` matches `user_data.phone` where `role = 'owner'` |
| All user data rows | Linked by `phone` + `role` composite key |

**Direction:** New tables should use proper foreign keys where possible.

---

## Auth Architecture

### Provider: Supabase Phone OTP

```
User enters phone
      ↓
supabase.auth.signInWithOtp({ phone: "+91" + digits })
      ↓
SMS sent via Vonage
      ↓
User enters OTP
      ↓
supabase.auth.verifyOtp({ phone, token, type: "sms" })
      ↓
Returns access_token (JWT)
      ↓
JWT stored in localStorage (tk-auth-session)
JWT sent as Bearer token on all protected API calls
```

### Session storage

| Key | Storage | Contents |
|---|---|---|
| `tk-auth-session` | localStorage | Supabase JWT session |
| `tk_active_phone` | sessionStorage (or localStorage if remember-me) | Active user phone |
| `tk_active_role` | sessionStorage (or localStorage if remember-me) | Active user role |
| `tk_pending_role` | sessionStorage | Role context during login/signup flow |
| `tk_{phone}_{role}_{dataKey}` | localStorage | All account data blobs |

### Roles

```typescript
type Role = "broker" | "owner" | "tenant" | "manager" | "admin"
```

| Role | Status | Notes |
|---|---|---|
| `owner` | ✅ Live | Full flow implemented |
| `broker` | ✅ Live | Full flow implemented |
| `tenant` | 🔨 In progress | Defined, flows being built |
| `manager` | 🔲 Planned | Defined, no flows yet |
| `admin` | ✅ Live | Separate portal at `/admin/login` |

One phone number can hold multiple role profiles. The `AccountSwitcher` component manages role switching via `tk_active_role`.

### Server-side auth enforcement

| Endpoint group | Enforcement |
|---|---|
| `/api/sync/*` (protected) | Supabase JWT verified; phone in JWT must match `:phone` in URL |
| `/api/invitations` (create/list) | Same JWT + phone match |
| `/api/invitations/:token` (public) | Token is the credential — no JWT |
| `/api/admin/*` | JWT verified + phone must be in `ADMIN_PHONES` env var |
| `/api/feedback`, `/api/managed-interest` | No auth |
| `/api/sync/*/roles`, `/api/sync/*/exists` | No auth (public discovery) |

---

## API Architecture

### Production: Vercel Serverless

All routes in `/api/` are Vercel serverless functions.

**URL rewriting** (via `vercel.json`):
```
/api/sync/*         → /api/sync?syncPath=*
/api/invitations/*  → /api/invitations?invitePath=*
/(anything else)    → /index.html  (SPA fallback)
```

### Local dev: Express server

`artifacts/api-server/` mirrors the Vercel function surface exactly, serving the same routes on `localhost:8080`. This allows full-stack local development without needing Vercel CLI.

### Endpoint reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/healthz` | None | Health check |
| `GET` | `/api/sync/accounts/:phone/roles` | None | List roles for phone |
| `GET` | `/api/sync/accounts/:phone/:role/exists` | None | Check if account exists |
| `GET` | `/api/sync/accounts/:phone/:role` | JWT | Get all account data |
| `PUT` | `/api/sync/accounts/:phone/:role` | JWT | Bulk upsert account data |
| `PUT` | `/api/sync/accounts/:phone/:role/:dataKey` | JWT | Upsert single key |
| `POST` | `/api/invitations` | JWT | Create tenant invitation |
| `GET` | `/api/invitations/mine?ownerPhone=` | JWT | List owner's invitations |
| `GET` | `/api/invitations/:token` | Token | Get invitation by token |
| `POST` | `/api/invitations/:token` | Token | Accept or decline invitation |
| `POST` | `/api/feedback` | None | Submit feedback |
| `POST` | `/api/managed-interest` | None | Register managed plan interest |
| `GET` | `/api/admin/stats` | Admin JWT | Platform statistics |
| `GET` | `/api/admin/users` | Admin JWT | All user profiles |
| `GET` | `/api/admin/properties` | Admin JWT | All properties |
| `GET` | `/api/admin/feedback` | Admin JWT | All feedback |

---

## Frontend Architecture

### Routing

Uses **Wouter** (lightweight alternative to React Router). Routes defined in `artifacts/trustkeyper/src/App.tsx`.

Route guards are implemented via layout components:
- `OwnerLayout` — requires active session with `role === "owner"`
- `BrokerLayout` — requires active session with `role === "broker"`
- `AdminLayout` — requires admin session
- Unauthenticated routes → redirect to `/login` with `tk_pending_role` set

### Data flow

```
User action
    ↓
Write to localStorage immediately (optimistic)
    ↓
Queue cloud sync (queueCloudSync)
    ↓
PUT /api/sync/accounts/:phone/:role/:dataKey
    ↓
Postgres upsert
```

On login, data is pulled from cloud and merged with local storage.

### Cloud sync keys

These keys are included in the bulk sync push on signup/login:

```
profile, properties, tenants, agreements, agreement_draft, onboarding_data, add_property_data
```

These sync on write but are NOT in bulk push:
```
owner_tenant_invites, owner_property_maintenance, owner_property_documents, owner_tenant_inquiries
```

**Known gap:** The second group can be lost on new device login. This should be added to the bulk sync list.

---

## Storage Backends

The sync store supports multiple backends, selected by environment:

| Backend | When used | Notes |
|---|---|---|
| PGLite | `DATABASE_URL=local` | Embedded Postgres, stores in `.data/pglite`. No Docker needed. |
| Docker Postgres | `DATABASE_URL=postgresql://...` | Full Postgres for local dev |
| Supabase Postgres | Production / staging | Direct `pg` connection via `DATABASE_URL` |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` set | JSON file storage, fallback |
| Mock/in-memory | `USE_MOCK_DB=1` or no DB config | Resets on cold start — Vercel prototype only |

---

## Environments

| Environment | Branch | Supabase Project | Database | URL |
|---|---|---|---|---|
| Production | `main` | `trustkeyper-prod` | Supabase Postgres (prod) | app.trustkeyper.com |
| Staging | `staging` | `trustkeyper-staging` | Supabase Postgres (staging) | staging.app.trustkeyper.com |
| Local dev | any | Either (or local PGLite) | PGLite or Docker | localhost:5173 |

Staging is a full mirror of production with separate data. All changes are tested on staging before production release.

---

## Known Technical Debt

These are documented issues to address in future sprints:

| Issue | Priority | Notes |
|---|---|---|
| `owner_tenant_invites` not in bulk sync | High | Can cause data loss on new device login |
| `tenant_invitations` API not wired to frontend | High | Backend is complete, SPA still uses localStorage + WhatsApp only |
| Public share link reads from viewer's localStorage | High | Broken for actual recipients |
| No Zod validation on environment variables | Medium | App can fail at runtime instead of startup |
| OpenAPI spec only documents `/healthz` | Medium | Rest of API is undocumented |
| `owner_tenant_invites` and production invites duplicated | Medium | Two systems for the same concept |
| `OwnerTenantProfile` is hardcoded mock data | Medium | "Karthik M." placeholder |
| `OwnerFinances` redirects to dashboard | Low | Stub, needs real implementation |
| `BrokerCommission` shows static zeros | Low | Stub, needs real implementation |
| No rate limiting on feedback endpoint | Low | Placeholder in code, needs Redis/Upstash |

---

## CI/CD Pipeline

```
Push to any branch / Open PR
         ↓
GitHub Actions (ci.yml)
  1. pnpm install --frozen-lockfile
  2. pnpm run typecheck:deploy
  3. pnpm run build:deploy
  4. Assert build artifacts exist
         ↓
     All pass?
    ↙        ↘
  No          Yes
  Block       PR can be merged (to staging)
              ↓
         Merge to staging
              ↓
         Vercel deploys to staging.app.trustkeyper.com
              ↓
         Manual E2E testing
              ↓
         PR: staging → main
              ↓
         Vercel deploys to app.trustkeyper.com
```

**Planned additions to CI:**
- `pnpm run test:run` (Vitest) — once test suite is established
- Playwright E2E against staging — before staging → main promotion

---

## Design System

Built on Tailwind 4 with shadcn/ui components. All UI components live in:
- `artifacts/trustkeyper/src/components/ui/` — base components
- `artifacts/trustkeyper/src/components/` — feature components

**Rules:**
- No hardcoded colours or spacing inline
- All design tokens defined once in Tailwind config
- Every interactive element has a visible focus state
- Every async operation has loading, success, and error states
- Responsive: tested at 375px, 768px, 1280px minimum
