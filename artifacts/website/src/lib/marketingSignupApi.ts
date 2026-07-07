import { getMarketingApiBase } from "@/lib/marketingAuthLookup";
import type { MarketingAuthRole } from "@/lib/marketingAuthRoles";

export interface MarketingSignupProfileData {
  name: string;
  phone: string;
  firm?: string;
  propertyCount?: string;
  email?: string;
  bankHolderName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  upiId?: string;
  upiQrFileName?: string;
  propertyIntent?: string;
}

function emptyProfileFields(): Record<string, string> {
  return {
    firm: "",
    email: "",
    bankHolderName: "",
    bankName: "",
    bankAccountNumber: "",
    bankIFSC: "",
    upiId: "",
    upiQrFileName: "",
    propertyIntent: "",
  };
}

export function buildOwnerSignupProfile(
  phone: string,
  name: string,
  propertyCount: string,
): MarketingSignupProfileData {
  return {
    ...emptyProfileFields(),
    name: name.trim(),
    phone,
    propertyCount,
  };
}

export function buildBrokerSignupProfile(
  phone: string,
  name: string,
  firm: string,
): MarketingSignupProfileData {
  return {
    ...emptyProfileFields(),
    name: name.trim(),
    phone,
    firm: firm.trim(),
  };
}

export async function pushMarketingSignupProfile({
  phone,
  role,
  profile,
  accessToken,
}: {
  phone: string;
  role: MarketingAuthRole;
  profile: MarketingSignupProfileData;
  accessToken: string | null | undefined;
}): Promise<{ ok: boolean; error?: string }> {
  if (!accessToken) {
    return { ok: false, error: "Missing verification session. Please log in again." };
  }

  try {
    const res = await fetch(
      `${getMarketingApiBase()}/sync/accounts/${phone}/${role}/profile`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ value: JSON.stringify(profile) }),
      },
    );
    if (!res.ok) {
      return { ok: false, error: "Could not create your account. Please try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not create your account. Please try again." };
  }
}
