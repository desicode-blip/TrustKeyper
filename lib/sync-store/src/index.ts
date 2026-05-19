import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";
import {
  queryAccountData,
  queryRolesWithProfileForPhone,
  upsertAccountDataKey,
} from "@workspace/db";
import { getDb } from "@workspace/db/client";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "user_data.json");
const BLOB_PATHNAME = "trustkeyper-user-data.json";

type FileStore = Record<string, Record<string, string>>;

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

function accountId(phone: string, role: string): string {
  return `${normalizePhone(phone)}:${role}`;
}

async function readBlobStore(): Promise<FileStore | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  try {
    const meta = await head(BLOB_PATHNAME, { token });
    const res = await fetch(meta.url);
    if (res.status < 200 || res.status >= 300) return {};
    return (await res.json()) as FileStore;
  } catch {
    return {};
  }
}

async function writeBlobStore(store: FileStore): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  await put(BLOB_PATHNAME, JSON.stringify(store), {
    access: "public",
    token,
    addRandomSuffix: false,
  });
}

async function readFileStore(): Promise<FileStore> {
  const blob = await readBlobStore();
  if (blob !== null) return blob;

  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as FileStore;
  } catch {
    return {};
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeBlobStore(store);
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(store), "utf8");
}

export async function getAccountData(
  phone: string,
  role: string,
): Promise<Record<string, string>> {
  const p = normalizePhone(phone);
  if (getDb()) {
    return queryAccountData(p, role);
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
  if (getDb()) {
    await upsertAccountDataKey(p, role, dataKey, value);
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
  if (getDb()) {
    return queryRolesWithProfileForPhone(p);
  }

  const store = await readFileStore();
  const roles: string[] = [];
  for (const [key, data] of Object.entries(store)) {
    if (!key.startsWith(`${p}:`)) continue;
    if (data.profile) roles.push(key.split(":")[1] ?? "");
  }
  return roles.filter(Boolean);
}
