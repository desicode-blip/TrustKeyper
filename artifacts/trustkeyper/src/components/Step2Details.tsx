import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthSignupActionBlock, AuthSignupStickyFooter } from "@/components/auth/AuthSignupActionBlock";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";
import { ALL_ROLES, profileExistsAsync, type Role } from "@/lib/auth";

interface Step2DetailsProps {
  details: { name: string; phone: string };
  setDetails: (details: { name: string; phone: string }) => void;
  onNext: () => void;
}

export default function Step2Details({ details, setDetails, onNext }: Step2DetailsProps) {
  const phoneDigits = details.phone.replace(/\D/g, "").slice(0, 10);
  const pending = sessionStorage.getItem("tk_pending_role");
  const signupRole = (pending && ALL_ROLES.includes(pending as Role) ? pending : "") as Role | "";
  const [duplicatePhone, setDuplicatePhone] = useState(false);

  useEffect(() => {
    if (signupRole === "" || phoneDigits.length !== 10) {
      setDuplicatePhone(false);
      return;
    }
    let cancelled = false;
    void profileExistsAsync(phoneDigits, signupRole).then((exists) => {
      if (!cancelled) setDuplicatePhone(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [phoneDigits, signupRole]);

  const isComplete =
    details.name.trim().length > 0 &&
    phoneDigits.length === 10 &&
    signupRole !== "" &&
    !duplicatePhone;

  const cta = (
    <Button size="lg" onClick={onNext} disabled={!isComplete} className={authPrimaryButtonClass}>
      Send OTP & Register &rarr;
    </Button>
  );

  return (
    <div className="flex flex-col h-full max-w-md pb-36 sm:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Let&apos;s know you better</h1>
      </div>

      <div className="space-y-6">
        <AuthTextField
          id="name"
          label="Your Name"
          value={details.name}
          onChange={(name) => setDetails({ ...details, name })}
        />
        <AuthPhoneField
          id="phone"
          value={phoneDigits}
          onChange={(phone) => setDetails({ ...details, phone })}
          errorText={duplicatePhone ? "An account already exists for this number." : null}
          helperText={duplicatePhone ? undefined : "We'll send an OTP to verify"}
        />
      </div>

      <div className="hidden sm:block mt-10">
        <AuthSignupActionBlock>{cta}</AuthSignupActionBlock>
      </div>
      <AuthSignupStickyFooter>{cta}</AuthSignupStickyFooter>
    </div>
  );
}
