import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const dataDir = process.env.PGLITE_DATA_DIR
  ? path.isAbsolute(process.env.PGLITE_DATA_DIR)
    ? process.env.PGLITE_DATA_DIR
    : path.resolve(repoRoot, process.env.PGLITE_DATA_DIR)
  : path.join(repoRoot, ".data", "pglite");

const DDL = `
CREATE TABLE IF NOT EXISTS "user_data" (
  "phone" text NOT NULL,
  "role" text NOT NULL,
  "data_key" text NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_data_phone_role_data_key_pk" PRIMARY KEY("phone","role","data_key")
);
ALTER TABLE "user_data" ENABLE ROW LEVEL SECURITY;
`;

const client = new PGlite(dataDir);
await client.exec(DDL);
await client.close();
console.log(`Local test database ready at ${dataDir}`);
