/** Primary CTA on auth / signup screens */
export const authPrimaryButtonClass =
  "w-full sm:w-auto min-w-[12rem] rounded-lg bg-primary hover:bg-primary/90 text-white border-0 shadow-none disabled:opacity-50";

/** Room for fixed mobile sticky CTA bar */
export const authMobileScrollPadClass = "pb-[5.5rem] sm:pb-0";

/**
 * Role / option card — selected.
 * Mint fill + bottom green border only (matches auth UI reference).
 */
export const authRoleCardSelectedClass =
  "bg-[#E8F5EE] border border-gray-200 border-b-[3px] border-b-[#22C55E]";

/** Role / option card — default */
export const authRoleCardUnselectedClass =
  "bg-white border border-gray-200 hover:border-gray-300";

/** OTP digit — filled state */
export const authOtpDigitFilledClass =
  "bg-[#E8F5EE] border-2 border-[#22C55E] border-b-4 text-gray-900";

/** OTP digit — empty */
export const authOtpDigitEmptyClass =
  "bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20";
