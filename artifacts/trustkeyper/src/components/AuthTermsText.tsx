import React from "react";

/** 16px below primary CTA — matches owner/tenant signup copy style. */
export function AuthTermsText({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      By continuing, you agree to TrustKeyper{" "}
      <a href="#" className="text-primary font-medium hover:underline">
        Terms and Conditions
      </a>
    </p>
  );
}

/** Spacing between a primary auth CTA and footer link (LOGIN / SIGN UP). */
export const AUTH_FOOTER_LINK_CLASS = "text-sm text-gray-500 mt-4 pb-28 sm:pb-0";
