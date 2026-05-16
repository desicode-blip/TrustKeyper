import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import {
  profileExistsAsync,
  signUpSuccess,
  dashboardRouteFor,
  ALL_ROLES,
  type Role,
} from "@/lib/auth";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";
import { Button } from "@/components/ui/button";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthSignupActionBlock, AuthSignupStickyFooter } from "@/components/auth/AuthSignupActionBlock";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";

interface BrokerFormProps {
  onComplete?: () => void;
}

export default function BrokerForm({ onComplete }: BrokerFormProps) {
  const [fullName, setFullName] = useState("");
  const [firm, setFirm] = useState("");
  const [phone, setPhone] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);
  const pendingRole = sessionStorage.getItem("tk_pending_role") || "broker";
  const signupRole = (ALL_ROLES.includes(pendingRole as Role) ? pendingRole : "broker") as Role;
  const [duplicateSignupPhone, setDuplicateSignupPhone] = useState(false);

  useEffect(() => {
    if (phoneDigits.length !== 10) {
      setDuplicateSignupPhone(false);
      return;
    }
    let cancelled = false;
    void profileExistsAsync(phoneDigits, signupRole).then((exists) => {
      if (!cancelled) setDuplicateSignupPhone(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [phoneDigits, signupRole]);

  const formValid =
    fullName.trim().length > 0 && phoneDigits.length === 10 && !duplicateSignupPhone;

  useEffect(() => {
    if (!otpStage || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, otpStage]);

  const handleSendOtp = () => {
    if (!formValid) return;
    if (duplicateSignupPhone) return;
    setOtpStage(true);
    setCountdown(12);
  };

  const isOtpComplete = otp.every((d) => d !== "");

  const handleContinue = async () => {
    if (!isOtpComplete || submitting) return;
    const pending = sessionStorage.getItem("tk_pending_role") || "broker";
    const role = (ALL_ROLES.includes(pending as Role) ? pending : "broker") as Role;
    setSubmitting(true);
    try {
      if (await profileExistsAsync(phoneDigits, role)) {
        toast({
          title: "An account already exists for this number.",
          variant: "destructive",
        });
        setOtp(createEmptyOtp());
        return;
      }
      await signUpSuccess(phoneDigits, role, {
        name: fullName,
        firm,
        phone: phoneDigits,
        email: "",
        bankHolderName: "",
        bankName: "",
        bankAccountNumber: "",
        bankIFSC: "",
        upiId: "",
        upiQrFileName: "",
      });
      onComplete?.();
      setLocation(dashboardRouteFor(role));
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LAST_INDEX) {
      document.getElementById(`broker-otp-${index + 1}`)?.focus();
    }
  };

  const sendOtpButton = (
    <Button
      size="lg"
      onClick={handleSendOtp}
      disabled={!formValid}
      className={authPrimaryButtonClass}
    >
      Send OTP & Register &rarr;
    </Button>
  );

  const continueButton = (
    <Button
      size="lg"
      onClick={() => void handleContinue()}
      disabled={!isOtpComplete || submitting}
      className={authPrimaryButtonClass}
    >
      Continue &rarr;
    </Button>
  );

  return (
    <div className="flex flex-col h-full max-w-xl pb-36 sm:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Tell us about you</h1>
        <p className="text-gray-500">Help us set up your broker profile</p>
      </div>

      <div className="space-y-6">
        <AuthTextField
          id="fullName"
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          placeholder="Enter your full name"
          disabled={otpStage}
          required
          helperText="As per government ID"
        />

        <AuthTextField
          id="firm"
          label="Brokerage Firm (Optional)"
          value={firm}
          onChange={setFirm}
          placeholder="e.g., ABC Realty, Independent Broker"
          disabled={otpStage}
          helperText="Leave blank if you're an independent broker"
        />

        <AuthPhoneField
          id="phone"
          value={phoneDigits}
          onChange={setPhone}
          disabled={otpStage}
          required
          errorText={
            duplicateSignupPhone && !otpStage ? "An account already exists for this number." : null
          }
          helperText={
            duplicateSignupPhone && !otpStage ? undefined : "We'll send an OTP to verify"
          }
        />
      </div>

      {!otpStage && (
        <>
          <div className="hidden sm:block mt-10">
            <AuthSignupActionBlock>{sendOtpButton}</AuthSignupActionBlock>
          </div>
          <AuthSignupStickyFooter>{sendOtpButton}</AuthSignupStickyFooter>
        </>
      )}

      {otpStage && (
        <>
          <div className="mb-8 mt-8">
            <p className="text-gray-600 mb-4">
              Enter the OTP that we have sent to{" "}
              <span className="font-semibold text-gray-900">+91 {phoneDigits}</span>
            </p>

            <div className="flex gap-4 mb-6">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`broker-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className={`w-14 h-14 text-center text-xl font-medium rounded-lg border outline-none transition-colors
                    ${
                      d
                        ? "bg-[#E8F5EE] border-accent border-b-4"
                        : "bg-white border-gray-300 focus:border-primary"
                    }`}
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
            <AuthSignupActionBlock showTerms={false}>{continueButton}</AuthSignupActionBlock>
          </div>
          <AuthSignupStickyFooter showTerms={false}>{continueButton}</AuthSignupStickyFooter>
        </>
      )}
    </div>
  );
}
