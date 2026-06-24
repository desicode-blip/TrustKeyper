import type { Role } from "./auth";

type SessionReader = () => { phone: string; role: Role } | null;
type LoginFn = (phone: string, role: "tenant") => Promise<boolean>;

export async function ensureTenantDashboardSession(
  phone: string,
  getSession: SessionReader,
  login: LoginFn,
): Promise<boolean> {
  const digits = phone.replace(/\D/g, "").slice(-10);
  const session = getSession();

  if (session?.role === "tenant" && session.phone === digits) {
    return true;
  }

  return login(digits, "tenant");
}
