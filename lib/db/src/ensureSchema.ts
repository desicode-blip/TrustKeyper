/** Idempotent schema for local PGLite / manual bootstrap when drizzle-kit push is unavailable. */
export const USER_DATA_DDL = `
CREATE TABLE IF NOT EXISTS "user_data" (
  "phone" text NOT NULL,
  "role" text NOT NULL,
  "data_key" text NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_data_phone_role_data_key_pk" PRIMARY KEY("phone","role","data_key")
);
`;

/** Defense in depth when the table is reachable via Supabase Data API or a limited DB role. */
export const USER_DATA_RLS_DDL = `
ALTER TABLE "user_data" ENABLE ROW LEVEL SECURITY;
`;

export async function ensureUserDataTable(exec: (sql: string) => Promise<unknown>): Promise<void> {
  await exec(USER_DATA_DDL);
  await exec(USER_DATA_RLS_DDL);
}
