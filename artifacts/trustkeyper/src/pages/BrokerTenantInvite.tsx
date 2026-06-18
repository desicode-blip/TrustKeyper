import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { BrokerOnboardLinkSuccess } from "@/components/broker/BrokerOnboardLinkSuccess";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { BrokerOnboardLinkPayload } from "@/lib/brokerOnboardShareActions";
import {
  createBrokerTenantOnboardingInvite,
  findDuplicateTenantLead,
  findPendingInviteByPhone,
  getBrokerOnboardingInvites,
  isValidIndianMobile,
  type CreateBrokerOnboardInviteResult,
} from "@/lib/brokerTenantOnboarding";

type BrokerOnboardInviteError = Extract<CreateBrokerOnboardInviteResult, { ok: false }>["error"];

const INVITE_ERROR_MESSAGES: Record<BrokerOnboardInviteError, string> = {
  invalid_name: "Enter tenant full name",
  invalid_phone: "Enter a valid 10-digit mobile number",
  duplicate_tenant: "A lead with this mobile number already exists.",
  duplicate_invite: "An active onboarding link already exists for this number.",
  no_session: "Please sign in as a broker to generate onboarding links.",
};

export default function BrokerTenantInvite() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [successPayload, setSuccessPayload] = useState<BrokerOnboardLinkPayload | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const nameValid = name.trim().length >= 2;
  const phoneValid = isValidIndianMobile(phone);
  const canSubmit = nameValid && phoneValid && !loading && !duplicateWarning;

  const nameError = touched.name && !nameValid ? "Enter tenant full name" : null;
  const phoneError =
    touched.phone && !phoneValid ? "Enter a valid 10-digit mobile number" : null;

  useEffect(() => {
    if (!phoneValid) {
      setDuplicateWarning(null);
      return;
    }
    if (findDuplicateTenantLead(phone)) {
      setDuplicateWarning("A lead with this mobile number already exists in your tenant list.");
      return;
    }
    if (findPendingInviteByPhone(phone)) {
      setDuplicateWarning("An active onboarding link was already sent to this mobile number.");
      return;
    }
    setDuplicateWarning(null);
  }, [phone, phoneValid]);

  const handleSubmit = async () => {
    setTouched({ name: true, phone: true });
    if (!canSubmit) return;

    setLoading(true);
    try {
      const result = await createBrokerTenantOnboardingInvite(name, phone);
      if (!result.ok) {
        toast({
          title: "Could not generate link",
          description: INVITE_ERROR_MESSAGES[result.error],
          variant: "destructive",
        });
        return;
      }

      setSuccessPayload({
        tenantName: result.invite.tenantName,
        tenantPhone: result.invite.tenantPhone,
        link: result.link,
        token: result.invite.token,
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = getBrokerOnboardingInvites().filter(
    (inv) => inv.status === "pending" && inv.expiresAt > Date.now(),
  ).length;

  if (successPayload) {
    return (
      <BrokerLayout>
        <div className="max-w-xl mx-auto">
          <BrokerOnboardLinkSuccess
            {...successPayload}
            onDone={() => setLocation("/broker/tenants")}
          />
        </div>
      </BrokerLayout>
    );
  }

  return (
    <BrokerLayout>
      <div className="max-w-xl mx-auto">
        <Link
          href="/broker/tenants"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} /> Back to Tenants
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Generate Tenant Onboarding Link</h1>
        <p className="text-sm text-gray-500 mb-6">
          Collect structured rental requirements before suggesting properties. The tenant completes
          their profile through TrustKeyper and the lead is added to your dashboard.
        </p>

        {pendingCount > 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-6">
            You have {pendingCount} pending onboarding link{pendingCount === 1 ? "" : "s"} awaiting
            tenant completion.
          </p>
        ) : null}

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="text-gray-700">
              Tenant Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Enter full name"
              className={nameError ? "border-destructive" : undefined}
              aria-invalid={!!nameError}
            />
            {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
          </div>

          <AuthPhoneField
            id="invite-phone"
            value={phone}
            onChange={setPhone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            helperText={undefined}
            errorText={phoneError}
          />

          {duplicateWarning ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {duplicateWarning}
            </p>
          ) : null}

          <BrokerFlowButton
            type="button"
            className="w-full sm:w-fit"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating…
              </>
            ) : (
              "Generate Onboarding Link"
            )}
          </BrokerFlowButton>
        </div>
      </div>
    </BrokerLayout>
  );
}
