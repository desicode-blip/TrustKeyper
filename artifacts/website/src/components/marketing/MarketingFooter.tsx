import React from "react";
import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, MapPin } from "lucide-react";
import logoLight from "@/assets/marketing/Property 1=Logo Light.svg";
import footerDecoration from "@/assets/marketing/homeowners/footer/decoration.svg";
import footerIconMail from "@/assets/marketing/homeowners/footer/icon-mail.svg";
import footerIconPhone from "@/assets/marketing/homeowners/footer/icon-phone.svg";
import {
  CONTACT,
  FOOTER_LOCATION_SHORT,
  FOOTER_TAGLINE,
} from "@/lib/marketingConstants";
import { cn } from "@/lib/utils";

/** Flip to true once GTM/cookie consent ships and the destination URL is known. */
const SHOW_COOKIE_PREFERENCES_LINK = false;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
] as const;

const COMPANY_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "FAQs", href: "/faqs" },
] as const;

const FOOTER_SOCIAL_LINKS = [
  { label: "TrustKeyper on LinkedIn", href: "https://www.linkedin.com/company/trustkeyper/", Icon: Linkedin },
  { label: "TrustKeyper on Facebook", href: "https://www.facebook.com/people/Trustkeyper/61591036335907/", Icon: Facebook },
  { label: "TrustKeyper on Instagram", href: "https://www.instagram.com/trustkeyper", Icon: Instagram },
] as const;

const footerGroupHeadingClassName =
  "mb-4 font-roboto text-xs font-medium uppercase tracking-[1.2px] text-white";

const footerLinkClassName = "font-roboto text-sm text-white transition-colors hover:text-white/80";

const contactRowClassName = "flex items-center gap-3 text-sm text-white transition-colors hover:text-white/80";

export interface MarketingFooterProps {
  className?: string;
}

export function MarketingFooter({ className }: MarketingFooterProps) {
  return (
    <footer
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-marketing-neutral-1100 text-white",
        className,
      )}
    >
      <img
        src={footerDecoration}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[40px] z-0 hidden h-[353px] w-[min(560px,46vw)] -translate-x-1/2 select-none lg:block"
      />

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[1168px] px-6 py-16 sm:px-8 sm:py-14 lg:px-8 lg:pb-10 lg:pt-[62px]">
          <div className="flex flex-col gap-10 lg:min-h-[372px] lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="max-w-[440px] space-y-5">
              <img
                src={logoLight}
                alt="TrustKeyper"
                className="h-10 w-auto sm:h-12"
                draggable={false}
              />

              <p className="max-w-[314px] text-2xl font-medium leading-[33px] text-white">
                {FOOTER_TAGLINE}
              </p>

              <div className="space-y-3 pt-1">
                <a href={CONTACT.emailHref} className={contactRowClassName}>
                  <img src={footerIconMail} alt="" className="size-4 shrink-0" aria-hidden />
                  <span>{CONTACT.email}</span>
                </a>

                <a href={CONTACT.phoneHref} className={contactRowClassName}>
                  <img src={footerIconPhone} alt="" className="size-4 shrink-0" aria-hidden />
                  <span>{CONTACT.phone}</span>
                </a>

                <div className="flex items-center gap-3 text-sm text-white">
                  <MapPin size={16} strokeWidth={2} className="shrink-0" aria-hidden />
                  <span>{FOOTER_LOCATION_SHORT}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {FOOTER_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-full bg-white text-marketing-neutral-1100 transition-opacity hover:opacity-90"
                  >
                    <Icon size={16} strokeWidth={2} aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-8 lg:ml-auto lg:w-[146px] lg:shrink-0">
              <nav aria-label="Legal">
                <p className={footerGroupHeadingClassName}>Legal</p>
                <div className="flex flex-col gap-4">
                  {LEGAL_LINKS.map((link) => (
                    <Link key={link.label} href={link.href} className={footerLinkClassName}>
                      {link.label}
                    </Link>
                  ))}
                  {SHOW_COOKIE_PREFERENCES_LINK ? (
                    <Link href="/cookie-preferences" className={footerLinkClassName}>
                      Cookie Preferences
                    </Link>
                  ) : null}
                </div>
              </nav>

              <nav aria-label="Company">
                <p className={footerGroupHeadingClassName}>Company</p>
                <div className="flex flex-col gap-4">
                  {COMPANY_LINKS.map((link) => (
                    <Link key={link.label} href={link.href} className={footerLinkClassName}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-6 lg:mt-14 lg:h-[81px] lg:pt-0">
            <p className="font-roboto text-sm text-white lg:pt-[48px]">
              © {new Date().getFullYear()} TrustKeyper. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
