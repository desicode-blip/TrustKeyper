import React, { useCallback, useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedPropertyLandingBackdrop } from "@/components/tenant/SharedPropertyLandingBackdrop";
import {
  TenantBrokerOnboardModal,
  type TenantOnboardModalPhase,
} from "@/components/tenant/TenantBrokerOnboardModal";
import { TenantDocumentUploadFlow } from "@/components/tenant/TenantDocumentUploadFlow";
import { getActiveSession, profileExistsAsync, signUpSuccess, loginSuccess } from "@/lib/auth";
import {
  fetchDocumentUploadInvite,
  markDocumentUploadStarted,
  type DocumentUploadInvitePayload,
} from "@/lib/publicAgreementDocumentUpload";
import { sendPhoneOtp } from "@/lib/phoneOtp";
import { syncTenantDocumentUploadStatus } from "@/lib/tenantDocumentUploadStatus";
import {
  clearTenantDocumentUploadSession,
  getTenantDocumentUploadSession,
  setTenantDocumentUploadSession,
  type TenantDocumentUploadSession,
} from "@/lib/tenantDocumentUploadSession";
import { ensureTenantDashboardSession } from "@/lib/tenantDocumentUploadRedirect";
import { mergeTenantProfileFromInvitePayload } from "@/lib/tenantProfile";
import { saveTenantWorkspaceFromInvite } from "@/lib/tenantWorkspace";

type PagePhase =
  | "loading"
  | "invalid"
  | "expired"
  | "already_submitted"
  | "modal"
  | "upload";

