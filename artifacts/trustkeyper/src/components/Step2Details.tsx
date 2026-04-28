import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Step2DetailsProps {
  details: { name: string; phone: string };
  setDetails: (details: any) => void;
  onNext: () => void;
}

export default function Step2Details({ details, setDetails, onNext }: Step2DetailsProps) {
  const isComplete = details.name.trim().length > 0 && details.phone.trim().length > 0;

  return (
    <div className="flex flex-col h-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lets know you better</h1>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">Your Name</Label>
          <Input
            id="name"
            placeholder="Placeholder"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            className="bg-white py-6"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Placeholder"
            value={details.phone}
            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            className="bg-white py-6"
          />
        </div>
      </div>

      <div className="mt-auto">
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          className="w-48 py-6 text-base bg-primary hover:bg-primary/90 mb-6"
        >
          Request OTP &rarr;
        </Button>

        <p className="text-sm text-gray-500">
          By continuing, you agree to TrustKeyper{" "}
          <a href="#" className="text-accent hover:underline">Terms and Conditions</a>
        </p>
      </div>
    </div>
  );
}
