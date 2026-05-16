import React from "react";
import { AuthSignupBelowCta } from "@/components/auth/AuthSignupBelowCta";
import { authMobileStickyBarClass } from "@/components/auth/authStyles";

type FooterLink = "login" | "signup" | "none";

interface AuthSignupScreenFooterProps {
  cta: React.ReactNode;
  showTerms?: boolean;
  linkType?: FooterLink;
  persistRole?: string;
}

/**
 * Signup/login action area: desktop = CTA then divider/footer;
 * mobile = footer in scroll, CTA alone in sticky bar.
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
      <div className="mt-10 hidden sm:block max-w-md w-full">
        {cta}
        {below}
      </div>

      <div className="mt-10 sm:hidden max-w-md w-full pb-4">
        {below}
      </div>

      <div className={authMobileStickyBarClass}>
        <div className="max-w-md mx-auto w-full">{cta}</div>
      </div>
    </>
  );
}
