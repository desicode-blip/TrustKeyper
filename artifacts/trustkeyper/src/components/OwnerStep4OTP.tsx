import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnerStep4OTPProps {
  details: { name: string; contact: string };
  onNext: () => void;
}

export default function OwnerStep4OTP({ details, onNext }: OwnerStep4OTPProps) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`owner-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Let's know you better</h1>
      </div>

      <div className="space-y-6 mb-8 max-w-md">
        <div className="space-y-2">
          <Label className="text-gray-700">Your Name</Label>
          <Input value={details.name} readOnly className="bg-[#E2E8F0] border-none text-gray-500 h-12" />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Email/Phone Number</Label>
          <Input value={details.contact} readOnly className="bg-[#E2E8F0] border-none text-gray-500 h-12" />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-500 text-sm mb-4">
          Enter the OTP that we have sent to <span className="font-semibold text-gray-900">{details.contact}</span>
        </p>

        <div className="flex gap-4 mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`owner-otp-${i}`}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              className={`w-14 h-14 text-center text-xl font-medium rounded-lg border outline-none transition-colors
                ${
                  digit
                    ? "bg-[#E8F5EE] border-accent border-b-4 text-gray-900"
                    : "bg-white border-gray-300 focus:border-primary"
                }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Didn't receive the verification OTP?{" "}
          {countdown > 0 ? (
            <span className="font-medium text-primary cursor-pointer hover:underline">
              Resend otp in {countdown}s
            </span>
          ) : (
            <button onClick={() => setCountdown(10)} className="font-medium text-primary hover:underline">
              Resend otp
            </button>
          )}
        </p>
      </div>

      <div className="mt-4">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!isComplete}
          className="w-48 bg-primary hover:bg-primary/90 mb-6 rounded-sm"
        >
          Continue &rarr;
        </Button>

        <p className="text-sm text-gray-400">
          By continuing, you agree to TrustKeyper <a href="#" className="text-accent hover:underline">Terms and Conditions</a>
        </p>
      </div>
    </div>
  );
}
