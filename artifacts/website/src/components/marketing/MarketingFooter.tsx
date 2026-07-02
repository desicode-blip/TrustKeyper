import React from "react";
import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";
import logoLight from "@/assets/marketing/Property 1=Logo Light.svg";
import footerBackground from "@/assets/marketing/footer-background.png";
import { CONTACT, FOOTER_ADDRESSES } from "@/lib/marketingConstants";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "About Us", href: "/about-us" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy-policy" },
] as const;

export interface MarketingFooterProps {
  className?: string;
}

export function MarketingFooter({ className }: MarketingFooterProps) {
  return (
    <footer
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-marketing-navy",
        "min-h-0 md:min-h-[328px] md:h-[328px]",
        className,
      )}
    >
      <img
        src={footerBackground}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left select-none"
      />

      <div className="relative z-10 flex h-full min-h-0 items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-0 lg:px-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 md:grid-cols-12 md:items-center md:gap-x-10 lg:gap-x-12">
            <div className="flex items-start md:col-span-3 md:items-center">
              <img
                src={logoLight}
                alt="TrustKeyper"
                className="h-10 w-auto sm:h-12"
                draggable={false}
              />
            </div>

            <nav
              className="flex flex-col gap-3 md:col-span-2 md:gap-3.5"
              aria-label="Footer"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-slate-300/90 transition-colors duration-200 hover:text-white md:text-[15px]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-5 text-[13px] leading-[1.65] text-slate-400 md:col-span-3 md:space-y-6 md:leading-[1.7]">
              <div>
                <p className="mb-2 text-sm font-semibold tracking-tight text-white md:mb-2.5 md:text-[15px]">
                  {FOOTER_ADDRESSES.noida.label}
                </p>
                <p>{FOOTER_ADDRESSES.noida.lines}</p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold tracking-tight text-white md:mb-2.5 md:text-[15px]">
                  {FOOTER_ADDRESSES.bengaluru.label}
                </p>
                <p>{FOOTER_ADDRESSES.bengaluru.lines}</p>
              </div>
            </div>

            <div className="space-y-5 text-[13px] leading-[1.65] text-slate-400 md:col-span-4 md:space-y-6 md:leading-[1.7]">
              <div>
                <p className="mb-3 text-sm font-semibold tracking-tight text-white md:mb-4 md:text-[15px]">
                  Contact :
                </p>
                <a
                  href={CONTACT.phoneHref}
                  className="mb-2.5 flex items-center gap-2.5 text-slate-300/95 transition-colors duration-200 hover:text-white md:mb-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                    <Phone size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-[14px]">{CONTACT.phone}</span>
                </a>
                <a
                  href={CONTACT.emailHref}
                  className="flex items-center gap-2.5 text-slate-300/95 underline decoration-white/25 underline-offset-[3px] transition-colors duration-200 hover:text-white hover:decoration-white/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                    <Mail size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-[14px]">{CONTACT.email}</span>
                </a>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold tracking-tight text-white md:mb-2.5 md:text-[15px]">
                  {FOOTER_ADDRESSES.headOffice.label}
                </p>
                <p>{FOOTER_ADDRESSES.headOffice.lines}</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500 md:mt-0 md:hidden">
            © {new Date().getFullYear()} TrustKeyper
          </p>
        </div>
      </div>
    </footer>
  );
}
