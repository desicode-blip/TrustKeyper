/**
 * Resolves the API base URL for frontend fetch calls.
 * Local dev must include `/api` (e.g. http://localhost:8080/api). When unset, uses
 * same-origin `/api` which Vite proxies to the API server.
 */
export function resolveApiBase(): string {
  const rawEnv = import.meta.env.VITE_API_URL as string | undefined;
  const raw = typeof rawEnv === "string" ? rawEnv.trim().replace(/\/$/, "") : "";
  if (!raw) return "/api";
  if (raw.endsWith("/api")) return raw;
  return `${raw}/api`;
}

export const API_BASE = resolveApiBase();
