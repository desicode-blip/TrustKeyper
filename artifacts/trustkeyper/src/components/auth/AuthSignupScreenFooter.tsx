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
 * Auth action footer: desktop = CTA then divider/footer in document flow.
 * Mobile = fixed bottom panel: CTA, divider, centered footer text (matches signup reference).
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

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
        <div className="max-w-md mx-auto w-full px-4 pt-4 pb-4 flex flex-col">
          {cta}
          {below}
        </div>
      </div>
    </>
  );
}
