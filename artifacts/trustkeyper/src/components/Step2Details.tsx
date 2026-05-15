import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_ROLES, profileExistsAsync, type Role } from "@/lib/auth";

interface Step2DetailsProps {
  details: { name: string; phone: string };
  setDetails: (details: any) => void;
  onNext: () => void;
}

export default function Step2Details({ details, setDetails, onNext }: Step2DetailsProps) {
  const phoneDigits = details.phone.replace(/\D/g, "").slice(0, 10);
  const pending = sessionStorage.getItem("tk_pending_role");
  const signupRole = (pending && ALL_ROLES.includes(pending as Role) ? pending : "") as Role | "";
  const [duplicatePhone, setDuplicatePhone] = useState(false);

  useEffect(() => {
    if (signupRole === "" || phoneDigits.length !== 10) {
      setDuplicatePhone(false);
      return;
    }
    let cancelled = false;
    void profileExistsAsync(phoneDigits, signupRole).then((exists) => {
      if (!cancelled) setDuplicatePhone(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [phoneDigits, signupRole]);
  const isComplete =
    details.name.trim().length > 0 &&
    phoneDigits.length === 10 &&
    signupRole !== "" &&
    !duplicatePhone;

  return (
    <div className="flex flex-col h-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Lets know you better</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">Your Name</Label>
          <Input
            id="name"
            placeholder="Placeholder"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Placeholder"
            value={phoneDigits}
            onChange={(e) =>
              setDetails({
                ...details,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            className="bg-white"
          />
          {duplicatePhone ? (
            <p className="text-sm text-destructive">An account already exists for this number.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 hidden sm:block">
        <Button size="lg"
          onClick={onNext} 
          disabled={!isComplete}
          className="w-48 bg-primary hover:bg-primary/90 mb-6"
        >
          Request OTP &rarr;
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
          Request OTP &rarr;
        </Button>
      </div>
    </div>
  );
}
