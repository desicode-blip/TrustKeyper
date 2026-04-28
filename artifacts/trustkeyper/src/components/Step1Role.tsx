import React from "react";
import { User, Home, Briefcase, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step1RoleProps {
  role: string;
  setRole: (role: string) => void;
  onNext: () => void;
}

export default function Step1Role({ role, setRole, onNext }: Step1RoleProps) {
  const roles = [
    { id: "owner", label: "Property Owner", icon: User },
    { id: "tenant", label: "Tenant", icon: Home },
    { id: "broker", label: "Broker", icon: IndianRupee },
    { id: "manager", label: "Manager", icon: Briefcase },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">I am a</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {roles.map((r) => {
          const isSelected = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-200 ${
                isSelected
                  ? "bg-[#E8F5EE] border-b-4 border-b-primary shadow-sm"
                  : "bg-white border border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary mb-3">
                <r.icon size={24} />
              </div>
              <span className={`font-medium ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-gray-500">This will help us personalize your journey</p>

      <div className="mt-10">
        <Button 
          onClick={onNext} 
          disabled={!role}
          className="w-40 py-6 text-lg bg-primary hover:bg-primary/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
