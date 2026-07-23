import type { BrokerProfile, BrokerProfilePatch } from "@workspace/api-schemas";
import { getAccessToken } from "../auth/secureSession";

function apiBaseUrl(): string {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) {
    throw new Error("Missing EXPO_PUBLIC_API_URL. Copy apps/mobile/.env.example to .env");
  }
  return base.replace(/\/$/, "");
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  searchParams?: Record<string, string | undefined>;
};

/**
 * Typed fetch client for existing Vercel `/api/*` routes.
 * Auth uses Bearer access token from SecureStore (same JWT as web after Supabase OTP).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    const token = await getAccessToken();
    if (!token) {
      throw new ApiError(401, "Not authenticated", null);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed &&
      typeof (parsed as { error: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : `Request failed (${response.status})`;
    throw new ApiError(response.status, message, parsed);
  }

  return parsed as T;
}

/** Public discovery — no JWT (same as web). */
export function getAccountRoles(phone: string) {
  return apiRequest<{ phone: string; roles: string[] }>(`/sync/accounts/${phone}/roles`, {
    auth: false,
  });
}

export function getAccountSummaries(phone: string) {
  return apiRequest<{
    phone: string;
    accounts: Array<{ role: string; displayName: string }>;
  }>(`/sync/accounts/${phone}/summaries`, { auth: false });
}

export function getAccountExists(phone: string, role: string) {
  return apiRequest<{ phone: string; role: string; exists: boolean }>(
    `/sync/accounts/${phone}/${role}/exists`,
    { auth: false },
  );
}

/** Protected sync — Bearer JWT required. */
export function getAccountData(phone: string, role: string) {
  return apiRequest<{ phone: string; role: string; data: Record<string, string> }>(
    `/sync/accounts/${phone}/${role}`,
  );
}

export function putAccountData(phone: string, role: string, entries: Record<string, string>) {
  return apiRequest<{ ok: true }>(`/sync/accounts/${phone}/${role}`, {
    method: "PUT",
    body: { entries },
  });
}

export function putAccountKey(phone: string, role: string, dataKey: string, value: string) {
  return apiRequest<{ ok: true }>(`/sync/accounts/${phone}/${role}/${dataKey}`, {
    method: "PUT",
    body: { value },
  });
}

/** Broker profile — JWT scoped to auth user. 404 → null (no row yet). */
export async function getBrokerProfile(): Promise<BrokerProfile | null> {
  try {
    return await apiRequest<BrokerProfile>("/v1/broker/profile");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export function patchBrokerProfile(body: BrokerProfilePatch) {
  return apiRequest<BrokerProfile>("/v1/broker/profile", {
    method: "PATCH",
    body,
  });
}
