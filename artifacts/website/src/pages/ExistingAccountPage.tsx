import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { MarketingAuthContinueButton } from "@/components/auth/MarketingAuthContinueButton";
import { MarketingAuthPageLayout } from "@/components/auth/MarketingAuthPageLayout";
import {
  MarketingAuthWelcomeBack,
  type WelcomeBackSelection,
} from "@/components/auth/MarketingAuthWelcomeBack";
import { fetchMarketingRolesForPhone } from "@/lib/marketingAuthLookup";
import {
  buildMarketingExistingAccountUrl,
  buildMarketingNewUserSignupUrl,
  buildMarketingSignupUrl,
} from "@/lib/marketingAppRoutes";
import {
  clearMarketingAuthHandoff,
  readMarketingAuthHandoff,
} from "@/lib/marketingAuthHandoff";
import {
  marketingRolesMissingFrom,
  toMarketingAccountSummaries,
  type MarketingAccountSummary,
  type MarketingAuthRole,
} from "@/lib/marketingAuthRoles";
import { normalizeMarketingPhoneDigits } from "@/lib/marketingAuthOtp";

export interface ExistingAccountPageProps {
  mock?: boolean;
}

const MOCK_ACCOUNTS: MarketingAccountSummary[] = [
  { role: "owner", displayName: "Meena" },
];

const MOCK_MISSING_ROLES: MarketingAuthRole[] = ["tenant", "broker"];

const MOCK_PHONE = "6369856040";

export function ExistingAccountPage({ mock = false }: ExistingAccountPageProps) {
  const search = useSearch();
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(!mock);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<MarketingAccountSummary[]>(mock ? MOCK_ACCOUNTS : []);
  const [missingRoles, setMissingRoles] = useState<MarketingAuthRole[]>(
    mock ? MOCK_MISSING_ROLES : [],
  );
  const [selection, setSelection] = useState<WelcomeBackSelection | null>(
    mock ? { kind: "existing", role: "owner" } : null,
  );
  const [continuing, setContinuing] = useState(false);

  const query = useMemo(() => new URLSearchParams(search), [search]);

  const phoneDigits = mock
    ? MOCK_PHONE
    : normalizeMarketingPhoneDigits(query.get("phone") ?? readMarketingAuthHandoff()?.phone ?? "");

  const rememberMe = mock
    ? false
    : query.get("remember") === "1" || readMarketingAuthHandoff()?.rememberMe === true;

  useEffect(() => {
    if (mock) return;

    const handoff = readMarketingAuthHandoff();
    if (!handoff && phoneDigits.length !== 10) {
      setError("Your session expired. Please log in again.");
      setLoading(false);
      return;
    }

    if (phoneDigits.length !== 10) {
      setError("Invalid phone number.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const roles = await fetchMarketingRolesForPhone(phoneDigits);
        if (cancelled) return;
        if (roles.length === 0) {
          clearMarketingAuthHandoff();
          window.location.assign(buildMarketingNewUserSignupUrl(phoneDigits, rememberMe));
          return;
        }

        const summaries = toMarketingAccountSummaries(roles);
        const missing = marketingRolesMissingFrom(roles);
        setAccounts(summaries);
        setMissingRoles(missing);
        setSelection(
          summaries.length === 1 ? { kind: "existing", role: summaries[0].role } : null,
        );
      } catch {
        if (!cancelled) setError("Could not load your accounts. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mock, phoneDigits, rememberMe]);

  const finish = () => {
    if (!selection) return;
    setContinuing(true);
    const params = { phone: phoneDigits, role: selection.role, rememberMe };
    clearMarketingAuthHandoff();
    if (selection.kind === "existing") {
      window.location.assign(buildMarketingExistingAccountUrl(params));
      return;
    }
    window.location.assign(buildMarketingSignupUrl(params));
  };

  if (loading) {
    return (
      <MarketingAuthPageLayout>
        <p className="text-center text-sm text-marketing-muted">Loading your accounts...</p>
      </MarketingAuthPageLayout>
    );
  }

  if (error) {
    return (
      <MarketingAuthPageLayout>
        <p className="text-center text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mt-6 w-full rounded-lg bg-marketing-blue py-3.5 text-base font-semibold text-white"
        >
          Back to home
        </button>
      </MarketingAuthPageLayout>
    );
  }

  return (
    <MarketingAuthPageLayout>
      <MarketingAuthWelcomeBack
        accounts={accounts}
        missingRoles={missingRoles}
        selection={selection}
        onSelect={setSelection}
      />

      <MarketingAuthContinueButton
        disabled={!selection}
        loading={continuing}
        onClick={finish}
      />
    </MarketingAuthPageLayout>
  );
}
