/** Cross-page “resume” items for broker dashboards (local/session storage). */

export const BROKER_PENDING_FLOWS_EVENT = "broker-pending-flows";

export type PendingFlowKind = "agreement" | "add_property" | "add_tenant";

export interface PendingFlowItem {
  kind: PendingFlowKind;
  title: string;
  continueHref: string;
}

const PROPERTY_DRAFT_KEY = "broker_add_property_data";
const TENANT_DRAFT_KEY = "broker_add_tenant_draft";

export function broadcastBrokerPendingFlowsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BROKER_PENDING_FLOWS_EVENT));
}

function hasMeaningfulPropertyDraft(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const d = JSON.parse(raw) as Record<string, unknown>;
    const sub = typeof d.subStep === "number" ? d.subStep : 0;
    const addr = typeof d.address === "string" ? d.address.trim() : "";
    const owner = typeof d.ownerName === "string" ? d.ownerName.trim() : "";
    const nick = typeof d.nickname === "string" ? d.nickname.trim() : "";
    return sub > 0 || addr.length >= 3 || nick.length >= 1 || owner.length >= 1;
  } catch {
    return false;
  }
}

function hasMeaningfulTenantDraft(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const d = JSON.parse(raw) as Record<string, unknown>;
    const step = typeof d.step === "number" ? d.step : 1;
    const name = typeof d.name === "string" ? d.name.trim() : "";
    const phone = typeof d.phone === "string" ? d.phone.trim() : "";
    return name.length >= 1 || phone.length >= 1 || step > 1;
  } catch {
    return false;
  }
}

/** True when an agreement draft exists and the flow was not finished (sent). */
export function hasPendingAgreementDraft(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("broker_agreement_draft");
    if (!raw) return false;
    const d = JSON.parse(raw) as {
      sentCompleted?: boolean;
      step?: number;
      selectedPropertyId?: string | null;
    };
    if (d.sentCompleted) return false;
    if (typeof d.step !== "number" || d.step < 1 || d.step > 6) return false;
    return !!d.selectedPropertyId;
  } catch {
    return false;
  }
}

export function getPendingFlowItems(): PendingFlowItem[] {
  if (typeof window === "undefined") return [];
  const items: PendingFlowItem[] = [];

  if (hasPendingAgreementDraft()) {
    items.push({
      kind: "agreement",
      title: "Agreement generation is pending — pick up where you left off.",
      continueHref: "/broker/agreements/generate?resume=1",
    });
  }

  try {
    const prop = sessionStorage.getItem(PROPERTY_DRAFT_KEY);
    if (hasMeaningfulPropertyDraft(prop)) {
      items.push({
        kind: "add_property",
        title: "Property listing is pending — continue adding the property.",
        continueHref: "/broker/properties/add2",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const ten = sessionStorage.getItem(TENANT_DRAFT_KEY);
    if (hasMeaningfulTenantDraft(ten)) {
      items.push({
        kind: "add_tenant",
        title: "Tenant onboarding is pending — continue adding the tenant.",
        continueHref: "/broker/tenants/add",
      });
    }
  } catch {
    /* ignore */
  }

  return items;
}

export function clearAgreementDraftStorage(): void {
  try {
    localStorage.removeItem("broker_agreement_draft");
  } catch {
    /* ignore */
  }
  broadcastBrokerPendingFlowsUpdated();
}
