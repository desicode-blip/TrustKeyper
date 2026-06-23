import {
  DOC_UPLOAD_INVITES_KEY,
  type RequesterDocumentUploadInviteView,
  type TenantDocumentUploadStatus,
} from "@workspace/tenant-document-upload";
import { queueCloudSync } from "./cloudSync";
import { getItem, setItem } from "./storageKeys";

export { DOC_UPLOAD_INVITES_KEY as AGREEMENT_DOCUMENT_UPLOAD_INVITES_KEY };
export const AGREEMENT_DOCUMENT_UPLOAD_UPDATED_EVENT = "tk-agreement-document-upload-updated";

export type StoredDocumentUploadInvite = RequesterDocumentUploadInviteView;

function phoneLast10(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function readInvites(): StoredDocumentUploadInvite[] {
  try {
    const raw = getItem(DOC_UPLOAD_INVITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredDocumentUploadInvite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistInvites(invites: StoredDocumentUploadInvite[]): void {
  const payload = JSON.stringify(invites);
  setItem(DOC_UPLOAD_INVITES_KEY, payload);
  queueCloudSync(DOC_UPLOAD_INVITES_KEY, payload);
  window.dispatchEvent(new CustomEvent(AGREEMENT_DOCUMENT_UPLOAD_UPDATED_EVENT));
}

export function getStoredDocumentUploadInvites(): StoredDocumentUploadInvite[] {
  return readInvites();
}

export function findDocumentUploadInviteByToken(token: string): StoredDocumentUploadInvite | undefined {
  return readInvites().find((invite) => invite.token === token);
}

export function findDocumentUploadInviteByTenantPhone(phone: string): StoredDocumentUploadInvite | undefined {
  const digits = phoneLast10(phone);
  return readInvites().find((invite) => phoneLast10(invite.tenantPhone) === digits);
}

export function upsertStoredDocumentUploadInvite(invite: StoredDocumentUploadInvite): void {
  const invites = readInvites();
  const idx = invites.findIndex((row) => row.token === invite.token);
  if (idx === -1) {
    persistInvites([invite, ...invites]);
    return;
  }
  const next = [...invites];
  next[idx] = { ...next[idx], ...invite };
  persistInvites(next);
}

export function mergeStoredDocumentUploadInvites(serverInvites: StoredDocumentUploadInvite[]): void {
  if (serverInvites.length === 0) return;
  const byToken = new Map(readInvites().map((invite) => [invite.token, invite]));
  for (const invite of serverInvites) {
    const existing = byToken.get(invite.token);
    byToken.set(invite.token, existing ? { ...existing, ...invite } : invite);
  }
  const merged = [...byToken.values()].sort((a, b) => (b.submittedAt ?? b.linkSentAt ?? 0) - (a.submittedAt ?? a.linkSentAt ?? 0));
  persistInvites(merged);
}

export function inviteTenantDocumentStatus(invite: StoredDocumentUploadInvite): TenantDocumentUploadStatus {
  return invite.tenantDocumentStatus;
}
