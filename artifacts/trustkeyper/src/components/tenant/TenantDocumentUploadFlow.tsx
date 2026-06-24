import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BankDetailsModal,
  type BankDetailsData,
} from "@/components/agreement/BankDetailsModal";
import {
  documentLabel,
  isFileDocumentId,
  type ExtendedDocumentId,
  type UploadDocumentStatus,
} from "@workspace/tenant-document-upload";
import { getFileTypeError } from "@/lib/fileValidation";
import {
  readFileAsDataUrl,
  submitDocumentUploadInvite,
  type DocumentUploadInvitePayload,
} from "@/lib/publicAgreementDocumentUpload";
import { syncTenantDocumentUploadStatus } from "@/lib/tenantDocumentUploadStatus";
import { saveTenantWorkspaceFromInvite } from "@/lib/tenantWorkspace";
import {
  clearTenantDocumentUploadDraft,
  getTenantDocumentUploadDraft,
  setTenantDocumentUploadDraft,
  type TenantDocumentUploadDraft,
  type TenantDocumentUploadSession,
} from "@/lib/tenantDocumentUploadSession";
import { cn } from "@/lib/utils";

type LocalDocState = {
  status: UploadDocumentStatus;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  dataUrl?: string;
  error?: string;
  progress?: number;
};

