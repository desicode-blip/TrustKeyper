import React from "react";
import { User, IndianRupee } from "lucide-react";
import { AUTH_ENTRY_ROLES, isAuthEntryRole, type AuthEntryRole } from "@/lib/auth";

const ROLE_UI: Record<
  AuthEntryRole,
  { shortLabel: string; icon: typeof User }
> = {
  owner: { shortLabel: "Property Owner", icon: User },
  broker: { shortLabel: "Broker", icon: IndianRupee },
};

interface AuthEntryRoleGridProps {
  value: string;
  onChange: (role: AuthEntryRole) => void;
}

/** Signup/login role cards — owner and broker only (tenant & manager suppressed). */
export function AuthEntryRoleGrid({ value, onChange }: AuthEntryRoleGridProps) {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4">
      {AUTH_ENTRY_ROLES.map((id) => {
        const meta = ROLE_UI[id];
        const isSelected = value === id;
        const Icon = meta.icon;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative flex min-h-[7.5rem] flex-col items-center justify-center rounded-xl p-4 sm:p-6 transition-all duration-200 ${
              isSelected
                ? "bg-[#E8F5EE] border-b-4 border-b-primary shadow-sm"
                : "bg-white border border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
              <Icon size={24} aria-hidden />
            </div>
            <span
              className={`max-w-full px-1 text-center text-sm font-medium leading-snug sm:text-base ${
                isSelected ? "text-gray-900" : "text-gray-600"
              }`}
            >
              {meta.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function roleFromGridValue(value: string): AuthEntryRole | null {
  return isAuthEntryRole(value) ? value : null;
}
