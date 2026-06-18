import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, Share2 } from "lucide-react";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { BrokerOnboardShareModal } from "@/components/broker/BrokerOnboardShareModal";
import { toast } from "@/hooks/use-toast";
import { trackBrokerOnboardEvent } from "@/lib/brokerOnboardAnalytics";
import {
  copyBrokerOnboardLink,
  type BrokerOnboardLinkPayload,
} from "@/lib/brokerOnboardShareActions";
import { formatTenantPhoneDisplay } from "@/lib/brokerTenantOnboarding";

export function BrokerOnboardLinkSuccess({
  tenantName,
  tenantPhone,
  link,
  token,
  onDone,
}: BrokerOnboardLinkPayload & { onDone: () => void }) {
  const [shareOpen, setShareOpen] = useState(false);
  const shareContext = { tenantPhone, token };

  useEffect(() => {
    trackBrokerOnboardEvent("link_generated", shareContext);
  }, [tenantPhone, token]);

  const handleCopyLink = async () => {
    const copied = await copyBrokerOnboardLink(link, shareContext);
    if (copied) {
      toast({ description: "Link copied successfully" });
      return;
    }
    toast({
      title: "Copy failed",
      description: "Could not copy to clipboard.",
      variant: "destructive",
    });
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Onboarding Link Generated</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Share this link with the tenant to collect their rental requirements through TrustKeyper.
        </p>

        <div className="rounded-xl bg-[#F5F9FC] border border-[#E2EAF2] p-4 mb-6 text-left">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 font-medium">Tenant Name</dt>
              <dd className="font-semibold text-gray-900 text-right">{tenantName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 font-medium">Mobile Number</dt>
              <dd className="font-semibold text-gray-900 text-right">
                {formatTenantPhoneDisplay(tenantPhone)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs font-medium text-gray-500 mb-1">Generated link</p>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 break-all">
            {link}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <BrokerFlowButton type="button" className="w-full" onClick={() => void handleCopyLink()}>
            <Copy size={16} /> Copy Link
          </BrokerFlowButton>
          <BrokerFlowButton
            type="button"
            flowVariant="outline"
            className="w-full"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={16} /> Share Via...
          </BrokerFlowButton>
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 py-2"
          >
            Done
          </button>
        </div>
      </div>

      <BrokerOnboardShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        tenantName={tenantName}
        tenantPhone={tenantPhone}
        link={link}
        token={token}
      />
    </>
  );
}
