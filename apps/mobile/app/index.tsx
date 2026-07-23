import type { Href } from "expo-router";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Text } from "react-native";
import { getBrokerProfile } from "@/lib/api/client";
import { restoreSupabaseSession } from "@/lib/auth/phoneOtp";
import { loadStoredSession } from "@/lib/auth/secureSession";
import { routeFromBrokerProfile } from "@/lib/broker/routing";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

type GateState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "ready"; href: Href }
  | { status: "error"; message: string };

export default function Index() {
  const [gate, setGate] = useState<GateState>({ status: "loading" });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setGate({ status: "loading" });
      try {
        const stored = await loadStoredSession();
        if (!stored?.accessToken) {
          if (!cancelled) setGate({ status: "unauthenticated" });
          return;
        }

        await restoreSupabaseSession();
        const profile = await getBrokerProfile();
        if (!cancelled) {
          setGate({ status: "ready", href: routeFromBrokerProfile(profile) });
        }
      } catch (err) {
        if (!cancelled) {
          setGate({
            status: "error",
            message: err instanceof Error ? err.message : "Could not load broker profile",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  if (gate.status === "loading") {
    return (
      <ScreenSafeArea>
        <ActivityIndicator />
        <Text>Checking your profile…</Text>
      </ScreenSafeArea>
    );
  }

  if (gate.status === "error") {
    return (
      <ScreenSafeArea>
        <Text>Could not load onboarding status</Text>
        <Text>{gate.message}</Text>
        <Button title="Retry" onPress={() => setRetryToken((n) => n + 1)} />
      </ScreenSafeArea>
    );
  }

  if (gate.status === "unauthenticated") {
    return <Redirect href="/(auth)/splash" />;
  }

  return <Redirect href={gate.href} />;
}
