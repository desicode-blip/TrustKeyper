import React, { useEffect, useState } from "react";
import { Link2, Loader2, User } from "lucide-react";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { BrokerOnboardLinkPayload } from "@/lib/brokerOnboardShareActions";
import {
  createBrokerTenantOnboardingInvite,
  findDuplicateTenantLead,
  findPendingInviteByPhone,
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

export function BrokerOnboardLinkGeneratorCard({
  onSuccess,
}: {
  onSuccess: (payload: BrokerOnboardLinkPayload) => void;
}) {
  const { toast } = useToast();
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

      onSuccess({
        tenantName: result.invite.tenantName,
        tenantPhone: result.invite.tenantPhone,
        link: result.link,
        token: result.invite.token,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Link2 size={22} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Generate link</h2>
          <p className="text-sm text-gray-500 mb-4">
            Send an onboarding link to the tenant — they&apos;ll fill in their rental requirements
            themselves.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="onboard-link-name" className="text-gray-700">
                  Tenant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="onboard-link-name"
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
                id="onboard-link-phone"
                value={phone}
                onChange={setPhone}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                helperText={undefined}
                errorText={phoneError}
              />
            </div>

            {duplicateWarning ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                {duplicateWarning}
              </p>
            ) : null}

            <BrokerFlowButton
              type="button"
              flowVariant="outline"
              className="w-full sm:w-fit"
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating…
                </>
              ) : (
                "Generate Link"
              )}
            </BrokerFlowButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddManuallySectionHeader() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
        <User size={18} aria-hidden />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">Add manually</h2>
        <p className="text-sm text-gray-500">Enter tenant details yourself on TrustKeyper.</p>
      </div>
    </div>
  );
}
