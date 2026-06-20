import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, Share2, X } from "lucide-react";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { BrokerOnboardShareModal } from "@/components/broker/BrokerOnboardShareModal";
import { toast } from "@/hooks/use-toast";
import { trackBrokerOnboardEvent } from "@/lib/brokerOnboardAnalytics";
import {
  copyBrokerOnboardLink,
  type BrokerOnboardLinkPayload,
} from "@/lib/brokerOnboardShareActions";

export function BrokerOnboardInvitationCreatedModal({
  open,
  tenantName,
  tenantPhone,
  link,
  token,
  onClose,
}: BrokerOnboardLinkPayload & {
  open: boolean;
  onClose: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const shareContext = { tenantPhone, token };

  useEffect(() => {
    if (!open) {
      setShareOpen(false);
      return;
    }
    trackBrokerOnboardEvent("link_generated", { tenantPhone, token });
  }, [open, tenantPhone, token]);

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

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/50 p-4"
        role="presentation"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="broker-invitation-created-title"
          className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-6 animate-in fade-in zoom-in-95 duration-200"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden />
            </div>
            <h2
              id="broker-invitation-created-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              Invitation Created
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              The onboarding link has been generated successfully. Tenant can use this link to
              share their rental requirements.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Page link</p>
            <div className="flex items-stretch gap-2 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
              <p className="flex-1 min-w-0 px-3 py-2.5 text-xs text-gray-600 break-all text-left">
                {link}
              </p>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="shrink-0 px-3 border-l border-gray-200 text-gray-500 hover:text-primary hover:bg-white transition-colors"
                aria-label="Copy link"
              >
                <Copy size={16} />
              </button>
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
              <Share2 size={16} /> Share Via
            </BrokerFlowButton>
            <BrokerFlowButton type="button" className="w-full" onClick={onClose}>
              <CheckCircle2 size={16} /> Done
            </BrokerFlowButton>
          </div>
        </div>
      </div>

      <BrokerOnboardShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        tenantName={tenantName}
        tenantPhone={tenantPhone}
        link={link}
        token={token}
        overlayClassName="z-[60]"
        showCopyOption={false}
      />
    </>
  );
}
