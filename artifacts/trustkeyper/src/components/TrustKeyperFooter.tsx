import React from "react";
import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustKeyperLogo } from "@/components/brand";
import footerBackground from "@assets/trustkeyper_footer_background.png";

const FOOTER_LINKS = [
  { label: "Terms & Conditions", href: "#" },
  { label: "About Us", href: "#" },
  { label: "FAQs", href: "#" },
  { label: "Privacy Policy", href: "#" },
] as const;

const NOIDA_ADDRESS =
  "Office 8, 1st Floor, Block: Mart, Mahagun Moderne, Plot GH-02, Sector 78, Noida, UP, India, 201301";

const BENGALURU_ADDRESS =
  "HD-198, Embassy TechVillage, Outer Ring Road, Bellandur, Bengaluru, Karnataka, India, 560103";

export interface TrustKeyperFooterProps {
  className?: string;
}

/**
 * Site-wide TrustKeyper footer — official background art + white logo export.
 */
export function TrustKeyperFooter({ className }: TrustKeyperFooterProps) {
  return (
    <footer
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-[#0D1A48]",
        className,
      )}
    >
      <img
        src={footerBackground}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left select-none"
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-[4.5rem]">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
            <div className="lg:col-span-3 flex items-start">
              <TrustKeyperLogo
                variant="inverse"
                className="h-[4.5rem] sm:h-[5rem] w-[10.5rem] sm:w-[11.75rem] max-w-none"
              />
            </div>

            <nav
              className="lg:col-span-2 flex flex-col gap-3.5"
              aria-label="Footer"
            >
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[15px] font-medium text-slate-300/90 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="lg:col-span-3 space-y-7 text-[13px] leading-[1.7] text-slate-400">
              <div>
                <p className="mb-2.5 text-[15px] font-semibold tracking-tight text-white">
                  Noida
                </p>
                <p>{NOIDA_ADDRESS}</p>
              </div>
              <div>
                <p className="mb-2.5 text-[15px] font-semibold tracking-tight text-white">
                  Bengaluru
                </p>
                <p>{BENGALURU_ADDRESS}</p>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-7 text-[13px] leading-[1.7] text-slate-400">
              <div>
                <p className="mb-4 text-[15px] font-semibold tracking-tight text-white">
                  Contact :
                </p>
                <a
                  href="tel:+918088516875"
                  className="mb-3 flex items-center gap-2.5 text-slate-300/95 transition-colors duration-200 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                    <Phone size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-[14px]">+91 8088516875</span>
                </a>
                <a
                  href="mailto:info@trustkeyper.com"
                  className="flex items-center gap-2.5 text-slate-300/95 underline decoration-white/25 underline-offset-[3px] transition-colors duration-200 hover:text-white hover:decoration-white/50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                    <Mail size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-[14px]">info@trustkeyper.com</span>
                </a>
              </div>
              <div>
                <p className="mb-2.5 text-[15px] font-semibold tracking-tight text-white">
                  Head office :
                </p>
                <p>{BENGALURU_ADDRESS}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
