import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";
import { handleOtpKeyDown } from "@/lib/otpInput";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/phoneOtp";
import { setTenantShareSession, type TenantShareSession } from "@/lib/tenantShareSession";

type Step = "details" | "otp" | "verified";

export function TenantPropertyVerification({
  propertyId,
  onVerified,
  onCancel,
}: {
  propertyId: string;
  onVerified: (session: TenantShareSession) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.replace(/\D/g, "").length === 10;
  const canSendOtp = nameValid && phoneValid && consent && !loading;

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LAST_INDEX) {
      document.getElementById(`tenant-share-otp-${index + 1}`)?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!canSendOtp) return;
    setError(null);
    setLoading(true);
    const err = await sendPhoneOtp(phone);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setStep("otp");
    setCountdown(29);
    setOtp(createEmptyOtp());
  };

  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== OTP_LAST_INDEX + 1) return;
    setError(null);
    setLoading(true);
    const { error: verifyError } = await verifyPhoneOtp(phone, token);
    setLoading(false);
    if (verifyError) {
      setError(verifyError);
      return;
    }
    const session: TenantShareSession = {
      propertyId,
      name: name.trim(),
      phone: `+91${phone.replace(/\D/g, "").slice(-10)}`,
      verifiedAt: Date.now(),
    };
    setTenantShareSession(session);
    setStep("verified");
    window.setTimeout(() => onVerified(session), 900);
  };

  const otpComplete = otp.every((d) => d.length === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 z-10"
            aria-label="Close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        ) : null}

        {step === "verified" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Account verified</h2>
            <p className="text-sm text-gray-500">Loading property details…</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 pt-10">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
              Welcome to TrustKeyper
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              For a better experience, continue with your mobile number.
            </p>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="tenant-share-name" className="text-gray-700">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tenant-share-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  disabled={step === "otp"}
                  className="h-10"
                />
              </div>
              <AuthPhoneField
                id="tenant-share-phone"
                value={phone}
                onChange={setPhone}
                disabled={step === "otp"}
                helperText={step === "details" ? "We'll send an OTP to verify" : undefined}
                errorText={step === "details" && error ? error : null}
              />
              {step === "details" ? (
                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-600 leading-snug">
                    I agree to receive updates about this property and more.
                  </span>
                </label>
              ) : null}
            </div>

            {step === "otp" ? (
              <div className="mb-6 animate-in fade-in duration-200">
                <p className="text-sm font-medium text-gray-800 mb-3">Enter OTP</p>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`tenant-share-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) =>
                        handleOtpKeyDown(i, e, otp, setOtp, "tenant-share-otp", handleVerifyOtp)
                      }
                      className={`w-full h-11 text-center text-lg font-medium rounded-lg border outline-none transition-colors ${
                        digit
                          ? "bg-[#E8F5EE] border-gray-200 border-b-[3px] border-b-[#22C55E]"
                          : "bg-white border-gray-300 focus:border-primary"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  An OTP has been sent to your mobile number +91 {phone}
                </p>
                <p className="text-xs text-gray-500">
                  Didn&apos;t receive code?{" "}
                  {countdown > 0 ? (
                    <span className="text-primary font-medium">Resend again in 0:{String(countdown).padStart(2, "0")}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleSendOtp()}
                      className="text-primary font-medium hover:underline"
                    >
                      Resend again
                    </button>
                  )}
                </p>
                {error ? <p className="text-sm text-destructive mt-2">{error}</p> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              {step === "details" ? (
                <Button
                  type="button"
                  className="w-full h-11 rounded-[4px] font-semibold"
                  disabled={!canSendOtp}
                  onClick={() => void handleSendOtp()}
                >
                  {loading ? (
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
                  className="w-full h-11 rounded-[4px] font-semibold"
                  disabled={!otpComplete || loading}
                  onClick={() => void handleVerifyOtp()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" /> Verifying…
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              )}
              {onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-[4px] font-semibold"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
