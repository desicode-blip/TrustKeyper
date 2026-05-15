/**
 * Wipes all TrustKeyper cloud account data (Postgres user_data + file fallback).
 * Run from repo root: node scripts/reset-all-account-data.mjs
 * Requires DATABASE_URL for Postgres; always clears file-store paths used by the API.
 */
import { createRequire } from "node:module";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const apiServerDir = path.join(repoRoot, "artifacts", "api-server");
const requireFromApi = createRequire(path.join(apiServerDir, "package.json"));

const FILE_PATHS = [
  path.join(process.cwd(), ".data", "user_data.json"),
  path.join(repoRoot, "artifacts", "api-server", ".data", "user_data.json"),
  path.join(repoRoot, ".data", "user_data.json"),
];

async function clearFileStores() {
  for (const filePath of FILE_PATHS) {
    try {
      await unlink(filePath);
      console.log(`Deleted ${filePath}`);
    } catch {
      try {
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, "{}", "utf8");
        console.log(`Reset ${filePath} to {}`);
      } catch (err) {
        console.warn(`Skip ${filePath}:`, err.message);
      }
    }
  }
}

async function clearPostgres() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("DATABASE_URL not set — skipped Postgres wipe");
    return;
  }
  const pg = requireFromApi("pg");
  const pool = new pg.Pool({ connectionString: url });
  try {
    await pool.query("DELETE FROM user_data");
    console.log("Postgres: deleted all rows from user_data");
  } finally {
    await pool.end();
  }
}

await clearFileStores();
await clearPostgres();
console.log("Done. Clear each browser: DevTools → Application → Clear site data, or run clearAllLocalTrustKeyperData() in the console.");
