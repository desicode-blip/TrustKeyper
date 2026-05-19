import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const embeddedPath = path.resolve(configDir, "../../.data/pglite");
const dockerPostgres =
  "postgresql://trustkeyper:trustkeyper@localhost:5432/trustkeyper_dev";

function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw || raw === "local" || raw === "pglite") {
    return process.env.PGLITE_DATA_DIR ?? embeddedPath;
  }
  return raw;
}

export default defineConfig({
  schema: [path.join(configDir, "./src/schema/userData.ts")],
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDbUrl(),
  },
});
