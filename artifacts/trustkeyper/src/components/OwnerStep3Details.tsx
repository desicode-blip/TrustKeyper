import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnerStep3DetailsProps {
  details: { name: string; contact: string };
  setDetails: (details: any) => void;
  onNext: () => void;
}

export default function OwnerStep3Details({ details, setDetails, onNext }: OwnerStep3DetailsProps) {
  const isComplete = details.name.trim().length > 0 && details.contact.trim().length > 0;

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Let's know you better</h1>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">Your Name</Label>
          <Input
            id="name"
            placeholder="Type here"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            className="bg-[#F1F5F9] border-none text-gray-900 h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact" className="text-gray-700">Email/Phone Number</Label>
          <Input
            id="contact"
            placeholder="Type here"
            value={details.contact}
            onChange={(e) => setDetails({ ...details, contact: e.target.value })}
            className="bg-[#F1F5F9] border-none text-gray-900 h-12"
          />
        </div>
      </div>

      <div className="mt-10 hidden sm:block">
        <Button size="lg"
          onClick={onNext} 
          disabled={!isComplete}
          className="w-48 bg-primary hover:bg-primary/90 mb-6 rounded-sm"
        >
          Request OTP &rarr;
        </Button>

        <p className="text-sm text-gray-400">
          By continuing, you agree to TrustKeyper <a href="#" className="text-accent hover:underline">Terms and Conditions</a>
        </p>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
        <Button size="lg"
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
