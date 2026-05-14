import { getItem, getSessionItem, setItem, setSessionItem } from "./storageKeys";

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

const defaults: BrokerProfile = {
  name: "",
  firm: "",
  phone: "",
  email: "",
  bankHolderName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIFSC: "",
  upiId: "",
  upiQrFileName: "",
};

export function getBrokerProfile(): BrokerProfile {
  try {
    const raw = getItem("profile");
    const stored = raw ? (JSON.parse(raw) as Partial<BrokerProfile>) : {};
    const name = stored.name || getSessionItem("name") || "";
    const firm = stored.firm || getSessionItem("firm") || "";
    const phone = stored.phone || getSessionItem("phone") || "";
    return { ...defaults, ...stored, name, firm, phone };
  } catch {
    return {
      ...defaults,
      name: getSessionItem("name") || "",
      firm: getSessionItem("firm") || "",
      phone: getSessionItem("phone") || "",
    };
  }
}

export function saveBrokerProfile(profile: BrokerProfile): void {
  try {
    setItem("profile", JSON.stringify(profile));
    setSessionItem("name", profile.name);
    setSessionItem("firm", profile.firm);
    setSessionItem("phone", profile.phone);
  } catch {}
}

export function hasBankDetails(): boolean {
  const p = getBrokerProfile();
  return !!(p.bankName && p.bankAccountNumber && p.bankIFSC);
}
