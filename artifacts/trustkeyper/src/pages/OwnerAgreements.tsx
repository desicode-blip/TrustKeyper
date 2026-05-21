import React from "react";
import { ChevronLeft, FileText, FilePlus2 } from "lucide-react";
import { useLocation } from "wouter";
import OwnerLayout from "@/components/OwnerLayout";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { Button } from "@/components/ui/button";

export default function OwnerAgreements() {
  const [, setLocation] = useLocation();

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => setLocation("/owner/dashboard")}
          className="flex items-center gap-2 text-primary font-medium text-lg mb-6 hover:underline w-fit"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Agreement</h1>

        <OwnerPageEmpty
          icon={FileText}
          title="No agreements yet"
          description="Create a rental agreement for your property to collect documents and e-signatures."
          action={
            <Button
              size="lg"
              className="rounded-xl border-0 font-semibold shadow-md shadow-primary/25 gap-2"
              onClick={() => setLocation("/owner/agreements/generate")}
            >
              <FilePlus2 size={18} />
              Generate Agreement
            </Button>
          }
        />
      </div>
    </OwnerLayout>
  );
}
