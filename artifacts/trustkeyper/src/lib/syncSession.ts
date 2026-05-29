import { supabase } from "@/lib/supabaseClient";

/** Supabase access token after OTP verify — sent on protected sync API calls. */
export async function getSupabaseAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function syncAuthHeaders(
  contentType?: string,
): Promise<Record<string, string> | null> {
  const token = await getSupabaseAccessToken();
  if (!token) return null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}
