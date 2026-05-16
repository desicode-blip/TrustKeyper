import React from "react";
import { AuthTermsText } from "@/components/AuthTermsText";
import { AuthGoToLoginLink } from "@/components/AuthFlowFooterLinks";

interface AuthSignupScreenFooterProps {
  cta: React.ReactNode;
  showTerms?: boolean;
  showLogin?: boolean;
  persistRole?: string;
}

/**
 * Signup reference layout: primary CTA → 16px → divider → 16px → terms → 16px → LOGIN.
 */
export function AuthSignupScreenFooter({
  cta,
  showTerms = true,
  showLogin = true,
  persistRole,
}: AuthSignupScreenFooterProps) {
  const block = (
    <>
      {cta}
      {showTerms ? (
        <>
          <div className="mt-4 border-t border-gray-200 w-full" aria-hidden="true" />
          <AuthTermsText className="mt-4 text-center w-full" />
        </>
      ) : null}
      {showLogin && persistRole ? (
        <AuthGoToLoginLink
          persistRole={persistRole}
          className="mt-4 text-center w-full block !pb-0"
        />
      ) : null}
    </>
  );

  return (
    <>
      <div className="hidden sm:block mt-10 w-full max-w-xl">{block}</div>
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
        {block}
      </div>
    </>
  );
}
