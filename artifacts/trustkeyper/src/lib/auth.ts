import {
  clearActiveSessionBackup,
  persistActiveSessionBackup,
} from "./initAppStorage";
import {
  cloudAccountExists,
  fetchCloudRolesForPhone,
  pullAccountFromCloud,
  pushAccountKeyToCloud,
  pushLocalKeysToCloud,
} from "./cloudSync";
import { migrateLegacyStorage } from "./storageMigration";
import {
  getActiveSession as readTkActiveSession,
  normalizePhoneDigits,
  setSessionItem,
  storageKey,
} from "./storageKeys";

export type Role = "broker" | "owner" | "tenant" | "manager";

export const ALL_ROLES: Role[] = ["broker", "owner", "tenant", "manager"];

const emptyProfileRecord = (): Record<string, string> => ({
  name: "",
  firm: "",
  phone: "",
  email: "",
  bankHolderName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIFSC: "",
  upiId: "",
  upiQrFileName: "",
});

function applyProfileToSession(phone: string, role: Role): void {
  try {
    const raw = localStorage.getItem(storageKey(phone, role, "profile"));
    if (!raw) return;
    const p = JSON.parse(raw) as Record<string, string>;
    if (typeof p.name === "string") setSessionItem("name", p.name);
    if (typeof p.firm === "string") setSessionItem("firm", p.firm);
    if (typeof p.phone === "string") setSessionItem("phone", p.phone);
  } catch {
    /* ignore */
  }
}

export function dashboardRouteFor(role: Role): string {
  const routes: Record<Role, string> = {
    broker: "/broker/dashboard",
    owner: "/owner/dashboard",
    tenant: "/",
    manager: "/",
  };
  return routes[role];
}

/** Called after OTP success on SIGN UP */
export async function signUpSuccess(
  phone: string,
  role: Role,
  profileData: object,
): Promise<void> {
  const p = normalizePhoneDigits(phone);
  const key = storageKey(p, role, "profile");
  const merged: Record<string, string> = {
    ...emptyProfileRecord(),
    ...(profileData as Record<string, string>),
    phone: p,
  };
  const profileJson = JSON.stringify(merged);
  localStorage.setItem(key, profileJson);
  setActiveSession(p, role);
  migrateLegacyStorage(p, role);
  if (merged.name) setSessionItem("name", merged.name);
  if (merged.firm) setSessionItem("firm", merged.firm);
  if (merged.phone) setSessionItem("phone", merged.phone);
  await pushAccountKeyToCloud(p, role, "profile", profileJson);
  await pushLocalKeysToCloud(p, role);
}

/** Called after OTP success on LOGIN — loads account data from server when on a new device. */
export async function loginSuccess(phone: string, role: Role): Promise<boolean> {
  const p = normalizePhoneDigits(phone);
  const cloudExists = await cloudAccountExists(p, role);

  if (cloudExists) {
    setActiveSession(p, role);
    await pullAccountFromCloud(p, role);
    migrateLegacyStorage(p, role);
    applyProfileToSession(p, role);
    return true;
  }

  const localExists = localStorage.getItem(storageKey(p, role, "profile")) !== null;
  if (localExists) {
    setActiveSession(p, role);
    migrateLegacyStorage(p, role);
    applyProfileToSession(p, role);
    await pushLocalKeysToCloud(p, role);
    return true;
  }

  return false;
}

/** Set the active session */
export function setActiveSession(phone: string, role: Role): void {
  const p = normalizePhoneDigits(phone);
  sessionStorage.setItem("tk_active_phone", p);
  sessionStorage.setItem("tk_active_role", role);
  persistActiveSessionBackup(p, role);
}

/** Get active session (typed role) */
export function getActiveSession(): { phone: string; role: Role } | null {
  const s = readTkActiveSession();
  if (!s) return null;
  const role = s.role as Role;
  if (!ALL_ROLES.includes(role)) return null;
  return { phone: normalizePhoneDigits(s.phone), role };
}

/** Local-only profile check (instant UI). */
export function profileExists(phone: string, role: Role): boolean {
  return localStorage.getItem(storageKey(normalizePhoneDigits(phone), role, "profile")) !== null;
}

/** Local or server profile — use before signup / login. */
export async function profileExistsAsync(phone: string, role: Role): Promise<boolean> {
  const p = normalizePhoneDigits(phone);
  if (profileExists(p, role)) return true;
  return cloudAccountExists(p, role);
}

/** All roles this phone number has signed up for (local; cloud roles merged when session active). */
export function getAccountsForPhone(phone: string): Role[] {
  return ALL_ROLES.filter((r) => profileExists(phone, r));
}

export async function getAccountsForPhoneAsync(phone: string): Promise<Role[]> {
  const p = normalizePhoneDigits(phone);
  const cloudRoles = await fetchCloudRolesForPhone(p);
  const merged = new Set<Role>([...getAccountsForPhone(p), ...cloudRoles]);
  return ALL_ROLES.filter((r) => merged.has(r));
}

/** True when the same phone has more than one role profile */
export function hasMultipleAccounts(phone: string): boolean {
  return getAccountsForPhone(phone).length > 1;
}

/** All OTHER roles this phone number has accounts for */
export function getOtherAccounts(phone: string, currentRole: Role): Role[] {
  return ALL_ROLES.filter((r) => r !== currentRole && profileExists(phone, r));
}

export async function getOtherAccountsAsync(
  phone: string,
  currentRole: Role,
): Promise<Role[]> {
  const accounts = await getAccountsForPhoneAsync(phone);
  return accounts.filter((r) => r !== currentRole);
}

export function roleDisplayLabel(role: Role): string {
  switch (role) {
    case "owner":
      return "Property Owner";
    case "broker":
      return "Broker";
    case "tenant":
      return "Tenant";
    case "manager":
      return "Manager";
    default:
      return role;
  }
}

/** Profile display name for a phone + role, or the role label if unset */
export function getProfileDisplayName(phone: string, role: Role): string {
  try {
    const raw = localStorage.getItem(storageKey(normalizePhoneDigits(phone), role, "profile"));
    if (!raw) return roleDisplayLabel(role);
    const p = JSON.parse(raw) as Record<string, string>;
    const name = typeof p.name === "string" ? p.name.trim() : "";
    return name || roleDisplayLabel(role);
  } catch {
    return roleDisplayLabel(role);
  }
}

/** Switch to a different role (same phone) */
export function switchRole(role: Role): void {
  const phone = sessionStorage.getItem("tk_active_phone");
  if (!phone) return;
  const p = normalizePhoneDigits(phone);
  sessionStorage.setItem("tk_active_role", role);
  persistActiveSessionBackup(p, role);
  migrateLegacyStorage(p, role);
  applyProfileToSession(p, role);
}

export async function switchRoleAsync(role: Role): Promise<void> {
  switchRole(role);
  const phone = sessionStorage.getItem("tk_active_phone");
  if (!phone) return;
  const p = normalizePhoneDigits(phone);
  if (await cloudAccountExists(p, role)) {
    await pullAccountFromCloud(p, role);
    applyProfileToSession(p, role);
  }
}

/** Log out (clear session only — data stays in localStorage and on server) */
export function logout(): void {
  sessionStorage.removeItem("tk_active_phone");
  sessionStorage.removeItem("tk_active_role");
  sessionStorage.removeItem("tk_pending_role");
  clearActiveSessionBackup();
}
