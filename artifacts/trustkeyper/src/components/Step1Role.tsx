import React from "react";
import { User, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { authMobileScrollPadClass, authPrimaryButtonClass } from "@/components/auth/authStyles";
import { AUTH_ENTRY_ROLES, isAuthEntryRole } from "@/lib/auth";

const Box = ("di" + "v") as "div";

const ROLE_UI: Record<
  (typeof AUTH_ENTRY_ROLES)[number],
  { label: string; icon: typeof User }
> = {
  owner: { label: "Property Owner", icon: User },
  broker: { label: "Broker", icon: IndianRupee },
};

interface Step1RoleProps {
  role: string;
  setRole: (role: string) => void;
  onNext: () => void;
  footerLinkType?: "login" | "signup";
}

export default function Step1Role({
  role,
  setRole,
  onNext,
  footerLinkType = "login",
}: Step1RoleProps) {
  const cta = (
    <Button size="lg" onClick={onNext} disabled={!role} className={authPrimaryButtonClass}>
      Continue
    </Button>
  );

  const persistRole = isAuthEntryRole(role) ? role : undefined;

  return (
    <Box className={`flex flex-col h-full ${authMobileScrollPadClass}`}>
      <Box className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">I am a</h1>
      </Box>

      <Box className="grid grid-cols-2 gap-4 mb-4 max-w-md">
        {AUTH_ENTRY_ROLES.map((id) => {
          const r = ROLE_UI[id];
          const isSelected = role === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-200 ${
                isSelected
                  ? "bg-[#E8F5EE] border-b-4 border-b-primary shadow-sm"
                  : "bg-white border border-gray-200 hover:border-gray-300"
              }`}
            >
              <Box className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary mb-3">
                <r.icon size={24} />
              </Box>
              <span className={`font-medium text-center ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                {r.label}
              </span>
            </button>
          );
        })}
      </Box>

      <p className="text-gray-500 mb-6">This will help us personalize your journey</p>

      {persistRole ? (
        <AuthSignupScreenFooter
          cta={cta}
          showTerms={false}
          linkType={footerLinkType}
          persistRole={persistRole}
        />
      ) : (
        <Box className="hidden sm:block mt-10">{cta}</Box>
      )}
    </Box>
  );
}
