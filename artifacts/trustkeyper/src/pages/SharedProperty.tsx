import React, { useCallback, useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Building2, CheckCircle2, Loader2, X } from "lucide-react";
import { TrustKeyperLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { PropertyPublicCard } from "@/components/tenant/PropertyPublicCard";
import { TenantPropertyVerification } from "@/components/tenant/TenantPropertyVerification";
import { getPropertyTitle, type Property } from "@/lib/properties";
import { createPropertyShareInquiry } from "@/lib/ownerTenants";
import {
  fetchSharedProperty,
  getPropertyShareLabel,
  submitPropertyShareInquiry,
} from "@/lib/publicPropertyShare";
import {
  getTenantShareResponse,
  getTenantShareSession,
  setTenantShareResponse,
  type TenantShareSession,
} from "@/lib/tenantShareSession";

type PagePhase =
  | "loading"
  | "not_found"
  | "unavailable"
  | "verify"
  | "property"
  | "interest_success"
  | "not_interested_thanks";

function isPropertyShareable(property: Property): boolean {
  return property.status === "Active";
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6">
      <Loader2 size={32} className="animate-spin text-primary mb-4" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  );
}

export default function SharedProperty() {
  const [, params] = useRoute("/share/property/:id");
  const propertyId = params?.id ?? "";

  const [phase, setPhase] = useState<PagePhase>("loading");
  const [property, setProperty] = useState<Property | null>(null);
  const [session, setSession] = useState<TenantShareSession | null>(null);
  const [response, setResponse] = useState<ReturnType<typeof getTenantShareResponse>>(null);
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaError, setCtaError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    if (!propertyId) {
      setPhase("not_found");
      return;
    }

    setPhase("loading");
    const found = await fetchSharedProperty(propertyId);

    if (!found) {
      setProperty(null);
      setPhase("not_found");
      return;
    }

    if (!isPropertyShareable(found)) {
      setProperty(found);
      setPhase("unavailable");
      return;
    }

    setProperty(found);
    const savedSession = getTenantShareSession(propertyId);
    const savedResponse = getTenantShareResponse(propertyId);
    setSession(savedSession);
    setResponse(savedResponse);

    if (!savedSession) {
      setPhase("verify");
      return;
    }

    if (savedResponse === "not_interested") {
      setPhase("not_interested_thanks");
      return;
    }

    setPhase("property");
  }, [propertyId]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const handleVerified = (verified: TenantShareSession) => {
    setSession(verified);
    const savedResponse = getTenantShareResponse(propertyId);
    setResponse(savedResponse);
    if (savedResponse === "not_interested") {
      setPhase("not_interested_thanks");
    } else {
      setPhase("property");
    }
  };

  const handleInterested = async () => {
    if (!property || !session) return;
    setCtaError(null);
    setCtaLoading(true);
    try {
      const label = getPropertyShareLabel(property);
      const apiResult = await submitPropertyShareInquiry({
        propertyId: property.id,
        name: session.name,
        phone: session.phone,
        propertyLabel: label,
      });

      if (!apiResult.ok) {
        createPropertyShareInquiry({
          name: session.name,
          phone: session.phone,
          propertyId: property.id,
          propertyLabel: label,
        });
      }

      setTenantShareResponse(property.id, "interested");
      setResponse("interested");
      setPhase("interest_success");
    } catch {
      setCtaError("Something went wrong. Please check your connection and try again.");
    } finally {
      setCtaLoading(false);
    }
  };

  const handleNotInterested = () => {
    if (!property || !session) return;
    setCtaError(null);
    setCtaLoading(true);
    try {
      setTenantShareResponse(property.id, "not_interested");
      setResponse("not_interested");
      setPhase("not_interested_thanks");
    } catch {
      setCtaError("Something went wrong. Please try again.");
    } finally {
      setCtaLoading(false);
    }
  };

  const pageShell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-center px-4 sticky top-0 z-10">
        <TrustKeyperLogo variant="brand" size="header" />
      </header>
      <main className="max-w-lg mx-auto p-4 pb-8">{children}</main>
    </div>
  );

  if (phase === "loading") {
    return <LoadingScreen />;
  }

  if (phase === "not_found") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
        <Building2 size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">Property not found</p>
        <p className="text-sm text-gray-400 mt-1">This link may be outdated or invalid.</p>
      </div>
    );
  }

  if (phase === "unavailable") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
        <Building2 size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">This property is no longer available</p>
        <p className="text-sm text-gray-400 mt-1">
          {property ? getPropertyTitle(property) : "The listing"} may have been rented or removed.
        </p>
      </div>
    );
  }

  if (phase === "verify" && property) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="min-h-screen blur-sm opacity-40 scale-[1.02]">
            {pageShell(
              <div className="space-y-4 pt-8">
                <div className="h-64 rounded-xl bg-gray-200" />
                <div className="h-40 rounded-xl bg-white border border-gray-200" />
              </div>,
            )}
          </div>
        </div>
        <TenantPropertyVerification propertyId={property.id} onVerified={handleVerified} />
      </div>
    );
  }

  return (
    <>
      {(phase === "property" ||
        phase === "interest_success" ||
        phase === "not_interested_thanks") &&
      property &&
      session ? (
        pageShell(
          <>
            {ctaError ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {ctaError}
              </div>
            ) : null}
            <PropertyPublicCard
              property={property}
              response={response}
              ctaLoading={ctaLoading}
              onInterested={() => void handleInterested()}
              onNotInterested={handleNotInterested}
            />
            <p className="text-center text-xs text-gray-400 mt-6">Shared via TrustKeyper</p>
          </>,
        )
      ) : null}

      {phase === "interest_success" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center relative">
            <div className="w-16 h-16 rounded-full bg-green-50 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Interest shared</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your interest has been shared with the property owner.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="w-full h-11 rounded-[4px] font-semibold"
                onClick={() => setPhase("property")}
              >
                View Property Again
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-[4px] font-semibold"
                onClick={() => setPhase("property")}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "not_interested_thanks" && !ctaLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setPhase("property")}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              aria-label="Close"
            >
              <X size={18} className="text-gray-600" />
            </button>
            <p className="text-lg font-semibold text-gray-900 mb-2">Thank you for your response.</p>
            <p className="text-sm text-gray-500 mb-6">We&apos;ve recorded your preference.</p>
            <Button
              type="button"
              className="w-full h-11 rounded-[4px] font-semibold"
              onClick={() => setPhase("property")}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
