import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";
import { profileExistsAsync } from "@/lib/auth";

interface OwnerStep3DetailsProps {
  details: { name: string; phone: string };
  setDetails: (details: { name: string; phone: string }) => void;
  onNext: () => void;
}

export default function OwnerStep3Details({ details, setDetails, onNext }: OwnerStep3DetailsProps) {
  const digits = details.phone.replace(/\D/g, "").slice(0, 10);
  const [duplicateOwnerPhone, setDuplicateOwnerPhone] = useState(false);

  useEffect(() => {
    if (digits.length !== 10) {
      setDuplicateOwnerPhone(false);
      return;
    }
    let cancelled = false;
    void profileExistsAsync(digits, "owner").then((exists) => {
      if (!cancelled) setDuplicateOwnerPhone(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [digits]);

  const isComplete = details.name.trim().length > 0 && digits.length === 10 && !duplicateOwnerPhone;

  const cta = (
    <Button size="lg" onClick={onNext} disabled={!isComplete} className={authPrimaryButtonClass}>
      Send OTP & Register &rarr;
    </Button>
  );

  return (
    <div className="flex flex-col h-full max-w-2xl pb-40 sm:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Let&apos;s know you better</h1>
      </div>

      <div className="space-y-6 max-w-md">
        <AuthTextField
          id="name"
          label="Your Name"
          value={details.name}
          onChange={(name) => setDetails({ ...details, name })}
        />
        <AuthPhoneField
          id="phone"
          value={digits}
          onChange={(phone) => setDetails({ ...details, phone })}
          errorText={duplicateOwnerPhone ? "An account already exists for this number." : null}
          helperText={duplicateOwnerPhone ? undefined : "We'll send an OTP to verify"}
        />
      </div>

      <AuthSignupScreenFooter cta={cta} persistRole="owner" />
    </div>
  );
}
