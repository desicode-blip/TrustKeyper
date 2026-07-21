import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { redirectToMarketingAuth } from "@/lib/marketingHandoff";

/** Legacy invite URLs used `/tenant/onboard/:token` — redirect to the canonical route. */
export default function TenantOnboardLegacyRedirect() {
  const [, params] = useRoute("/tenant/onboard/:token");
  const [, setLocation] = useLocation();
  const token = params?.token ?? "";

  useEffect(() => {
    if (!token) {
      redirectToMarketingAuth("signup");
      return;
    }
    setLocation(`/onboard/tenant/${token}`, { replace: true });
  }, [token, setLocation]);

  return null;
}
