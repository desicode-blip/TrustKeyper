import type {
  DocumentUploadRequesterRole,
  RequesterDocumentUploadInviteView,
} from "@workspace/tenant-document-upload";
import { getActiveSession } from "./storageKeys";
import { syncAuthHeaders } from "./syncSession";
import {
  mergeStoredDocumentUploadInvites,
  upsertStoredDocumentUploadInvite,
} from "./agreementDocumentUploadStore";

export function buildDocumentUploadShareMessage(tenantName: string, link: string): string {
  return `Hi ${tenantName},

To proceed with agreement generation, please upload your required documents through TrustKeyper using the secure link below.

${link}

Thank you.`;
}

export function getDocumentUploadWhatsAppHref(
  tenantPhone: string,
  tenantName: string,
  link: string,
): string {
  const digits = tenantPhone.replace(/\D/g, "").slice(-10);
  const message = encodeURIComponent(buildDocumentUploadShareMessage(tenantName, link));
  if (digits.length === 10) {
    return `https://wa.me/91${digits}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}

export function getDocumentUploadEmailHref(tenantName: string, link: string): string {
  const subject = encodeURIComponent("Upload your documents on TrustKeyper");
  const body = encodeURIComponent(buildDocumentUploadShareMessage(tenantName, link));
  return `mailto:?subject=${subject}&body=${body}`;
}

export function getDocumentUploadSmsHref(
  tenantPhone: string,
  tenantName: string,
  link: string,
): string {
  const digits = tenantPhone.replace(/\D/g, "").slice(-10);
  const body = encodeURIComponent(buildDocumentUploadShareMessage(tenantName, link));
  if (digits.length === 10) {
    return `sms:+91${digits}?body=${body}`;
  }
  return `sms:?body=${body}`;
}

export function getDocumentUploadTelegramHref(tenantName: string, link: string): string {
  const text = encodeURIComponent(buildDocumentUploadShareMessage(tenantName, link));
  const url = encodeURIComponent(link);
  return `https://t.me/share/url?url=${url}&text=${text}`;
}

export function documentUploadLinkFromToken(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://app.trustkeyper.com";
  return `${origin.replace(/\/$/, "")}/upload/documents/${token}`;
}

export type CreateDocumentUploadInviteResult =
  | {
      ok: true;
      inviteLink: string;
      token: string;
      tenantName: string;
      tenantPhone: string;
    }
  | {
      ok: false;
      error: "invalid_name" | "invalid_phone" | "duplicate_invite" | "no_session" | "unauthorized" | "server_error" | "network";
      detail?: string;
    };

export async function createAgreementDocumentUploadInvite(input: {
  tenantName: string;
  tenantPhone: string;
  requesterName: string;
  requesterRole: DocumentUploadRequesterRole;
  propertyId?: string;
  propertyLabel?: string;
  agreementDraftId?: string;
}): Promise<CreateDocumentUploadInviteResult> {
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";
  const session = getActiveSession();
  if (!session || (session.role !== "owner" && session.role !== "broker")) {
    return { ok: false, error: "no_session" };
  }

  try {
    const headers = await syncAuthHeaders("application/json");
    if (!headers) return { ok: false, error: "unauthorized" };

    const res = await fetch(
      `${API_BASE}/tenant-document-upload/create/${session.phone}/${session.role}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          tenantName: input.tenantName,
          tenantPhone: input.tenantPhone,
          requesterName: input.requesterName,
          propertyId: input.propertyId,
          propertyLabel: input.propertyLabel,
          agreementDraftId: input.agreementDraftId,
        }),
      },
    );

    const json = (await res.json()) as {
      inviteLink?: string;
      invite?: { token: string; tenantName: string; tenantPhone: string };
      error?: string;
      code?: string;
    };

    if (!res.ok) {
      const code = json.code;
      if (code === "duplicate_invite") return { ok: false, error: "duplicate_invite", detail: json.error };
      if (res.status === 401 || res.status === 403) return { ok: false, error: "unauthorized", detail: json.error };
      return { ok: false, error: "server_error", detail: json.error };
    }

    const token = json.invite?.token;
    const inviteLink = json.inviteLink ?? (token ? documentUploadLinkFromToken(token) : "");
    if (!token || !inviteLink) {
      return { ok: false, error: "server_error", detail: "Missing invite token" };
    }

    upsertStoredDocumentUploadInvite({
      token,
      tenantName: json.invite?.tenantName ?? input.tenantName,
      tenantPhone: json.invite?.tenantPhone ?? input.tenantPhone,
      status: "link_sent",
      tenantDocumentStatus: "document_request_sent",
      requestedDocumentIds: ["aadhaar", "pan", "bank"],
      documentStatuses: { aadhaar: "not_uploaded", pan: "not_uploaded", bank: "not_uploaded" },
      documents: {},
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
      inviteLink,
      propertyId: input.propertyId,
      propertyLabel: input.propertyLabel,
    });

    return {
      ok: true,
      inviteLink,
      token,
      tenantName: json.invite?.tenantName ?? input.tenantName,
      tenantPhone: json.invite?.tenantPhone ?? input.tenantPhone,
    };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function fetchRequesterDocumentUploadInvites(): Promise<
  | { ok: true; invites: RequesterDocumentUploadInviteView[] }
  | { ok: false; error: "no_session" | "unauthorized" | "network" }
> {
  const session = getActiveSession();
  if (!session || (session.role !== "owner" && session.role !== "broker")) {
    return { ok: false, error: "no_session" };
  }

  try {
    const headers = await syncAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";
    const res = await fetch(
      `${API_BASE}/tenant-document-upload/requester/${session.phone}/${session.role}`,
      { headers },
    );
    const json = (await res.json()) as { ok?: boolean; invites?: RequesterDocumentUploadInviteView[] };
    if (!res.ok || !json.invites) return { ok: false, error: "unauthorized" };

    mergeStoredDocumentUploadInvites(json.invites);
    return { ok: true, invites: json.invites };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function fetchRequesterDocumentUploadDetail(token: string): Promise<
  | { ok: true; invite: RequesterDocumentUploadInviteView }
  | { ok: false; error: "no_session" | "unauthorized" | "not_found" | "network" }
> {
  const session = getActiveSession();
  if (!session || (session.role !== "owner" && session.role !== "broker")) {
    return { ok: false, error: "no_session" };
  }

  try {
    const headers = await syncAuthHeaders();
    if (!headers) return { ok: false, error: "unauthorized" };

    const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";
    const res = await fetch(
      `${API_BASE}/tenant-document-upload/requester/${session.phone}/${session.role}/${encodeURIComponent(token)}`,
      { headers },
    );
    const json = (await res.json()) as { ok?: boolean; invite?: RequesterDocumentUploadInviteView };
    if (res.status === 404) return { ok: false, error: "not_found" };
    if (!res.ok || !json.invite) return { ok: false, error: "unauthorized" };

    upsertStoredDocumentUploadInvite(json.invite);
    return { ok: true, invite: json.invite };
  } catch {
    return { ok: false, error: "network" };
  }
}
