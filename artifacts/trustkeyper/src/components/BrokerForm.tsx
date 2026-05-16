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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthTermsText } from "@/components/AuthTermsText";

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
    fullName.trim().length > 0 &&
    phoneDigits.length === 10 &&
    !duplicateSignupPhone;

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
    if (!isOtpComplete) return;
    const pending = sessionStorage.getItem("tk_pending_role") || "broker";
    const role = (ALL_ROLES.includes(pending as Role) ? pending : "broker") as Role;
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

  return (
    <div className="flex flex-col h-full max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Tell us about you
        </h1>
        <p className="text-gray-500">Help us set up your broker profile</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-700">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={otpStage}
            className={`${otpStage ? "bg-blue-50/60" : "bg-white"}`}
          />
          <p className="text-xs text-gray-500">As per government ID</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firm" className="text-gray-700">
            Brokerage Firm (Optional)
          </Label>
          <Input
            id="firm"
            placeholder="e.g., ABC Realty, Independent Broker"
            value={firm}
            onChange={(e) => setFirm(e.target.value)}
            disabled={otpStage}
            className={`${otpStage ? "bg-blue-50/60" : "bg-white"}`}
          />
          <p className="text-xs text-gray-500">
            Leave blank if you&apos;re an independent broker
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div
              className={`w-16 flex items-center justify-center rounded-md border border-input text-gray-700 ${
                otpStage ? "bg-blue-50/60" : "bg-gray-50"
              }`}
            >
              +91
            </div>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              disabled={otpStage}
              className={`flex-1 ${otpStage ? "bg-blue-50/60" : "bg-white"}`}
            />
          </div>
          {duplicateSignupPhone && !otpStage ? (
            <p className="text-sm text-destructive">An account already exists for this number.</p>
          ) : (
            <p className="text-xs text-gray-500">We&apos;ll send an OTP to verify</p>
          )}
        </div>
      </div>

      {!otpStage && (
        <>
          <div className="hidden sm:block mt-10">
            <Button
              size="lg"
              onClick={handleSendOtp}
              disabled={!formValid}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Send OTP & Register
            </Button>
            <AuthTermsText />
          </div>

          <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
            <Button
              size="lg"
              onClick={handleSendOtp}
              disabled={!formValid}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Send OTP & Register
            </Button>
            <AuthTermsText className="mt-4 text-center" />
          </div>
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
                <span className="font-medium text-[#2563EB]">Resend otp in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCountdown(10)}
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  Resend otp
                </button>
              )}
            </p>
          </div>

          <div className="hidden sm:block">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!isOtpComplete}
              className="w-48 bg-primary hover:bg-primary/90"
            >
              Continue &rarr;
            </Button>
            <AuthTermsText />
          </div>

          <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!isOtpComplete}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue &rarr;
            </Button>
            <AuthTermsText className="mt-4 text-center" />
          </div>
        </>
      )}
    </div>
  );
}
