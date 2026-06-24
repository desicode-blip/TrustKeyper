import type { TenantDocumentUploadStatus } from "@workspace/tenant-document-upload";
import type { DocumentUploadInvitePayload } from "@/lib/publicAgreementDocumentUpload";
import { getProperties } from "@/lib/properties";
import { getActiveSession, getSessionItem, storageKey } from "@/lib/storageKeys";

export type TenantDashboardPhase =
  | "no_property"
  | "documents_pending"
  | "documents_submitted"
  | "agreement_pending"
  | "agreement_ready"
  | "active_tenant";

export type TenantNotificationKind =
  | "no_property"
  | "documents_pending"
  | "documents_under_review"
  | "agreement_being_prepared"
  | "agreement_ready"
  | "agreement_signed"
  | "move_in_scheduled"
  | "maintenance_open"
  | "rent_due";

export interface TenantWorkspaceRecord {
  phone: string;
  tenantName: string;
  propertyId?: string;
  propertyLabel: string;
  propertyAddress?: string;
  propertyImage?: string;
  monthlyRent?: string;
  propertyStatus?: string;
  documentUploadToken?: string;
  documentUploadStatus?: TenantDocumentUploadStatus;
  documentUploadSubmittedAt?: number;
  requesterName?: string;
  requesterRole?: "owner" | "broker";
  updatedAt: number;
}

export interface TenantProgressStep {
  id: string;
  label: string;
  state: "complete" | "current" | "upcoming";
}

export interface TenantNotificationContent {
  kind: TenantNotificationKind;
  title: string;
  description: string;
}

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function workspaceStorageKey(digits: string): string {
  return `tk_${digits}_tenant_workspace`;
}

export function saveTenantWorkspace(record: TenantWorkspaceRecord): void {
  const digits = phoneDigits(record.phone);
  const payload = JSON.stringify({ ...record, phone: digits, updatedAt: Date.now() });
  localStorage.setItem(workspaceStorageKey(digits), payload);
  const session = getActiveSession();
  if (session && phoneDigits(session.phone) === digits && session.role === "tenant") {
    localStorage.setItem(storageKey(digits, "tenant", "tenant_workspace"), payload);
  }
}

export function getTenantWorkspaceForPhone(phone: string): TenantWorkspaceRecord | null {
  const digits = phoneDigits(phone);
  if (!digits) return null;
  const raw =
    localStorage.getItem(workspaceStorageKey(digits)) ??
    localStorage.getItem(storageKey(digits, "tenant", "tenant_workspace"));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TenantWorkspaceRecord;
  } catch {
    return null;
  }
}

export function getActiveTenantWorkspace(): TenantWorkspaceRecord | null {
  const session = getActiveSession();
  if (!session || session.role !== "tenant") return null;
  return getTenantWorkspaceForPhone(session.phone);
}

export function saveTenantWorkspaceFromInvite(
  invite: DocumentUploadInvitePayload,
  overrides?: Partial<TenantWorkspaceRecord>,
): TenantWorkspaceRecord {
  let propertyImage: string | undefined;
  let monthlyRent: string | undefined;
  let propertyAddress: string | undefined;
  let propertyStatus: string | undefined;

  if (invite.propertyId) {
    const property = getProperties().find((row) => row.id === invite.propertyId);
    if (property) {
      propertyImage = property.images?.[0];
      monthlyRent = property.monthlyRent;
      propertyAddress = [property.area, property.city].filter(Boolean).join(", ");
      propertyStatus = property.status === "Rented" ? "Occupied" : "Available";
    }
  }

  const record: TenantWorkspaceRecord = {
    phone: invite.tenantPhone,
    tenantName: invite.tenantName,
    propertyId: invite.propertyId,
    propertyLabel: invite.propertyLabel ?? "Assigned Property",
    propertyAddress,
    propertyImage,
    monthlyRent,
    propertyStatus,
    documentUploadToken: invite.token,
    documentUploadStatus: overrides?.documentUploadStatus ?? invite.tenantDocumentStatus,
    documentUploadSubmittedAt: overrides?.documentUploadSubmittedAt ?? invite.submittedAt,
    requesterName: invite.requesterName,
    requesterRole: invite.requesterRole,
    updatedAt: Date.now(),
    ...overrides,
  };
  saveTenantWorkspace(record);
  return record;
}

export function resolveTenantDashboardPhase(
  workspace: TenantWorkspaceRecord | null,
): TenantDashboardPhase {
  if (!workspace?.propertyLabel) return "no_property";
  const status = workspace.documentUploadStatus;
  if (!status || status === "document_request_sent") return "documents_pending";
  if (status === "documents_in_progress") return "documents_pending";
  if (status === "documents_submitted") return "documents_submitted";
  if (status === "agreement_ready") return "agreement_ready";
  return "agreement_pending";
}

export function resolveTenantProgressSteps(
  workspace: TenantWorkspaceRecord | null,
): TenantProgressStep[] {
  const status = workspace?.documentUploadStatus;
  const submitted =
    status === "documents_submitted" || status === "agreement_ready" || Boolean(workspace?.documentUploadSubmittedAt);
  const agreementReady = status === "agreement_ready";

  return [
    {
      id: "documents",
      label: "Document Upload",
      state: submitted ? "complete" : "current",
    },
    {
      id: "agreement",
      label: "Agreement Generation",
      state: agreementReady ? "complete" : submitted ? "current" : "upcoming",
    },
    {
      id: "review",
      label: "Review & Sign",
      state: agreementReady ? "current" : "upcoming",
    },
  ];
}

export function resolveTenantNotification(
  workspace: TenantWorkspaceRecord | null,
): TenantNotificationContent {
  if (!workspace?.propertyLabel) {
    return {
      kind: "no_property",
      title: "No property assigned yet",
      description:
        "Once your property owner or broker links you to a rental, your property details and next steps will appear here.",
    };
  }

  const status = workspace.documentUploadStatus;
  if (!status || status === "document_request_sent" || status === "documents_in_progress") {
    return {
      kind: "documents_pending",
      title: "Documents pending",
      description:
        "Upload your required documents using the secure link shared by your property owner or broker to continue.",
    };
  }

  if (status === "agreement_ready") {
    return {
      kind: "agreement_ready",
      title: "Agreement ready",
      description:
        "Your rental agreement is ready for review. You will receive a notification when it is available to sign.",
    };
  }

  if (status === "documents_submitted") {
    return {
      kind: "documents_under_review",
      title: "Documents Under Review",
      description:
        "You will receive an email and a dashboard notification once the digital agreement is ready for your signature.",
    };
  }

  return {
    kind: "agreement_being_prepared",
    title: "Agreement Being Prepared",
    description:
      "Your documents have been received. The property owner or broker is preparing your rental agreement.",
  };
}

export function getTenantDisplayName(): string {
  const fromSession = getSessionItem("name")?.trim();
  if (fromSession) return fromSession.replace(/!$/, "");
  const workspace = getActiveTenantWorkspace();
  if (workspace?.tenantName) return workspace.tenantName;
  return "there";
}

export function formatTenantRent(monthlyRent?: string): string {
  if (!monthlyRent) return "—";
  const amount = Number(monthlyRent);
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  return `₹${amount.toLocaleString("en-IN")}/month`;
}
