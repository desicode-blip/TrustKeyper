import React, { useCallback, useEffect, useState } from "react";
import { useRoute } from "wouter";
import { CheckCircle2, User, XCircle } from "lucide-react";
import { OwnerFlowButton } from "@/components/owner/OwnerFlowButton";
import { TrustKeyperLogo } from "@/components/brand";
import {
  fetchPublicInvitation,
  respondToInvitation,
  type PublicInvitation,
} from "@/lib/tenantInvitationsApi";
import type { InviteStatus } from "@/lib/ownerTenants";

type ViewState = "loading" | "invite" | "success" | "declined" | "error";

function formatInr(value: string): string {
  const n = value.replace(/\D/g, "");
  if (!n) return "—";
  return `₹ ${Number(n).toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusBlocksAction(status: InviteStatus): boolean {
  return status !== "pending";
}

export default function TenantInvite() {
  const [, params] = useRoute("/invite/:token");
  const token = params?.token ?? "";
  const [view, setView] = useState<ViewState>("loading");
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [submitting, setSubmitting] = useState<"accept" | "decline" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoadError("Invalid invitation link.");
      setView("error");
      return;
    }
    setView("loading");
    const data = await fetchPublicInvitation(token);
    if (!data) {
      setLoadError("This invitation link is invalid or has been removed.");
      setView("error");
      return;
    }
    setInvitation(data);
    if (data.status === "accepted") setView("success");
    else if (data.status === "declined") setView("declined");
    else if (data.status === "expired") {
      setLoadError("This invitation has expired. Please ask the owner to send a new invite.");
      setView("error");
    } else setView("invite");
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRespond = async (action: "accept" | "decline") => {
    if (!token || !invitation || statusBlocksAction(invitation.status)) return;
    setSubmitting(action);
    const result = await respondToInvitation(token, action);
    setSubmitting(null);
    if (!result.invitation) {
      setLoadError("Something went wrong. Please try again.");
      setView("error");
      return;
    }
    setInvitation(result.invitation);
    if (result.invitation.status === "accepted") setView("success");
    else if (result.invitation.status === "declined") setView("declined");
    else if (result.error === "expired") {
      setLoadError("This invitation has expired.");
      setView("error");
    } else if (result.error === "already_final") {
      if (result.invitation.status === "accepted") setView("success");
      else setView("declined");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-center px-4 shrink-0">
        <TrustKeyperLogo variant="brand" size="header" />
      </header>

      <main className="flex-1 p-4 sm:p-8 flex items-start justify-center">
        <div className="w-full max-w-lg">
          {view === "loading" && (
            <p className="text-center text-sm text-gray-500 py-16">Loading invitation…</p>
          )}

          {view === "error" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden />
              <h1 className="text-lg font-semibold text-gray-900 mb-2">Invitation unavailable</h1>
              <p className="text-sm text-gray-600">{loadError}</p>
            </div>
          )}

          {(view === "success" || view === "declined") && invitation && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              {view === "success" ? (
                <>
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" aria-hidden />
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">Invitation accepted</h1>
                  <p className="text-sm text-gray-600 mb-4">
                    Thank you, {invitation.tenantName}. {invitation.ownerName} has been notified.
                  </p>
                  <p className="text-xs text-gray-500">
                    Property: {invitation.propertyLabel}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-14 h-14 text-gray-400 mx-auto mb-4" aria-hidden />
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">Invitation declined</h1>
                  <p className="text-sm text-gray-600">
                    Your response has been recorded. {invitation.ownerName} has been notified.
                  </p>
                </>
              )}
            </div>
          )}

          {view === "invite" && invitation && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-primary/5 border-b border-gray-100 px-6 py-5">
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  Rental invitation
                </p>
                <h1 className="text-xl font-semibold text-gray-900 leading-snug">
                  {invitation.propertyLabel}
                </h1>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                  <User size={14} className="shrink-0 opacity-70" />
                  From {invitation.ownerName}
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                <DetailRow label="Tenant" value={invitation.tenantName} />
                <DetailRow label="Monthly rent" value={formatInr(invitation.monthlyRent)} />
                <DetailRow
                  label="Maintenance"
                  value={
                    invitation.maintenanceIncluded
                      ? "Included in rent"
                      : formatInr(invitation.monthlyMaintenance)
                  }
                />
                <DetailRow label="Security deposit" value={formatInr(invitation.securityDeposit)} />
                <DetailRow label="Start date" value={formatDate(invitation.startDate)} />
                <DetailRow
                  label="Valid until"
                  value={formatDate(invitation.expiresAt)}
                />
              </div>

              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                <OwnerFlowButton
                  type="button"
                  className="flex-1"
                  disabled={!!submitting}
                  onClick={() => void handleRespond("accept")}
                >
                  {submitting === "accept" ? "Accepting…" : "Accept invitation"}
                </OwnerFlowButton>
                <OwnerFlowButton
                  type="button"
                  flowVariant="outline"
                  className="flex-1"
                  disabled={!!submitting}
                  onClick={() => void handleRespond("decline")}
                >
                  {submitting === "decline" ? "Declining…" : "Decline"}
                </OwnerFlowButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}
