/**
 * Admin API client — typed fetch wrappers for /api/admin/* routes
 */
import { API_BASE } from "@/lib/apiBase";
import { getSupabaseAccessToken } from "./syncSession";

/** Platform-wide statistics returned by GET /api/admin/stats. */
export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalBrokers: number;
  totalProperties: number;
  newUsersThisWeek: number;
}

/** A user profile returned by GET /api/admin/users. */
export interface AdminUser {
  phone: string;
  role: string;
  name: string;
  updatedAt: string;
}

/** A property record returned by GET /api/admin/properties. */
export interface AdminProperty {
  ownerPhone: string;
  address: string;
  type: string;
  status: string;
  updatedAt: string;
}

/** A feedback submission returned by GET /api/admin/feedback. */
export interface AdminFeedback {
  id: string;
  message: string;
  rating: number;
  category: string;
  userPhone: string | null;
  userRole: string | null;
  pageUrl: string | null;
  createdAt: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
}

interface AdminPropertiesResponse {
  properties: AdminProperty[];
}

interface AdminFeedbackResponse {
  feedback: AdminFeedback[];
}

interface ApiErrorBody {
  error?: string;
  detail?: string;
}

/**
 * Builds authorized headers for admin API requests.
 * @throws When no Supabase session token is available.
 */
async function adminAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSupabaseAccessToken();
  if (!token) {
    throw new Error("Not authenticated. Please sign in to the admin portal again.");
  }
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Parses a failed admin API response into a descriptive Error.
 * @param res - Non-OK fetch response.
 */
async function throwAdminApiError(res: Response): Promise<never> {
  let message = `Admin API request failed (${res.status})`;
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (body.error) {
      message = body.detail ? `${body.error}: ${body.detail}` : body.error;
    }
  } catch {
    /* ignore JSON parse errors */
  }
  throw new Error(message);
}

/**
 * Performs an authenticated GET to an admin API route.
 * @param path - Path segment after `/api/admin/` (e.g. `stats`).
 */
async function adminGet<T>(path: string): Promise<T> {
  const headers = await adminAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/${path}`, { headers });
  if (!res.ok) await throwAdminApiError(res);
  return (await res.json()) as T;
}

/**
 * Fetches aggregate platform statistics for the admin dashboard.
 * @returns Stats including user counts and new signups this week.
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  return adminGet<AdminStats>("stats");
}

/**
 * Fetches all registered user profiles across the platform.
 * @returns Array of user records with phone, role, name, and updatedAt.
 */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const json = await adminGet<AdminUsersResponse>("users");
  return json.users;
}

/**
 * Fetches all properties stored across owner and broker accounts.
 * @returns Flattened property records with owner phone and metadata.
 */
export async function fetchAdminProperties(): Promise<AdminProperty[]> {
  const json = await adminGet<AdminPropertiesResponse>("properties");
  return json.properties;
}

/**
 * Fetches all user feedback submissions for the admin feedback view.
 * @returns Array of feedback records ordered by newest first.
 */
export async function fetchAdminFeedback(): Promise<AdminFeedback[]> {
  const json = await adminGet<AdminFeedbackResponse>("feedback");
  return json.feedback;
}
