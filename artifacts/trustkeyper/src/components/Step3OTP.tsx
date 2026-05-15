import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";

interface Step3OTPProps {
  details: { name: string; phone: string };
  onNext: () => void;
}

export default function Step3OTP({ details, onNext }: Step3OTPProps) {
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LAST_INDEX) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const isComplete = otp.every(digit => digit !== "");

  return (
    <div className="flex flex-col h-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Let's know you better</h1>
      </div>

      <div className="space-y-6 mb-6 opacity-70 pointer-events-none">
        <div className="space-y-2">
          <Label className="text-gray-700">Your Name</Label>
          <Input
            value={details.name}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Phone Number</Label>
          <Input
            value={details.phone}
            readOnly
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Enter the OTP that we have sent to <span className="font-semibold text-gray-900">{details.phone}</span>
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

      <div className="mt-10 hidden sm:block">
        <Button size="lg"
          onClick={onNext} 
          disabled={!isComplete}
          className="w-48 bg-primary hover:bg-primary/90 mb-6"
        >
          Continue &rarr;
        </Button>

        <p className="text-sm text-gray-500">
          By continuing, you agree to TrustKeyper{" "}
          <a href="#" className="text-accent hover:underline">Terms and Conditions</a>
        </p>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
        <Button size="lg"
          onClick={onNext}
          disabled={!isComplete}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Continue &rarr;
        </Button>
      </div>
    </div>
  );
}
