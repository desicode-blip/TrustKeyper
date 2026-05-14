import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileExists } from "@/lib/auth";

interface OwnerStep3DetailsProps {
  details: { name: string; phone: string };
  setDetails: (details: { name: string; phone: string }) => void;
  onNext: () => void;
}

export default function OwnerStep3Details({ details, setDetails, onNext }: OwnerStep3DetailsProps) {
  const digits = details.phone.replace(/\D/g, "").slice(0, 10);
  const duplicateOwnerPhone = digits.length === 10 && profileExists(digits, "owner");
  const isComplete = details.name.trim().length > 0 && digits.length === 10 && !duplicateOwnerPhone;

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Let&apos;s know you better</h1>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">
            Your Name
          </Label>
          <Input
            id="name"
            placeholder="Type here"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            className="bg-[#F1F5F9] border-none text-gray-900 h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">
            Phone Number
          </Label>
          <div className="flex gap-2">
            <div className="w-16 flex items-center justify-center rounded-md border border-transparent bg-[#E2E8F0] text-gray-700 text-sm shrink-0">
              +91
            </div>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit number"
              value={digits}
              onChange={(e) =>
                setDetails({
                  ...details,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="bg-[#F1F5F9] border-none text-gray-900 h-12 flex-1"
            />
          </div>
          {duplicateOwnerPhone ? (
            <p className="text-sm text-destructive">An account already exists for this number.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 hidden sm:block">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!isComplete}
          className="w-48 bg-primary hover:bg-primary/90 mb-6 rounded-sm"
        >
          Request OTP &rarr;
        </Button>

        <p className="text-sm text-gray-400">
          By continuing, you agree to TrustKeyper{" "}
          <a href="#" className="text-accent hover:underline">
            Terms and Conditions
          </a>
        </p>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!isComplete}
          className="w-full bg-primary hover:bg-primary/90 rounded-sm"
        >
          Request OTP &rarr;
        </Button>
      </div>
    </div>
  );
}
