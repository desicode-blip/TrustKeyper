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
    <footer className={cn("relative w-full shrink-0 overflow-hidden bg-marketing-neutral-1300", className)}>
      <img
        src={footerBackground}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[min(56%,720px)] object-cover object-right select-none lg:block"
      />

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[1168px] px-6 py-14 sm:px-8 lg:px-0 lg:py-[62px]">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12">
            <div className="flex items-start sm:col-span-2 lg:col-span-3">
              <img
                src={logoLight}
                alt="TrustKeyper"
                className="h-10 w-auto sm:h-12"
                draggable={false}
              />
            </div>

            <nav className="flex flex-col gap-4 sm:col-span-1 lg:col-span-2" aria-label="Footer">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-roboto text-base text-marketing-neutral-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-6 text-sm leading-[1.65] text-marketing-neutral-500 sm:col-span-1 lg:col-span-3 lg:space-y-6 lg:leading-[1.7]">
              <div>
                <p className="mb-2 font-roboto text-base font-medium text-white lg:mb-2.5">
                  {FOOTER_ADDRESSES.noida.label}
                </p>
                <p className="font-roboto">{FOOTER_ADDRESSES.noida.lines}</p>
              </div>
              <div>
                <p className="mb-2 font-roboto text-base font-medium text-white lg:mb-2.5">
                  {FOOTER_ADDRESSES.bengaluru.label}
                </p>
                <p className="font-roboto">{FOOTER_ADDRESSES.bengaluru.lines}</p>
              </div>
            </div>

            <div className="space-y-6 text-sm leading-[1.65] text-marketing-neutral-500 sm:col-span-2 lg:col-span-4 lg:space-y-6 lg:leading-[1.7]">
              <div>
                <p className="mb-3 font-roboto text-base font-medium text-white lg:mb-4">
                  Contact :
                </p>
                <a
                  href={CONTACT.phoneHref}
                  className="mb-2.5 flex items-center gap-3 font-roboto text-base text-marketing-neutral-300 transition-colors hover:text-white lg:mb-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                    <Phone size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span>{CONTACT.phone}</span>
                </a>
                <a
                  href={CONTACT.emailHref}
                  className="flex items-center gap-3 font-roboto text-base text-marketing-neutral-300 underline decoration-white/25 underline-offset-[3px] transition-colors hover:text-white hover:decoration-white/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                    <Mail size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span>{CONTACT.email}</span>
                </a>
              </div>
              <div>
                <p className="mb-2 font-roboto text-base font-medium text-white lg:mb-2.5">
                  {FOOTER_ADDRESSES.headOffice.label}
                </p>
                <p className="font-roboto">{FOOTER_ADDRESSES.headOffice.lines}</p>
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-white/10 pt-6 text-center font-roboto text-xs text-marketing-neutral-500 md:mt-10 md:hidden">
            © {new Date().getFullYear()} TrustKeyper
          </p>
        </div>
      </div>
    </footer>
  );
}
