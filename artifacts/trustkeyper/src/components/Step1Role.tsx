import React from "react";
import { Button } from "@/components/ui/button";
import { AuthEntryRoleGrid } from "@/components/auth/AuthEntryRoleGrid";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { AuthStepHeading } from "@/components/auth/AuthStepHeading";
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
    <div className={`flex flex-col h-full mx-auto w-full max-w-md lg:max-w-none ${authMobileScrollPadClass}`}>
      <AuthStepHeading title="I am a" />

      <AuthEntryRoleGrid
        value={role}
        onChange={(r) => setRole(r)}
      />

      <p className="text-gray-500 text-sm text-center lg:text-left mb-3 mt-4">
        This will help us personalize your journey
      </p>

      {/* Always render the footer so the sticky CTA bar is visible on mobile even before selection */}
      <AuthSignupScreenFooter
        cta={cta}
        showTerms={false}
        linkType={footerLinkType}
        persistRole={persistRole}
      />
    </div>
  );
}
