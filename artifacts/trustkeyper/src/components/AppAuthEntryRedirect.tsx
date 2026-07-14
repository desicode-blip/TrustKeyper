import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import {
  dashboardRouteFor,
  getActiveSession,
  restoreRememberedSessionFromLocalStorage,
  type Role,
} from "@/lib/auth";
import { redirectToMarketingAuth } from "@/lib/marketingHandoff";
import { resolveTenantPostLoginRoute } from "@/lib/tenantPostLoginRoute";

export interface AppAuthEntryRedirectProps {
  mode: "login" | "signup";
}

function postAuthRoute(role: Role, phone: string): string {
  if (role === "tenant") return resolveTenantPostLoginRoute(phone);
  return dashboardRouteFor(role);
}

/**
 * `/` and `/login` never mount legacy Login/Onboarding screens.
 * Restores an existing session into the dashboard, otherwise sends the user
 * to the marketing auth entry with history.replace (no back-stack pollution).
 */
export function AppAuthEntryRedirect({ mode }: AppAuthEntryRedirectProps) {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"checking" | "redirecting">("checking");

  useEffect(() => {
    const remembered = restoreRememberedSessionFromLocalStorage();
    if (remembered) {
      setLocation(postAuthRoute(remembered.role, remembered.phone), { replace: true });
      return;
    }

    const active = getActiveSession();
    if (active) {
      setLocation(postAuthRoute(active.role, active.phone), { replace: true });
      return;
    }

    setStatus("redirecting");
    redirectToMarketingAuth(mode);
  }, [mode, setLocation]);

  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label={status === "redirecting" ? "Redirecting to TrustKeyper login" : "Checking session"}
    >
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
}
