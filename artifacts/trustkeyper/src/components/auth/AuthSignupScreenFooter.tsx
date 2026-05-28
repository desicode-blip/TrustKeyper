import React from "react";
import { AuthSignupBelowCta } from "@/components/auth/AuthSignupBelowCta";

type FooterLink = "login" | "signup" | "none";

interface AuthSignupScreenFooterProps {
  cta: React.ReactNode;
  showTerms?: boolean;
  linkType?: FooterLink;
  persistRole?: string;
}

/**
 * Auth footer: desktop = CTA + divider + links in flow.
 * Mobile = terms/links scroll above a sticky CTA-only bar (matches mobile UI reference).
 */
export function AuthSignupScreenFooter({
  cta,
  showTerms = true,
  linkType = "login",
  persistRole,
}: AuthSignupScreenFooterProps) {
  const below = (
    <AuthSignupBelowCta
      showTerms={showTerms}
      linkType={linkType}
      persistRole={persistRole}
    />
  );

  return (
    <>
      <div className="mt-3 w-full max-w-md shrink-0 sm:hidden">{below}</div>

      <div className="mt-5 hidden sm:block max-w-md w-full">
        {cta}
        {below}
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] safe-area-bottom">
        <div className="max-w-md mx-auto w-full px-4 py-3">{cta}</div>
      </div>
    </>
  );
}