function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TenantDocumentUploadFlow({
  invite,
  session,
  onDone,
}: {
  invite: DocumentUploadInvitePayload;
  session: TenantDocumentUploadSession;
  onDone: () => void | Promise<void>;
}) {
  const [docs, setDocs] = useState<Partial<Record<ExtendedDocumentId, LocalDocState>>>({});
  const [bankDetails, setBankDetails] = useState<BankDetailsData | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const fileRefs = useRef<Partial<Record<ExtendedDocumentId, HTMLInputElement | null>>>({});

  useEffect(() => {
    const initial: Partial<Record<ExtendedDocumentId, LocalDocState>> = {};
    for (const id of invite.requestedDocumentIds) {
      const serverStatus = invite.documentStatuses[id] ?? "not_uploaded";
      const serverFile = invite.documents[id];
      if (id === "bank") {
        initial.bank = {
          status: serverStatus === "uploaded" || invite.bankDetails ? "uploaded" : "not_uploaded",
          fileName: invite.bankDetails ? "Bank Account Details" : undefined,
        };
        if (invite.bankDetails) {
          setBankDetails(invite.bankDetails as BankDetailsData);
        }
        continue;
      }
      initial[id] = {
        status: serverStatus,
        fileName: serverFile?.fileName,
        fileSize: serverFile?.fileSize,
        mimeType: serverFile?.mimeType,
      };
    }
    const draft = getTenantDocumentUploadDraft(session.token);
    if (draft) {
      for (const [id, file] of Object.entries(draft.uploads)) {
        const docId = id as ExtendedDocumentId;
        if (!isFileDocumentId(docId)) continue;
        initial[docId] = {
          status: "uploaded",
          fileName: file.fileName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          dataUrl: file.dataUrl,
        };
      }
      if (draft.bankDetails) {
        setBankDetails(draft.bankDetails as BankDetailsData);
        initial.bank = { status: "uploaded", fileName: "Bank Account Details" };
      }
    }
    setDocs(initial);
  }, [invite, session.token]);

  const persistDraft = useCallback(
    (nextDocs: Partial<Record<ExtendedDocumentId, LocalDocState>>, nextBank: BankDetailsData | null) => {
      const uploads: TenantDocumentUploadDraft["uploads"] = {};
      for (const [id, doc] of Object.entries(nextDocs)) {
        if (!doc?.dataUrl || !doc.fileName || !doc.mimeType || typeof doc.fileSize !== "number") continue;
        uploads[id] = {
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          dataUrl: doc.dataUrl,
        };
      }
      setTenantDocumentUploadDraft(session.token, {
        step: 1,
        uploads,
        bankDetails: nextBank ?? undefined,
      });
    },
    [session.token],
  );

  useEffect(() => {
    if (Object.keys(docs).length === 0) return;
    persistDraft(docs, bankDetails);
  }, [docs, bankDetails, persistDraft]);

  const fileDocIds = useMemo(
    () => invite.requestedDocumentIds.filter((id) => isFileDocumentId(id)),
    [invite.requestedDocumentIds],
  );

  const allFilesUploaded = fileDocIds.every((id) => docs[id]?.status === "uploaded");
  const bankComplete = !invite.requestedDocumentIds.includes("bank") || docs.bank?.status === "uploaded";
  const canSubmit = allFilesUploaded && bankComplete;

  const handleUpload = async (id: ExtendedDocumentId, file: File) => {
    const typeError = getFileTypeError(file);
    if (typeError) {
      setDocs((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: "reupload_required", error: typeError },
      }));
      return;
    }

    setDocs((prev) => ({
      ...prev,
      [id]: { status: "uploading", progress: 30, fileName: file.name, fileSize: file.size },
    }));

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDocs((prev) => ({
        ...prev,
        [id]: {
          status: "uploaded",
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          dataUrl,
          progress: 100,
        },
      }));
      void submitDocumentUploadInvite(session.token, {
        draft: true,
        documents: {
          [id]: {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            dataUrl,
          },
        },
      });
      syncTenantDocumentUploadStatus(invite.tenantPhone, "documents_in_progress", { token: session.token });
    } catch {
      setDocs((prev) => ({
        ...prev,
        [id]: { status: "reupload_required", error: "Upload failed. Please try again." },
      }));
    }
  };

  const handleBankSave = (data: BankDetailsData) => {
    setBankDetails(data);
    setDocs((prev) => ({
      ...prev,
      bank: { status: "uploaded", fileName: data.mode === "upi" ? "UPI Details" : "Bank Account" },
    }));
    setBankModalOpen(false);
    void submitDocumentUploadInvite(session.token, { draft: true, bankDetails: data });
    syncTenantDocumentUploadStatus(invite.tenantPhone, "documents_in_progress", { token: session.token });
  };

  const buildSubmitPayload = () => {
    const documents: NonNullable<Parameters<typeof submitDocumentUploadInvite>[1]["documents"]> = {};
    for (const id of fileDocIds) {
      const doc = docs[id];
      if (!doc?.dataUrl || !doc.fileName || !doc.mimeType || typeof doc.fileSize !== "number") continue;
      documents[id] = {
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        dataUrl: doc.dataUrl,
      };
    }
    return {
      documents,
      bankDetails: bankDetails ?? undefined,
      draft: false,
    };
  };

  const handleFinalSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitDocumentUploadInvite(session.token, buildSubmitPayload());
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      syncTenantDocumentUploadStatus(invite.tenantPhone, "documents_submitted", {
        token: session.token,
        submittedAt: result.submittedAt ?? Date.now(),
      });
      saveTenantWorkspaceFromInvite(invite, {
        documentUploadStatus: "documents_submitted",
        documentUploadSubmittedAt: result.submittedAt ?? Date.now(),
      });
      clearTenantDocumentUploadDraft(session.token);
      setSuccessOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessDone = async () => {
    setContinuing(true);
    try {
      await onDone();
    } finally {
      setContinuing(false);
    }
  };

  const handleRemoveDoc = (id: ExtendedDocumentId) => {
    setDocs((prev) => {
      const next = { ...prev, [id]: { status: "not_uploaded" as UploadDocumentStatus } };
      persistDraft(next, bankDetails);
      return next;
    });
    if (isFileDocumentId(id)) {
      void submitDocumentUploadInvite(session.token, { draft: true, documents: {} });
    }
    syncTenantDocumentUploadStatus(invite.tenantPhone, "documents_in_progress", { token: session.token });
  };

  const handleViewDoc = (id: ExtendedDocumentId) => {
    if (id === "bank") {
      setBankModalOpen(true);
      return;
    }
    const dataUrl = docs[id]?.dataUrl;
    if (!dataUrl) return;
    window.open(dataUrl, "_blank", "noopener,noreferrer");
  };

  const renderDocRow = (id: ExtendedDocumentId) => {
    const doc = docs[id] ?? { status: "not_uploaded" as UploadDocumentStatus };
    const label = documentLabel(id);

    if (id === "bank") {
      return (
        <div
          key={id}
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border px-4 py-3",
            doc.status === "uploaded" ? "bg-white border-gray-200" : "bg-amber-50/40 border-amber-100",
          )}
        >
          <div className="shrink-0">
            {doc.status === "uploaded" ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : (
              <AlertTriangle size={20} className="text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            {doc.status === "uploaded" ? (
              <p className="text-xs text-gray-500 mt-0.5">{doc.fileName}</p>
            ) : (
              <p className="text-xs text-amber-700 mt-0.5">Pending upload</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleViewDoc(id)}
              disabled={doc.status !== "uploaded"}
              className={cn(
                "flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 font-medium border",
                doc.status === "uploaded"
                  ? "text-gray-600 border-gray-200"
                  : "text-gray-300 border-gray-200 cursor-not-allowed",
              )}
            >
              <Eye size={11} /> View
            </button>
            <button
              type="button"
              onClick={() => setBankModalOpen(true)}
              className={cn(
                "flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 font-medium",
                doc.status === "uploaded"
                  ? "text-gray-600 border border-gray-200"
                  : "bg-primary text-white",
              )}
            >
              {doc.status === "uploaded" ? "Edit" : (
                <>
                  <Plus size={11} /> Add Details
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={id}
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border px-4 py-3",
          doc.status === "uploaded"
            ? "bg-green-50/50 border-green-200"
            : doc.status === "uploading"
              ? "bg-white border-gray-200"
              : "bg-amber-50/40 border-amber-100",
        )}
      >
        <div className="shrink-0">
          {doc.status === "uploaded" && <CheckCircle2 size={20} className="text-green-500" />}
          {doc.status === "uploading" && <Loader2 size={20} className="text-primary animate-spin" />}
          {(doc.status === "not_uploaded" || doc.status === "reupload_required") && (
            <AlertTriangle size={20} className="text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {doc.status === "uploaded" && doc.fileName ? (
            <p className="text-xs text-gray-500 mt-0.5 break-words">
              {doc.fileName}
              {doc.fileSize ? ` · ${fmtFileSize(doc.fileSize)}` : ""}
            </p>
          ) : null}
          {doc.status === "uploading" ? <p className="text-xs text-primary mt-0.5">Uploading…</p> : null}
          {doc.error ? <p className="text-xs text-destructive mt-0.5">{doc.error}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {doc.status === "uploaded" ? (
            <>
              <button
                type="button"
                onClick={() => handleViewDoc(id)}
                className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 font-medium border border-gray-200 text-gray-600"
              >
                <Eye size={11} /> View
              </button>
              <button
                type="button"
                aria-label="Remove document"
                onClick={() => handleRemoveDoc(id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileRefs.current[id]?.click()}
                disabled={doc.status === "uploading"}
                className="flex items-center gap-1 text-xs bg-primary text-white rounded-lg px-3 py-1.5 font-medium disabled:opacity-50"
              >
                <Upload size={11} /> Upload
              </button>
              <input
                ref={(el) => {
                  fileRefs.current[id] = el;
                }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(id, file);
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-end">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <User size={18} />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        {invite.propertyLabel ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 flex gap-3 items-center">
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{invite.propertyLabel}</p>
              <p className="text-xs text-gray-500">Requested by {invite.requesterName}</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Upload Documents</h1>
          <p className="text-sm text-gray-500 mb-5">Upload each required item, review it with the view action, then send it directly.</p>
          <div className="space-y-2">{invite.requestedDocumentIds.map((id) => renderDocRow(id))}</div>
          {submitError ? <p className="text-sm text-destructive mt-4">{submitError}</p> : null}
          <Button
            type="button"
            className="w-full mt-6"
            disabled={!canSubmit || submitting}
            onClick={() => void handleFinalSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" /> Sending…
              </>
            ) : (
              "Send Documents"
            )}
          </Button>
        </div>
      </main>

      {bankModalOpen ? (
        <BankDetailsModal onSave={handleBankSave} onClose={() => setBankModalOpen(false)} />
      ) : null}

      {successOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Documents Submitted Successfully</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your documents have been submitted successfully.
              <br />
              <br />
              Please wait while the property owner/broker reviews your documents and prepares the agreement.
              <br />
              <br />
              You will be notified once your agreement is ready.
            </p>
            <Button type="button" className="w-full" onClick={() => void handleSuccessDone()} disabled={continuing}>
              {continuing ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Opening dashboard…
                </>
              ) : (
                "Go To Dashboard"
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
