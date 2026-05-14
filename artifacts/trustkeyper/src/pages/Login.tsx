import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthFlowLayout } from "@/components/AuthFlowLayout";
import { AuthGoToSignupLink } from "@/components/AuthFlowFooterLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!otpSent || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, otpSent]);

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);
  const canRequest = phoneDigits.length === 10;
  const isOtpComplete = otp.every((d) => d !== "");

  const handleOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 3) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const finishLogin = () => {
    try {
      sessionStorage.setItem("login_phone", phoneDigits);
    } catch {
      /* ignore */
    }
    toast({ title: "Signed in", description: "Welcome back to TrustKeyper." });
    setLocation("/owner/dashboard");
  };

  return (
    <AuthFlowLayout onBack={() => setLocation("/")} backDisabled={false}>
      <div className="max-w-md flex flex-col flex-1">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-semibold text-gray-900">Login to TrustKeyper</h1>
        </div>

        {!otpSent ? (
          <>
            <div className="space-y-2 mb-8">
              <Label htmlFor="login-phone" className="text-gray-600 text-sm">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <div className="w-14 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm shrink-0">
                  +91
                </div>
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Placeholder"
                  value={phoneDigits}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="hidden sm:block">
              <Button
                size="lg"
                disabled={!canRequest}
                onClick={() => {
                  setOtpSent(true);
                  setCountdown(10);
                  setOtp(["", "", "", ""]);
                }}
                className="w-full sm:w-52 rounded-lg bg-[#6B7280] hover:bg-[#4B5563] text-white"
              >
                Request OTP &rarr;
              </Button>
            </div>
            <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
              <Button
                size="lg"
                disabled={!canRequest}
                onClick={() => {
                  setOtpSent(true);
                  setCountdown(10);
                  setOtp(["", "", "", ""]);
                }}
                className="w-full rounded-lg bg-[#6B7280] hover:bg-[#4B5563] text-white"
              >
                Request OTP &rarr;
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6 mb-6 max-w-md opacity-80">
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm">Phone Number</Label>
                <Input readOnly value={`+91 ${phoneDigits}`} className="bg-gray-50 border-gray-200" />
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Enter the OTP that we have sent to{" "}
              <span className="font-semibold text-gray-900">+91 {phoneDigits}</span>
            </p>

            <div className="flex gap-4 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`login-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className={`w-14 h-14 text-center text-xl font-medium rounded-lg border outline-none transition-colors
                    ${digit ? "bg-[#E8F5EE] border-accent border-b-4" : "bg-white border-gray-300 focus:border-primary"}`}
                />
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-8">
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

            <div className="hidden sm:block">
              <Button
                size="lg"
                disabled={!isOtpComplete}
                onClick={finishLogin}
                className="w-full sm:w-52 rounded-lg bg-[#6B7280] hover:bg-[#4B5563] text-white"
              >
                Continue &rarr;
              </Button>
            </div>
            <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
              <Button
                size="lg"
                disabled={!isOtpComplete}
                onClick={finishLogin}
                className="w-full rounded-lg bg-[#6B7280] hover:bg-[#4B5563] text-white"
              >
                Continue &rarr;
              </Button>
            </div>
          </>
        )}

        <AuthGoToSignupLink />
      </div>
    </AuthFlowLayout>
  );
}
