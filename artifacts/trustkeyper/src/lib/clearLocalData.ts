const LEGACY_LOCAL_KEYS = [
  "broker_properties",
  "broker_tenants",
  "broker_agreements",
  "broker_profile_v1",
  "broker_agreement_draft",
  "broker_add_property_data",
  "broker_add_tenant_draft",
  "trustkeyper_onboarding_data",
  "broker_name",
  "broker_firm",
  "broker_phone",
  "owner_name",
  "owner_phone",
  "owner_contact",
  "login_phone",
  "agreement_pending_property",
  "agreement_edit_draft",
];

const LEGACY_SESSION_KEYS = [
  ...LEGACY_LOCAL_KEYS,
  "tk_pending_role",
  "tk_active_phone",
  "tk_active_role",
  "tk_session_backup_phone",
  "tk_session_backup_role",
  "tk_legacy_storage_migrated_v1",
];

function removeMatchingKeys(storage: Storage, predicate: (key: string) => boolean): void {
  const toRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && predicate(key)) toRemove.push(key);
  }
  for (const key of toRemove) storage.removeItem(key);
}

/** Clear all TrustKeyper auth and app data in this browser (local + session). */
export function clearAllLocalTrustKeyperData(): void {
  if (typeof window === "undefined") return;

  removeMatchingKeys(localStorage, (key) => key.startsWith("tk_"));
  removeMatchingKeys(sessionStorage, (key) => key.startsWith("tk_"));

  for (const key of LEGACY_LOCAL_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  for (const key of LEGACY_SESSION_KEYS) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
