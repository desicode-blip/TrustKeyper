import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthSignupActionBlock, AuthSignupStickyFooter } from "@/components/auth/AuthSignupActionBlock";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";

interface Step3OTPProps {
  details: { name: string; phone: string };
  onNext: () => void;
}

export default function Step3OTP({ details, onNext }: Step3OTPProps) {
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(10);
  const phoneDigits = details.phone.replace(/\D/g, "").slice(0, 10);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LAST_INDEX) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  const cta = (
    <Button
      size="lg"
      onClick={onNext}
      disabled={!isComplete}
      className={authPrimaryButtonClass}
    >
      Continue &rarr;
    </Button>
  );

  return (
    <div className="flex flex-col h-full max-w-md pb-36 sm:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Let&apos;s know you better</h1>
      </div>

      <div className="space-y-6 mb-6 opacity-70 pointer-events-none">
        <AuthTextField id="otp-name" label="Your Name" value={details.name} onChange={() => {}} disabled />
        <AuthPhoneField
          id="otp-phone"
          value={phoneDigits}
          onChange={() => {}}
          disabled
          helperText=""
        />
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Enter the OTP that we have sent to{" "}
          <span className="font-semibold text-gray-900">+91 {phoneDigits}</span>
        </p>

        <div className="flex gap-4 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              className={`w-14 h-14 text-center text-xl font-medium rounded-lg border outline-none transition-colors
                ${digit ? "bg-[#E8F5EE] border-accent border-b-4" : "bg-white border-gray-300 focus:border-primary"}`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600">
          Didn&apos;t receive the verification OTP?{" "}
          {countdown > 0 ? (
            <span className="font-medium text-primary">Resend otp in {countdown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => setCountdown(10)}
              className="font-medium text-primary hover:underline"
            >
              Resend otp
            </button>
          )}
        </p>
      </div>

      <div className="hidden sm:block mt-10">
        <AuthSignupActionBlock showTerms={false}>{cta}</AuthSignupActionBlock>
      </div>
      <AuthSignupStickyFooter showTerms={false}>{cta}</AuthSignupStickyFooter>
    </div>
  );
}