export default function TenantDocumentUpload() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/upload/documents/:token");
  const token = params?.token ?? "";

  const [pagePhase, setPagePhase] = useState<PagePhase>("loading");
  const [modalPhase, setModalPhase] = useState<TenantOnboardModalPhase>("welcome");
  const [invite, setInvite] = useState<DocumentUploadInvitePayload | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sendOtpError, setSendOtpError] = useState<string | null>(null);
  const [verifyOtpError, setVerifyOtpError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [session, setSession] = useState<TenantDocumentUploadSession | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    if (!token) {
      setPagePhase("invalid");
      setLoadError("Invalid document upload link");
      return;
    }

    setPagePhase("loading");
    const { payload, error, status } = await fetchDocumentUploadInvite(token);
    if (!payload) {
      if (status === 410) {
        setPagePhase("expired");
        setLoadError(error ?? "This document upload link has expired");
        return;
      }
      setPagePhase("invalid");
      setLoadError(error ?? "Invalid document upload link");
      return;
    }

    if (payload.status === "expired") {
      setPagePhase("expired");
      setLoadError("This document upload link has expired");
      return;
    }

    if (payload.status === "submitted") {
      clearTenantDocumentUploadSession(token);
      saveTenantWorkspaceFromInvite(payload, {
        documentUploadStatus: "documents_submitted",
        documentUploadSubmittedAt: payload.submittedAt ?? Date.now(),
      });
      setInvite(payload);
      setPagePhase("already_submitted");
      return;
    }

    setInvite(payload);
    mergeTenantProfileFromInvitePayload(payload);

    const existingSession = getTenantDocumentUploadSession(token);
    if (existingSession) {
      setSession(existingSession);
      setPagePhase("upload");
      void markDocumentUploadStarted(token);
      return;
    }

    if (payload.hasTenantAccount) {
      const digits = payload.tenantPhone.replace(/\D/g, "").slice(-10);
      await ensureTenantDashboardSession(digits, getActiveSession, loginSuccess);
      const nextSession: TenantDocumentUploadSession = {
        token,
        name: payload.tenantName,
        phone: `+91${digits}`,
        requesterName: payload.requesterName,
        verifiedAt: Date.now(),
      };
      setTenantDocumentUploadSession(nextSession);
      setSession(nextSession);
      void markDocumentUploadStarted(token);
      syncTenantDocumentUploadStatus(payload.tenantPhone, "documents_in_progress", { token });
      setPagePhase("upload");
      return;
    }

    setName(payload.tenantName);
    setPhone(payload.tenantPhone.replace(/\D/g, "").slice(-10));
    setModalPhase("welcome");
    setPagePhase("modal");
  }, [token]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const handleSendOtp = async (): Promise<boolean> => {
    setSendOtpError(null);
    setSendingOtp(true);
    try {
      const digits = phone.replace(/\D/g, "").slice(-10);
      const err = await sendPhoneOtp(digits);
      if (err) {
        setSendOtpError(err);
        return false;
      }
      setModalPhase("otp");
      return true;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpVerified = async (success: boolean) => {
    if (!success || !invite) {
      setVerifyOtpError("Invalid or expired OTP. Please try again.");
      return;
    }

    const digits = phone.replace(/\D/g, "").slice(-10);
    const hasAccount = await profileExistsAsync(digits, "tenant");
    if (!hasAccount) {
      await signUpSuccess(digits, "tenant", { name: name.trim(), phone: digits });
    } else {
      await loginSuccess(digits, "tenant");
    }

    setVerifyOtpError(null);
    const nextSession: TenantDocumentUploadSession = {
      token,
      name: name.trim(),
      phone: `+91${digits}`,
      requesterName: invite.requesterName,
      verifiedAt: Date.now(),
    };
    setTenantDocumentUploadSession(nextSession);
    setSession(nextSession);
    if (invite) mergeTenantProfileFromInvitePayload(invite);
    void markDocumentUploadStarted(token);
    syncTenantDocumentUploadStatus(invite.tenantPhone, "documents_in_progress", { token });
    setModalPhase("account_success");
  };

  const handleAccountSuccessDone = () => {
    setPagePhase("upload");
  };

  const handleFlowDone = async () => {
    if (invite) {
      syncTenantDocumentUploadStatus(invite.tenantPhone, "documents_submitted", {
        token,
        submittedAt: Date.now(),
      });
      saveTenantWorkspaceFromInvite(invite, {
        documentUploadStatus: "documents_submitted",
        documentUploadSubmittedAt: Date.now(),
      });
      await ensureTenantDashboardSession(invite.tenantPhone, getActiveSession, loginSuccess);
    }
    clearTenantDocumentUploadSession(token);
    setLocation("/tenant/dashboard");
  };

  if (pagePhase === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-500">Loading your document request…</p>
      </div>
    );
  }

  if (pagePhase === "upload" && session && invite) {
    return <TenantDocumentUploadFlow invite={invite} session={session} onDone={handleFlowDone} />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden blur-sm pointer-events-none select-none">
        <SharedPropertyLandingBackdrop />
      </div>

      {pagePhase === "modal" && invite ? (
        <TenantBrokerOnboardModal
          phase={modalPhase}
          name={name}
          phone={phone}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onOtpVerified={(ok) => void handleOtpVerified(ok)}
          onAccountSuccessDone={handleAccountSuccessDone}
          sendOtpError={sendOtpError}
          verifyOtpError={verifyOtpError}
          sendingOtp={sendingOtp}
          onSendOtp={handleSendOtp}
        />
      ) : null}

      {pagePhase === "invalid" || pagePhase === "expired" || pagePhase === "already_submitted" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {pagePhase === "already_submitted"
                ? "Documents already submitted"
                : pagePhase === "expired"
                  ? "Link expired"
                  : "Invalid link"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {pagePhase === "already_submitted"
                ? `Your documents were already shared with ${invite?.requesterName ?? "your property manager"}.`
                : (loadError ?? "This document upload link is not valid.")}
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={async () => {
                const digits = invite?.tenantPhone.replace(/\D/g, "").slice(-10);
                if (digits) {
                  await ensureTenantDashboardSession(digits, getActiveSession, loginSuccess);
                }
                setLocation("/tenant/dashboard");
              }}
            >
              Go To Dashboard
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
