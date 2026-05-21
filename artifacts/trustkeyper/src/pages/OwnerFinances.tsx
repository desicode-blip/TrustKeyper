import React from "react";
import { ChevronLeft, Wallet } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";

export default function OwnerFinances() {
  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-[1000px] mx-auto">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-primary font-semibold text-lg mb-6 hover:underline w-fit"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-gray-900 mb-1">Rent Management</h1>
          <p className="text-gray-500 text-[15px]">
            Track and manage rent payments across all properties
          </p>
        </div>

        <OwnerPageEmpty
          icon={Wallet}
          title="Not available"
          description="Rent collection and payment tracking will be available in a future update."
        />
      </div>
    </OwnerLayout>
  );
}
