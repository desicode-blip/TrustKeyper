import React from "react";
import { Button } from "@/components/ui/button";

interface OwnerStep1PropertiesProps {
  propertiesCount: string;
  setPropertiesCount: (count: string) => void;
  onNext: () => void;
}

export default function OwnerStep1Properties({ propertiesCount, setPropertiesCount, onNext }: OwnerStep1PropertiesProps) {
  const options = ["01", "02-10", "10+"];

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-semibold text-gray-900">How many properties do you own?</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        {options.map((option) => {
          const isSelected = propertiesCount === option;
          return (
            <button
              key={option}
              onClick={() => setPropertiesCount(option)}
              className={`flex-1 min-w-[120px] py-4 px-6 text-center rounded-sm transition-all duration-200 border ${
                isSelected
                  ? "bg-[#E8F5EE] border-[#22C55E] text-gray-900"
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-600"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-blue-400 mb-10">This will help us personalize your journey</p>

      <div className="hidden sm:block">
        <Button 
          size="lg"
          onClick={onNext} 
          disabled={!propertiesCount}
          className="w-40 bg-primary hover:bg-primary/90 rounded-sm"
        >
          Continue &rarr;
        </Button>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
        <Button 
          size="lg"
          onClick={onNext} 
          disabled={!propertiesCount}
          className="w-full bg-primary hover:bg-primary/90 rounded-sm"
        >
          Continue &rarr;
        </Button>
      </div>
    </div>
  );
}
