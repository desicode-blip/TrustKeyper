import {
  clearActiveSessionBackup,
  persistActiveSessionBackup,
} from "./initAppStorage";
import { supabase } from "./supabaseClient";
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

export type Role = "broker" | "owner" | "tenant" | "manager" | "admin";

export const ALL_ROLES: Role[] = ["broker", "owner", "tenant", "manager", "admin"];

/** Roles offered on signup / login (manager hidden for now). */
export const AUTH_ENTRY_ROLES = ["owner", "broker", "tenant"] as const;
export type AuthEntryRole = (typeof AUTH_ENTRY_ROLES)[number];

export function isAuthEntryRole(role: string): role is AuthEntryRole {
  return (AUTH_ENTRY_ROLES as readonly string[]).includes(role);
}

export function readAuthPendingRole(): AuthEntryRole | null {
  if (typeof window === "undefined") return null;
  const pending = sessionStorage.getItem("tk_pending_role");
  return pending && isAuthEntryRole(pending) ? pending : null;
}

export function setAuthPendingRole(role: AuthEntryRole): void {
  sessionStorage.setItem("tk_pending_role", role);
}

export function clearInvalidAuthPendingRole(): void {
  const pending = sessionStorage.getItem("tk_pending_role");
  if (pending && !isAuthEntryRole(pending)) {
    sessionStorage.removeItem("tk_pending_role");
  }
}

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
  propertyCount: "",
  propertyIntent: "",
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
    admin: "/admin/dashboard",
  };
  return routes[role];
}

/** Called after OTP success on SIGN UP */
export async function signUpSuccess(
  phone: string,
  role: Role,
  profileData: object,
  accessToken?: string | null,
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
  let profileOk = await pushAccountKeyToCloud(
    p,
    role,
    "profile",
    profileJson,
    accessToken ?? undefined,
  );
  if (!profileOk) {
    await new Promise((r) => setTimeout(r, 500));
    profileOk = await pushAccountKeyToCloud(
      p,
      role,
      "profile",
      profileJson,
      accessToken ?? undefined,
    );
  }
  if (!profileOk) {
    throw new Error(
      "Could not save your account to the cloud. Check your connection and try again.",
    );
  }
  const synced = await pushLocalKeysToCloud(p, role, accessToken ?? undefined);
  if (!synced) {
    await pushAccountKeyToCloud(
      p,
      role,
      "profile",
      profileJson,
      accessToken ?? undefined,
    );
  }
  const verified = await cloudAccountExists(p, role);
  if (!verified) {
    throw new Error(
      "Account could not be verified on the server. Try again in a moment.",
    );
  }
}

/** Called after OTP success on LOGIN — loads account data from server when on a new device. */
export async function loginSuccess(phone: string, role: Role): Promise<boolean> {
  const p = normalizePhoneDigits(phone);
  const cloudExists = await cloudAccountExists(p, role);

  if (cloudExists) {
    setActiveSession(p, role);
    let pulled = await pullAccountFromCloud(p, role);
    if (!pulled) {
      await new Promise((r) => setTimeout(r, 400));
      pulled = await pullAccountFromCloud(p, role);
    }
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

/** localStorage keys used when the user opts in to "Remember me" / stay logged in. */
export const REMEMBERED_SESSION_PHONE_KEY = "tk_active_phone";
export const REMEMBERED_SESSION_ROLE_KEY = "tk_active_role";

/** Set the active session */
export function setActiveSession(phone: string, role: Role): void {
  const p = normalizePhoneDigits(phone);
  sessionStorage.setItem("tk_active_phone", p);
  sessionStorage.setItem("tk_active_role", role);
  persistActiveSessionBackup(p, role);
}

/**
 * Persists the active session to localStorage so it survives tab/browser restarts.
 * @param phone - Normalised 10-digit phone.
 * @param role - Active role for this session.
 */
export function persistSessionToLocalStorage(phone: string, role: Role): void {
  const p = normalizePhoneDigits(phone);
  localStorage.setItem(REMEMBERED_SESSION_PHONE_KEY, p);
  localStorage.setItem(REMEMBERED_SESSION_ROLE_KEY, role);
}

/**
 * Removes remember-me session keys from localStorage.
 */
export function clearRememberedSessionFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REMEMBERED_SESSION_PHONE_KEY);
  localStorage.removeItem(REMEMBERED_SESSION_ROLE_KEY);
}

/**
 * Restores session from sessionStorage or localStorage (remember-me) into the active session.
 * @returns Restored phone and role when valid; null when no session is available.
 */
export function restoreRememberedSessionFromLocalStorage(): { phone: string; role: Role } | null {
  if (typeof window === "undefined") return null;

  const existingPhone = sessionStorage.getItem("tk_active_phone");
  const existingRole = sessionStorage.getItem("tk_active_role") as Role | null;
  if (existingPhone && existingRole && ALL_ROLES.includes(existingRole)) {
    const p = normalizePhoneDigits(existingPhone);
    if (p.length === 10) return { phone: p, role: existingRole };
  }

  const phone = localStorage.getItem(REMEMBERED_SESSION_PHONE_KEY);
  const role = localStorage.getItem(REMEMBERED_SESSION_ROLE_KEY) as Role | null;
  if (!phone || !role || !ALL_ROLES.includes(role)) return null;

  const p = normalizePhoneDigits(phone);
  if (p.length !== 10) return null;

  sessionStorage.setItem("tk_active_phone", p);
  sessionStorage.setItem("tk_active_role", role);
  persistActiveSessionBackup(p, role);
  return { phone: p, role };
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
    case "admin":
      return "Admin";
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
  clearRememberedSessionFromLocalStorage();
  void supabase.auth.signOut();
}
