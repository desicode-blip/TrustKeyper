import React, { useMemo } from "react";
import { Copy, Share2, X } from "lucide-react";
import { FaCommentSms, FaTelegram, FaWhatsapp } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import { toast } from "@/hooks/use-toast";
import { trackBrokerOnboardEvent } from "@/lib/brokerOnboardAnalytics";
import {
  copyBrokerOnboardLink,
  type BrokerOnboardLinkPayload,
  type BrokerOnboardShareContext,
} from "@/lib/brokerOnboardShareActions";
import {
  buildBrokerTenantOnboardShareMessage,
  getBrokerTenantOnboardEmailHref,
  getBrokerTenantOnboardSmsHref,
  getBrokerTenantOnboardTelegramHref,
  getBrokerTenantOnboardWhatsAppHref,
} from "@/lib/brokerTenantOnboarding";

type ShareOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  className: string;
  onClick: () => void;
};

export function BrokerOnboardShareModal({
  open,
  onClose,
  tenantName,
  tenantPhone,
  link,
  token,
  overlayClassName = "z-50",
  showCopyOption = true,
}: BrokerOnboardLinkPayload & {
  open: boolean;
  onClose: () => void;
  overlayClassName?: string;
  showCopyOption?: boolean;
}) {
  const shareContext: BrokerOnboardShareContext = useMemo(
    () => ({ tenantPhone, token }),
    [tenantPhone, token],
  );

  const shareText = useMemo(
    () => buildBrokerTenantOnboardShareMessage(tenantName, link),
    [tenantName, link],
  );

  const shareHrefs = useMemo(
    () => ({
      whatsApp: getBrokerTenantOnboardWhatsAppHref(tenantPhone, tenantName, link),
      email: getBrokerTenantOnboardEmailHref(tenantName, link),
      sms: getBrokerTenantOnboardSmsHref(tenantPhone, tenantName, link),
      telegram: getBrokerTenantOnboardTelegramHref(tenantName, link),
    }),
    [tenantName, tenantPhone, link],
  );

  if (!open) return null;

  const handleCopyLink = async () => {
    const copied = await copyBrokerOnboardLink(link, shareContext);
    if (copied) {
      toast({ description: "Link copied successfully" });
      onClose();
      return;
    }
    toast({
      title: "Copy failed",
      description: "Could not copy to clipboard.",
      variant: "destructive",
    });
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "TrustKeyper tenant onboarding",
          text: shareText,
          url: link,
        });
        trackBrokerOnboardEvent("native_share_used", shareContext);
        onClose();
        return;
      } catch {
        /* user cancelled */
      }
    }
    await handleCopyLink();
  };

  const shareOptions: ShareOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5" aria-hidden />,
      className: "bg-[#25D366] hover:bg-[#20bd5a] text-white border-0",
      onClick: () => {
        trackBrokerOnboardEvent("whatsapp_shared", shareContext);
        window.open(shareHrefs.whatsApp, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
    {
      id: "email",
      label: "Email",
      icon: <SiGmail className="w-5 h-5" aria-hidden />,
      className: "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50",
      onClick: () => {
        trackBrokerOnboardEvent("email_shared", shareContext);
        window.location.href = shareHrefs.email;
        onClose();
      },
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <FaTelegram className="w-5 h-5" aria-hidden />,
      className: "bg-[#229ED9] hover:bg-[#1d8fc7] text-white border-0",
      onClick: () => {
        trackBrokerOnboardEvent("telegram_shared", shareContext);
        window.open(shareHrefs.telegram, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
    {
      id: "sms",
      label: "SMS",
      icon: <FaCommentSms className="w-5 h-5" aria-hidden />,
      className: "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50",
      onClick: () => {
        trackBrokerOnboardEvent("sms_shared", shareContext);
        window.location.href = shareHrefs.sms;
        onClose();
      },
    },
    {
      id: "native",
      label: "Native Share",
      icon: <Share2 size={20} aria-hidden />,
      className: "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50",
      onClick: () => void handleNativeShare(),
    },
    ...(showCopyOption
      ? [
          {
            id: "copy",
            label: "Copy link",
            icon: <Copy size={20} aria-hidden />,
            className: "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50",
            onClick: () => void handleCopyLink(),
          } satisfies ShareOption,
        ]
      : []),
  ];

  return (
    <div
      className={`fixed inset-0 flex items-end sm:items-center justify-center bg-black/40 p-4 ${overlayClassName}`}
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-in slide-in-from-bottom-4 fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="broker-onboard-share-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          aria-label="Close share options"
        >
          <X size={16} className="text-gray-600" />
        </button>
        <div className="p-6 pt-8">
          <h3 id="broker-onboard-share-title" className="text-lg font-semibold text-gray-900 mb-1">
            Share Via
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Choose how you want to send the onboarding link to {tenantName}.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={option.onClick}
                className={`inline-flex items-center justify-center gap-2 h-11 rounded-[4px] text-sm font-semibold transition-colors ${option.className}`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
