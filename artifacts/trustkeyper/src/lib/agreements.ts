export type AgreementStatus = "Draft" | "Sent" | "Signed" | "Expired";

export interface Agreement {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  ownerContact: string;
  tenantId?: string;
  tenantName: string;
  tenantContact: string;
  tenantAadhaar?: string;
  tenantPan?: string;
  coTenantName?: string;
  coTenantContact?: string;
  startDate: string;
  endDate?: string;
  monthlyRent: string;
  securityDeposit: string;
  lockInPeriod: string;
  noticePeriod: string;
  rentDueDay: string;
  maintenanceCharges?: string;
  brokerageAmount: string;
  brokeragePaidBy: "Owner" | "Tenant" | "Both";
  brokerageMode: "Cash" | "Bank Transfer" | "UPI";
  documents?: { name: string; dataUrl: string }[];
  customText?: string;
  status: AgreementStatus;
  createdAt: number;
}

const KEY = "broker_agreements";

export function getAgreements(): Agreement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Agreement[]) : [];
  } catch {
    return [];
  }
}

export function updateAgreement(id: string, patch: Partial<Agreement>): void {
  const list = getAgreements();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch };
  try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function addAgreement(
  a: Omit<Agreement, "id" | "createdAt" | "status"> & { status?: AgreementStatus },
): Agreement {
  const agreement: Agreement = {
    ...a,
    id: `agr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: a.status ?? "Draft",
  };
  const list = getAgreements();
  list.unshift(agreement);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  return agreement;
}
