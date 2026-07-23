import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizePhoneDigits } from "@workspace/auth-server/phone";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSessionIdentity,
  saveSessionTokens,
} from "./secureSession";

function requireEnv(name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Copy apps/mobile/.env.example to .env`);
  }
  return value;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) {
    return client;
  }
  client = createClient(requireEnv("EXPO_PUBLIC_SUPABASE_URL"), requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}

/** Sends SMS OTP via Supabase Auth (Twilio Verify is configured in Supabase). */
export async function sendPhoneOtp(phoneDigits: string): Promise<string | null> {
  const phone = normalizePhoneDigits(phoneDigits);
  const { error } = await getSupabase().auth.signInWithOtp({
    phone: `+91${phone}`,
  });
  return error?.message ?? null;
}

/** Verifies SMS OTP and persists tokens in SecureStore (never AsyncStorage). */
export async function verifyPhoneOtp(
  phoneDigits: string,
  token: string,
): Promise<{ error: string | null; accessToken: string | null }> {
  const phone = normalizePhoneDigits(phoneDigits);
  const { data, error } = await getSupabase().auth.verifyOtp({
    phone: `+91${phone}`,
    token,
    type: "sms",
  });

  const accessToken = data.session?.access_token ?? null;
  if (accessToken) {
    await saveSessionTokens({
      accessToken,
      refreshToken: data.session?.refresh_token ?? null,
    });
    await saveSessionIdentity({ phone });
  }

  return {
    error: error?.message ?? null,
    accessToken,
  };
}

export async function signOut(): Promise<void> {
  try {
    await getSupabase().auth.signOut();
  } finally {
    await clearSession();
  }
}

export async function restoreSupabaseSession(): Promise<boolean> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  if (!accessToken || !refreshToken) {
    return Boolean(accessToken);
  }
  const { error } = await getSupabase().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return !error;
}
