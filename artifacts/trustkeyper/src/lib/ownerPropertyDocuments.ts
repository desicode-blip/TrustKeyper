import { queueCloudSync } from "@/lib/cloudSync";
import { getAgreements } from "@/lib/agreements";
import { getItem, getSessionItem, setItem, setSessionItem } from "@/lib/storageKeys";

export interface OwnerUploadedDocument {
  id: string;
  propertyId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  dataUrl?: string;
}

export type PropertyDocumentListItem =
  | {
      id: string;
      kind: "upload";
      propertyId: string;
      fileName: string;
      fileSize: number;
      uploadedAt: number;
      dataUrl?: string;
    }
  | {
      id: string;
      kind: "agreement";
      propertyId: string;
      fileName: string;
      uploadedAt: number;
      agreementId: string;
      dataUrl?: string;
    };

const STORAGE_KEY = "owner_property_documents";

function readAll(): OwnerUploadedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getItem(STORAGE_KEY) ?? getSessionItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OwnerUploadedDocument[]) : [];
  } catch {
    return [];
  }
}

function persist(list: OwnerUploadedDocument[]): void {
  try {
    const payload = JSON.stringify(list);
    setItem(STORAGE_KEY, payload);
    setSessionItem(STORAGE_KEY, payload);
    queueCloudSync(STORAGE_KEY, payload);
  } catch {
    /* ignore */
  }
}

export function getUploadedDocumentsForProperty(propertyId: string): OwnerUploadedDocument[] {
  return readAll().filter((d) => d.propertyId === propertyId);
}

export function addUploadedDocument(
  propertyId: string,
  file: File,
  onReady?: () => void,
): void {
  const reader = new FileReader();
  reader.onload = () => {
    const doc: OwnerUploadedDocument = {
      id: `pdoc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      propertyId,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: Date.now(),
      dataUrl: typeof reader.result === "string" ? reader.result : undefined,
    };
    persist([doc, ...readAll()]);
    onReady?.();
  };
  reader.readAsDataURL(file);
}

export function removeUploadedDocument(documentId: string): void {
  persist(readAll().filter((d) => d.id !== documentId));
}

export function listPropertyDocuments(propertyId: string): PropertyDocumentListItem[] {
  const uploads: PropertyDocumentListItem[] = getUploadedDocumentsForProperty(propertyId).map((d) => ({
    id: d.id,
    kind: "upload" as const,
    propertyId: d.propertyId,
    fileName: d.fileName,
    fileSize: d.fileSize,
    uploadedAt: d.uploadedAt,
    dataUrl: d.dataUrl,
  }));

  const agreementDocs: PropertyDocumentListItem[] = getAgreements()
    .filter((a) => a.propertyId === propertyId)
    .map((a) => {
      const attached = a.documents?.[0];
      return {
        id: `agr_doc_${a.id}`,
        kind: "agreement" as const,
        propertyId,
        fileName: attached?.name ?? `Rental Agreement – ${a.tenantName || "Tenant"}.pdf`,
        uploadedAt: a.createdAt,
        agreementId: a.id,
        dataUrl: attached?.dataUrl,
      };
    });

  return [...agreementDocs, ...uploads].sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export function formatDocSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
