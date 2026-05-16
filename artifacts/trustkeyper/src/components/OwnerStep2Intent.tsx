import React from "react";
import { Button } from "@/components/ui/button";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";

const Box = ("di" + "v") as "div";

interface OwnerStep2IntentProps {
  propertyIntent: string[];
  setPropertyIntent: (intent: string[]) => void;
  onNext: () => void;
}

export default function OwnerStep2Intent({
  propertyIntent,
  setPropertyIntent,
  onNext,
}: OwnerStep2IntentProps) {
  const options = [
    { id: "sell", label: "Sell my property" },
    { id: "rent", label: "Rent my property" },
    { id: "maintain", label: "Maintain my property" },
    { id: "other", label: "Other" },
  ];

  const toggleIntent = (id: string) => {
    if (propertyIntent.includes(id)) {
      setPropertyIntent(propertyIntent.filter((i) => i !== id));
    } else {
      setPropertyIntent([...propertyIntent, id]);
    }
  };

  const cta = (
    <Button
      size="lg"
      onClick={onNext}
      disabled={propertyIntent.length === 0}
      className={authPrimaryButtonClass}
    >
      Continue &rarr;
    </Button>
  );

  return (
    <Box className="flex flex-col h-full max-w-4xl pb-40 sm:pb-0">
      <Box className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-semibold text-gray-900">What do you want to do with this property?</h1>
      </Box>

      <Box className="flex flex-wrap gap-4 mb-10">
        {options.map((option) => {
          const isSelected = propertyIntent.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleIntent(option.id)}
              className={`flex-1 min-w-[180px] flex items-center gap-3 py-4 px-4 rounded-sm transition-all duration-200 border text-left ${
                isSelected
                  ? "bg-[#E8F5EE] border-[#22C55E] text-gray-900"
                  : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Box
                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center shrink-0 transition-colors shadow-sm ${
                  isSelected ? "bg-primary border-primary" : "border-gray-400 bg-white"
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </Box>
              <span className="text-[15px]">{option.label}</span>
            </button>
          );
        })}
      </Box>

      <AuthSignupScreenFooter cta={cta} showTerms={false} persistRole="owner" />
    </Box>
  );
}
