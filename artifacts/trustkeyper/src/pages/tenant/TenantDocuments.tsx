import React, { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink, FileText, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import TenantLayout from "@/components/TenantLayout";
import { TenantKycStatusBadge } from "@/components/tenant/TenantKycStatusBadge";
import { documentLabel } from "@workspace/tenant-document-upload";
import {
  fetchDocumentUploadInvite,
  type DocumentUploadInvitePayload,
} from "@/lib/publicAgreementDocumentUpload";
import { TENANT_DOCUMENT_MANAGEMENT_UPDATED_EVENT } from "@/lib/tenantDocumentManagementSync";
import {
  formatDocumentUploadedAt,
  openTenantDocumentPreview,
  resolveTenantDocumentDataUrl,
} from "@/lib/tenantProfileDocument";
import {
  getTenantAccountProfile,
  mapUploadStatusToVerification,
  type TenantDocumentMeta,
} from "@/lib/tenantProfile";
import { getActiveTenantWorkspace } from "@/lib/tenantWorkspace";
import { documentsAlreadySubmittedForInvite } from "@/lib/tenantReturningAccess";

export default function TenantDocuments() {
  const workspace = getActiveTenantWorkspace();
  const profile = getTenantAccountProfile();
  const [invite, setInvite] = useState<DocumentUploadInvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const token = workspace?.documentUploadToken ?? profile.documentUploadToken;

  const loadDocuments = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { payload, error: fetchError } = await fetchDocumentUploadInvite(token);
    if (!payload) {
      setError(fetchError ?? "Could not load your documents.");
      setInvite(null);
    } else {
      setInvite(payload);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void loadDocuments();
    const onRefresh = () => void loadDocuments();
    window.addEventListener(TENANT_DOCUMENT_MANAGEMENT_UPDATED_EVENT, onRefresh);
    return () => window.removeEventListener(TENANT_DOCUMENT_MANAGEMENT_UPDATED_EVENT, onRefresh);
  }, [loadDocuments]);

  const handleView = async (meta: TenantDocumentMeta, docId: "aadhaar" | "pan") => {
    if (!token) return;
    setViewingId(docId);
    try {
      const dataUrl = await resolveTenantDocumentDataUrl(meta, token, docId);
      if (!dataUrl) {
        setError("Could not open document preview.");
        return;
      }
      openTenantDocumentPreview(dataUrl, meta.fileName ?? docId);
    } finally {
      setViewingId(null);
    }
  };

  if (loading) {
    return (
      <TenantLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary mb-3" size={28} />
          <p className="text-sm text-gray-500">Loading your documents…</p>
        </div>
      </TenantLayout>
    );
  }

  if (!token) {
    return (
      <TenantLayout>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center max-w-lg mx-auto">
          <FileText className="mx-auto text-gray-300 mb-4" size={40} />
          <h1 className="text-lg font-semibold text-gray-900">No documents yet</h1>
          <p className="text-sm text-gray-500 mt-2">
            When your property owner or broker requests documents, they will appear here.
          </p>
        </div>
      </TenantLayout>
    );
  }

  if (error && !invite) {
    return (
      <TenantLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 max-w-lg mx-auto text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button type="button" className="mt-4" variant="outline" onClick={() => void loadDocuments()}>
            Try again
          </Button>
        </div>
      </TenantLayout>
    );
  }

  const documentsSubmitted =
    invite &&
    documentsAlreadySubmittedForInvite({
      status: invite.status,
      tenantDocumentStatus: invite.tenantDocumentStatus,
    });
  const manageHref = documentsSubmitted ? undefined : `/upload/documents/${token}`;

  return (
    <TenantLayout>
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Uploaded Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review document status and manage uploads for your rental application.
          </p>
        </div>
        {manageHref ? (
          <Link href={manageHref}>
            <Button type="button" className="w-full sm:w-auto">
              <ExternalLink size={16} />
              Manage Documents
            </Button>
          </Link>
        ) : null}
      </div>

      {workspace?.propertyLabel ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex gap-3 items-center">
          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{workspace.propertyLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {invite?.requesterName ? `Requested by ${invite.requesterName}` : "Assigned property"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {(invite?.requestedDocumentIds ?? ["aadhaar", "pan", "bank"]).map((id) => {
          const serverStatus = invite?.documentStatuses[id] ?? "not_uploaded";
          const serverFile = invite?.documents[id];
          const profileMeta =
            id === "aadhaar" ? profile.aadhaar : id === "pan" ? profile.pan : undefined;
          const verification = mapUploadStatusToVerification(
            serverStatus,
            invite?.tenantDocumentStatus,
          );
          const fileName =
            id === "bank"
              ? invite?.bankDetails
                ? "Bank Account Details"
                : undefined
              : serverFile?.fileName ?? profileMeta?.fileName;
          const uploadedAt = serverFile?.uploadedAt ?? profileMeta?.uploadedAt;

          return (
            <div key={id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{documentLabel(id)}</p>
                  {fileName ? (
                    <p className="text-xs text-gray-500 mt-1">{fileName}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                  {uploadedAt ? (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Uploaded {formatDocumentUploadedAt(uploadedAt)}
                    </p>
                  ) : null}
                </div>
                <TenantKycStatusBadge status={verification} />
              </div>
              {id !== "bank" && fileName ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  disabled={viewingId === id}
                  onClick={() => {
                    if (id !== "aadhaar" && id !== "pan") return;
                    const meta: TenantDocumentMeta = {
                      documentId: id,
                      sourceToken: token,
                      fileName,
                      fileSize: serverFile?.fileSize ?? profileMeta?.fileSize,
                      mimeType: serverFile?.mimeType ?? profileMeta?.mimeType,
                      uploadedAt,
                      previewAvailable: true,
                      verificationStatus: verification,
                    };
                    void handleView(meta, id);
                  }}
                >
                  {viewingId === id ? <Loader2 size={14} className="animate-spin" /> : null}
                  View
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
    </TenantLayout>
  );
}
