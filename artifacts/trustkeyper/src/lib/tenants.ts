export type TenantWho = "Family" | "Bachelor";
export type Identify = "Male" | "Female";
export type Food = "Veg" | "Non-Veg";
export type PropertyType =
  | "Apartment"
  | "House"
  | "Studio"
  | "Villa"
  | "PG/Hostel"
  | "Other";
export type Sharing = "Single" | "Double" | "Triple" | "Entire Property";
export type Roommate = "Male" | "Female" | "Anyone";

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  occupancyFrom?: string;
  who?: TenantWho;
  identify?: Identify[];
  food?: Food;
  city?: string;
  localities?: string[];
  propertyType?: PropertyType;
  sharing?: Sharing;
  roommate?: Roommate[];
  status: "Onboarding Pending" | "Profile Complete";
  invitationSent: boolean;
  detailsComplete: boolean;
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
  t: Omit<Tenant, "id" | "createdAt" | "status" | "invitationSent" | "detailsComplete"> & {
    invitationSent?: boolean;
    detailsComplete?: boolean;
  },
): Tenant {
  const { invitationSent = false, detailsComplete = false, ...rest } = t;
  const tenant: Tenant = {
    ...rest,
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: detailsComplete ? "Profile Complete" : "Onboarding Pending",
    invitationSent,
    detailsComplete,
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

export const CITY_LOCALITIES: Record<string, string[]> = {
  Hyderabad: [
    "Madhapur",
    "Gachibowli",
    "Hi-Tech City",
    "Kondapur",
    "Banjara Hills",
    "Jubilee Hills",
    "Kukatpally",
    "Begumpet",
  ],
  Bengaluru: [
    "Indiranagar",
    "Koramangala",
    "Whitefield",
    "HSR Layout",
    "Marathahalli",
    "Bellandur",
    "Jayanagar",
    "BTM Layout",
  ],
  Mumbai: [
    "Bandra",
    "Andheri",
    "Powai",
    "Lower Parel",
    "Worli",
    "Juhu",
    "Goregaon",
  ],
  Delhi: [
    "Saket",
    "Dwarka",
    "Rohini",
    "Karol Bagh",
    "Connaught Place",
    "Vasant Kunj",
  ],
  Pune: ["Hinjewadi", "Kothrud", "Baner", "Viman Nagar", "Wakad", "Kharadi"],
  Noida: ["Sector 62", "Sector 18", "Sector 78", "Sector 137", "Sector 50"],
};
