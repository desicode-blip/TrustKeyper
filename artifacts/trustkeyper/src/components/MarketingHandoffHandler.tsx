import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import {
  applyMarketingHandoff,
  clearMarketingHandoffFromUrl,
  parseMarketingHandoffFromWindow,
} from "@/lib/marketingHandoff";

type HandoffState = "idle" | "loading" | "error";

export function MarketingHandoffHandler() {
  const [location] = useLocation();
  const [state, setState] = useState<HandoffState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handoff = parseMarketingHandoffFromWindow();
    if (!handoff) {
      setState("idle");
      setError(null);
      return;
    }

    let cancelled = false;
    setState("loading");
    setError(null);

    void (async () => {
      const result = await applyMarketingHandoff(handoff);
      if (cancelled) return;
      if (!result.ok) {
        setState("error");
        setError(result.error);
        return;
      }
      clearMarketingHandoffFromUrl();
      setState("idle");
    })();

    return () => {
      cancelled = true;
    };
  }, [location]);

  if (state === "loading") {
    return (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label="Loading your account"
      >
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (state === "error" && error) {
    return (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-white/90 px-6 backdrop-blur-sm"
        role="alert"
      >
        <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-6 text-center shadow-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
