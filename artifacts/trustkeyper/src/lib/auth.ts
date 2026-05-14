import { getActiveSession as readTkActiveSession, setSessionItem, storageKey } from "./storageKeys";

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
export function signUpSuccess(phone: string, role: Role, profileData: object): void {
  const key = storageKey(phone, role, "profile");
  const merged = { ...emptyProfileRecord(), ...(profileData as Record<string, string>) };
  localStorage.setItem(key, JSON.stringify(merged));
  setActiveSession(phone, role);
  if (merged.name) setSessionItem("name", merged.name);
  if (merged.firm) setSessionItem("firm", merged.firm);
  if (merged.phone) setSessionItem("phone", merged.phone);
}

/** Called after OTP success on LOGIN */
export function loginSuccess(phone: string, role: Role): boolean {
  const key = storageKey(phone, role, "profile");
  const exists = localStorage.getItem(key) !== null;
  if (exists) {
    setActiveSession(phone, role);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const p = JSON.parse(raw) as Record<string, string>;
        if (typeof p.name === "string") setSessionItem("name", p.name);
        if (typeof p.firm === "string") setSessionItem("firm", p.firm);
        if (typeof p.phone === "string") setSessionItem("phone", p.phone);
      }
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}

/** Set the active session */
export function setActiveSession(phone: string, role: Role): void {
  sessionStorage.setItem("tk_active_phone", phone);
  sessionStorage.setItem("tk_active_role", role);
}

/** Get active session (typed role) */
export function getActiveSession(): { phone: string; role: Role } | null {
  const s = readTkActiveSession();
  if (!s) return null;
  const role = s.role as Role;
  if (!ALL_ROLES.includes(role)) return null;
  return { phone: s.phone, role };
}

/** Check if a profile exists for a given phone + role */
export function profileExists(phone: string, role: Role): boolean {
  return localStorage.getItem(storageKey(phone, role, "profile")) !== null;
}

/** All OTHER roles this phone number has accounts for */
export function getOtherAccounts(phone: string, currentRole: Role): Role[] {
  return ALL_ROLES.filter((r) => r !== currentRole && profileExists(phone, r));
}

/** Switch to a different role (same phone) */
export function switchRole(role: Role): void {
  const phone = sessionStorage.getItem("tk_active_phone");
  if (!phone) return;
  sessionStorage.setItem("tk_active_role", role);
  try {
    const key = storageKey(phone, role, "profile");
    const raw = localStorage.getItem(key);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, string>;
      if (typeof p.name === "string") setSessionItem("name", p.name);
      if (typeof p.firm === "string") setSessionItem("firm", p.firm);
      if (typeof p.phone === "string") setSessionItem("phone", p.phone);
    }
  } catch {
    /* ignore */
  }
}

/** Log out (clear session only — data stays in localStorage) */
export function logout(): void {
  sessionStorage.removeItem("tk_active_phone");
  sessionStorage.removeItem("tk_active_role");
  sessionStorage.removeItem("tk_pending_role");
}
