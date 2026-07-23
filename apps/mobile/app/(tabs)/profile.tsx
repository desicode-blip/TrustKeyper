import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { signOut } from "@/lib/auth/phoneOtp";
import { loadStoredSession, type StoredSession } from "@/lib/auth/secureSession";

export default function ProfileTab() {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadStoredSession();
      if (!cancelled) {
        setSession(stored);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSignOut = async () => {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/(auth)/splash");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View>
      <Text>Profile</Text>
      <Text>Phone: {session?.phone ?? "—"}</Text>
      <Text>Role: {session?.role ?? "—"}</Text>
      {error ? <Text>{error}</Text> : null}
      <Button title={isSigningOut ? "Signing out…" : "Sign out"} onPress={() => void onSignOut()} disabled={isSigningOut} />
    </View>
  );
}
