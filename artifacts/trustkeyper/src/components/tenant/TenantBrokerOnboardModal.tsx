import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import {
  authOtpDigitEmptyClass,
  authOtpDigitFilledClass,
  authPrimaryButtonClass,
} from "@/components/auth/authStyles";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";
import { handleOtpKeyDown } from "@/lib/otpInput";
import { OtpVerifyReadyHint, useOtpVerifyReady } from "@/lib/otpVerifyReady";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/phoneOtp";
import { cn } from "@/lib/utils";

export type TenantOnboardModalPhase = "welcome" | "otp" | "account_success";

export function TenantBrokerOnboardModal({
  phase,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onClose,
  onOtpVerified,
  onAccountSuccessDone,
  sendOtpError,
  verifyOtpError,
  sendingOtp,
  onSendOtp,
}: {
  phase: TenantOnboardModalPhase;
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onClose?: () => void;
  onOtpVerified: (success: boolean) => void;
  onAccountSuccessDone: () => void;
  sendOtpError: string | null;
  verifyOtpError: string | null;
  sendingOtp: boolean;
  onSendOtp: () => Promise<boolean>;
}) {
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const { verifyReady, startVerifyReady, isVerifyReady } = useOtpVerifyReady();

  const phoneDigits = phone.replace(/\D/g, "").slice(-10);
  const nameValid = name.trim().length >= 2;
  const phoneValid = phoneDigits.length === 10;
  const canSendOtp = nameValid && phoneValid && agreed && !sendingOtp;
  const otpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (phase !== "otp") return;
    startVerifyReady();
  }, [phase, startVerifyReady]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (phase === "welcome") {
      setOtp(createEmptyOtp());
      setCountdown(0);
    }
  }, [phase]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value.replace(/\D/g, "");
    setOtp(next);
    if (value && index < OTP_LAST_INDEX) {
      document.getElementById(`tenant-onboard-otp-${index + 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    const err = await sendPhoneOtp(phoneDigits);
    if (err) return;
    setCountdown(10);
    setOtp(createEmptyOtp());
    startVerifyReady();
  };

  const handleVerifyOtp = async () => {
    if (!otpComplete || verifying || !isVerifyReady) return;
    setVerifying(true);
    try {
      const { error, accessToken } = await verifyPhoneOtp(phoneDigits, otp.join(""));
      if (error || !accessToken) {
        onOtpVerified(false);
        return;
      }
      onOtpVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOtpClick = async () => {
    if (!canSendOtp) return;
    const sent = await onSendOtp();
    if (!sent) return;
    setCountdown(10);
    setOtp(createEmptyOtp());
    startVerifyReady();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-onboard-modal-title"
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        ) : null}

        {phase === "account_success" ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created Successfully</h2>
            <p className="text-sm text-gray-500 mb-6">
              Let&apos;s capture your rental preferences so your broker can find the right property.
            </p>
            <Button
              type="button"
              className={authPrimaryButtonClass}
              onClick={onAccountSuccessDone}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <h2
              id="tenant-onboard-modal-title"
              className="text-xl font-semibold text-gray-900 text-center mb-1"
            >
              Welcome to TrustKeyper
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {phase === "welcome"
                ? "Let's understand your rental requirements so we can help you find the right property."
                : "Please share details to understand your rental preferences."}
            </p>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="tenant-onboard-name" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="tenant-onboard-name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  readOnly={phase === "otp"}
                  className={cn("h-10", phase === "otp" && "bg-gray-50")}
                />
              </div>
              <AuthPhoneField
                id="tenant-onboard-phone"
                value={phone}
                onChange={onPhoneChange}
                disabled={phase === "otp"}
                helperText={undefined}
                errorText={sendOtpError}
              />

              {phase === "otp" ? (
                <div className="space-y-2 pt-2">
                  <Label className="text-gray-700">Enter OTP</Label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`tenant-onboard-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) =>
                          handleOtpKeyDown(index, e, otp, setOtp, "tenant-onboard-otp", () => {
                            void handleVerifyOtp();
                          })
                        }
                        className={cn(
                          "w-11 h-11 sm:w-12 sm:h-12 text-center text-lg font-semibold rounded-lg outline-none transition-colors",
                          digit ? authOtpDigitFilledClass : authOtpDigitEmptyClass,
                        )}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Didn&apos;t receive verification OTP?{" "}
                    {countdown > 0 ? (
                      <span className="text-primary font-medium">Resending in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        className="text-primary font-medium hover:underline"
                        onClick={() => void handleResend()}
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                  {verifyOtpError ? (
                    <p className="text-xs text-center text-destructive">{verifyOtpError}</p>
                  ) : null}
                  <OtpVerifyReadyHint seconds={verifyReady} />
                </div>
              ) : (
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
                  <span className="text-sm text-gray-600 leading-snug">
                    I agree to share my contact details with the Owner and Broker
                  </span>
                </label>
              )}
            </div>

            {phase === "welcome" ? (
              <Button
                type="button"
                className={cn(authPrimaryButtonClass, "w-full")}
                disabled={!canSendOtp}
                onClick={() => void handleSendOtpClick()}
              >
                {sendingOtp ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Sending OTP…
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                className={cn(authPrimaryButtonClass, "w-full")}
                disabled={!otpComplete || verifying || !isVerifyReady}
                onClick={() => void handleVerifyOtp()}
              >
                {verifying ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" /> Verifying…
                  </>
                ) : (
                  <>Continue &rarr;</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
