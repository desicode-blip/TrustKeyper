import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { getDb } from "@workspace/db/client";
import { userDataTable } from "@workspace/db/schema/userData";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "user_data.json");

type FileStore = Record<string, Record<string, string>>;

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

function accountId(phone: string, role: string): string {
  return `${normalizePhone(phone)}:${role}`;
}

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as FileStore;
  } catch {
    return {};
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(store), "utf8");
}

export async function getAccountData(
  phone: string,
  role: string,
): Promise<Record<string, string>> {
  const p = normalizePhone(phone);
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(userDataTable)
      .where(and(eq(userDataTable.phone, p), eq(userDataTable.role, role)));
    const out: Record<string, string> = {};
    for (const row of rows) out[row.dataKey] = row.value;
    return out;
  }

  const store = await readFileStore();
  return store[accountId(p, role)] ?? {};
}

export async function accountHasProfile(phone: string, role: string): Promise<boolean> {
  const data = await getAccountData(phone, role);
  return typeof data.profile === "string" && data.profile.length > 0;
}

export async function setAccountDataKey(
  phone: string,
  role: string,
  dataKey: string,
  value: string,
): Promise<void> {
  const p = normalizePhone(phone);
  const db = getDb();
  if (db) {
    await db
      .insert(userDataTable)
      .values({ phone: p, role, dataKey, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [userDataTable.phone, userDataTable.role, userDataTable.dataKey],
        set: { value, updatedAt: new Date() },
      });
    return;
  }

  const store = await readFileStore();
  const id = accountId(p, role);
  if (!store[id]) store[id] = {};
  store[id][dataKey] = value;
  await writeFileStore(store);
}

export async function setAccountDataBulk(
  phone: string,
  role: string,
  entries: Record<string, string>,
): Promise<void> {
  for (const [dataKey, value] of Object.entries(entries)) {
    if (typeof value === "string") await setAccountDataKey(phone, role, dataKey, value);
  }
}

export async function getRolesForPhone(phone: string): Promise<string[]> {
  const p = normalizePhone(phone);
  const db = getDb();
  if (db) {
    const rows = await db
      .select({ role: userDataTable.role, dataKey: userDataTable.dataKey })
      .from(userDataTable)
      .where(and(eq(userDataTable.phone, p), eq(userDataTable.dataKey, "profile")));
    return [...new Set(rows.map((r: { role: string }) => r.role))];
  }

  const store = await readFileStore();
  const roles: string[] = [];
  for (const [key, data] of Object.entries(store)) {
    if (!key.startsWith(`${p}:`)) continue;
    if (data.profile) roles.push(key.split(":")[1] ?? "");
  }
  return roles.filter(Boolean);
}
