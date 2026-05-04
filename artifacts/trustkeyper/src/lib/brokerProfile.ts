export interface BrokerProfile {
  name: string;
  firm: string;
  phone: string;
  email: string;
  // Bank
  bankHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  // UPI
  upiId: string;
  upiQrFileName: string;
}

const KEY = "broker_profile_v1";

const defaults: BrokerProfile = {
  name: "", firm: "", phone: "", email: "",
  bankHolderName: "", bankName: "", bankAccountNumber: "", bankIFSC: "",
  upiId: "", upiQrFileName: "",
};

export function getBrokerProfile(): BrokerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<BrokerProfile>) : {};
    // Merge sessionStorage basics set during onboarding
    const name = stored.name || sessionStorage.getItem("broker_name") || "";
    const firm = stored.firm || sessionStorage.getItem("broker_firm") || "";
    const phone = stored.phone || sessionStorage.getItem("broker_phone") || "";
    return { ...defaults, ...stored, name, firm, phone };
  } catch {
    return {
      ...defaults,
      name: sessionStorage.getItem("broker_name") || "",
      firm: sessionStorage.getItem("broker_firm") || "",
      phone: sessionStorage.getItem("broker_phone") || "",
    };
  }
}

export function saveBrokerProfile(profile: BrokerProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    // Keep sessionStorage in sync
    sessionStorage.setItem("broker_name", profile.name);
    sessionStorage.setItem("broker_firm", profile.firm);
    sessionStorage.setItem("broker_phone", profile.phone);
  } catch {}
}

export function hasBankDetails(): boolean {
  const p = getBrokerProfile();
  return !!(p.bankName && p.bankAccountNumber && p.bankIFSC);
}
