import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { restoreSupabaseSession } from "@/lib/auth/phoneOtp";
import { loadStoredSession } from "@/lib/auth/secureSession";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadStoredSession();
      if (stored?.accessToken) {
        await restoreSupabaseSession();
        if (!cancelled) {
          setHasSession(true);
        }
      }
      if (!cancelled) {
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Loading</Text>
      </View>
    );
  }

  if (hasSession) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/splash" />;
}
