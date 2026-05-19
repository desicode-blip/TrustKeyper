import React from "react";
import { Button } from "@/components/ui/button";
import { AuthEntryRoleGrid } from "@/components/auth/AuthEntryRoleGrid";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { authMobileScrollPadClass, authPrimaryButtonClass } from "@/components/auth/authStyles";
import { isAuthEntryRole, type Role } from "@/lib/auth";

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
    <Button size="lg" onClick={onNext} disabled={!isAuthEntryRole(role)} className={authPrimaryButtonClass}>
      Continue
    </Button>
  );

  const persistRole = isAuthEntryRole(role) ? role : undefined;

  return (
    <div className={`flex flex-col h-full ${authMobileScrollPadClass}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">I am a</h1>
      </div>

      <AuthEntryRoleGrid
        value={role}
        onChange={(r) => setRole(r)}
      />

      <p className="text-gray-500 mb-6 mt-4">This will help us personalize your journey</p>

      {persistRole ? (
        <AuthSignupScreenFooter
          cta={cta}
          showTerms={false}
          linkType={footerLinkType}
          persistRole={persistRole}
        />
      ) : (
        <div className="hidden sm:block mt-10">{cta}</div>
      )}
    </div>
  );
}
