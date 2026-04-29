import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface BrokerFormProps {
  onComplete: (data: { fullName: string; firm: string; phone: string }) => void;
}

export default function BrokerForm({ onComplete }: BrokerFormProps) {
  const [fullName, setFullName] = useState("");
  const [firm, setFirm] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(12);

  const formValid =
    fullName.trim().length > 0 && phone.trim().length === 10 && agreed;

  useEffect(() => {
    if (!otpStage || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, otpStage]);

  const handleSendOtp = () => {
    if (!formValid) return;
    setOtpStage(true);
    setCountdown(12);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value.replace(/\D/g, "");
    setOtp(next);

    if (value && index < 5) {
      const el = document.getElementById(`broker-otp-${index + 1}`);
      el?.focus();
    }

    if (next.every((d) => d !== "")) {
      setTimeout(
        () => onComplete({ fullName, firm, phone }),
        300
      );
    }
  };

  return (
    <div className="flex flex-col h-full max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
            className={`py-6 ${otpStage ? "bg-blue-50/60" : "bg-white"}`}
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
            className={`py-6 ${otpStage ? "bg-blue-50/60" : "bg-white"}`}
          />
          <p className="text-xs text-gray-500">
            Leave blank if you're an independent broker
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
              className={`py-6 flex-1 ${otpStage ? "bg-blue-50/60" : "bg-white"}`}
            />
          </div>
          <p className="text-xs text-gray-500">We'll send an OTP to verify</p>
        </div>
      </div>

      <div className="border-t border-gray-200 my-8" />

      <div className="flex items-center gap-3 mb-6">
        <Checkbox
          id="agree"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
          disabled={otpStage}
        />
        <Label htmlFor="agree" className="text-gray-700 cursor-pointer">
          I agree to TrustKeyper Terms & Conditions
        </Label>
      </div>

      {!otpStage && (
        <Button
          onClick={handleSendOtp}
          disabled={!formValid}
          className="w-full py-6 text-base bg-primary hover:bg-primary/90"
        >
          Send OTP & Register
        </Button>
      )}

      {otpStage && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Enter OTP</h3>
          <p className="text-sm text-gray-500 mb-6">
            We've sent a 6-digit code to{" "}
            <span className="text-gray-900 font-medium">+91 {phone}</span>
          </p>

          <div className="flex justify-center gap-3 mb-4">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`broker-otp-${i}`}
                type="text"
                inputMode="numeric"
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className={`w-12 h-12 text-center text-lg font-medium rounded-lg border outline-none transition-colors
                  ${
                    d
                      ? "bg-[#E8F5EE] border-accent border-b-4"
                      : "bg-white border-gray-300 focus:border-primary"
                  }`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            {countdown > 0 ? (
              <>Resend in {countdown}s</>
            ) : (
              <button
                onClick={() => setCountdown(12)}
                className="font-medium underline text-gray-900 hover:text-primary"
              >
                Resend OTP
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
