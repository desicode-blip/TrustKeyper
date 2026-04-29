export interface Tenant {
  id: string;
  name: string;
  phone: string;
  type?: "Family" | "Bachelor";
  food?: "Veg" | "Non-Veg";
  status: "Onboarding Pending" | "Onboarded";
  invitationSent: boolean;
  createdAt: number;
}

const KEY = "broker_tenants";

export function getTenants(): Tenant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Tenant[]) : [];
  } catch {
    return [];
  }
}

export function addTenant(
  t: Omit<Tenant, "id" | "createdAt" | "status" | "invitationSent"> & {
    invitationSent?: boolean;
  },
): Tenant {
  const { invitationSent = false, ...rest } = t;
  const tenant: Tenant = {
    ...rest,
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: "Onboarding Pending",
    invitationSent,
  };
  const list = getTenants();
  list.unshift(tenant);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  return tenant;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
