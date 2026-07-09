import React from "react";
import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import logoLight from "@/assets/marketing/Property 1=Logo Light.svg";
import footerBackground from "@/assets/marketing/footer-background.png";
import {
  CONTACT,
  FOOTER_ADDRESSES,
  FOOTER_RENTAL_FUNDS_DISCLAIMER,
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

// PLACEHOLDER: bare platform homepages until TrustKeyper company page URLs are confirmed (follow-up PR).
const FOOTER_SOCIAL_LINKS = [
  { label: "TrustKeyper on LinkedIn", href: "https://www.linkedin.com/", Icon: Linkedin },
  { label: "TrustKeyper on Facebook", href: "https://www.facebook.com/", Icon: Facebook },
  { label: "TrustKeyper on Instagram", href: "https://www.instagram.com/", Icon: Instagram },
] as const;

const contactRowClassName =
  "flex items-start gap-3 font-roboto text-base text-marketing-neutral-300 transition-colors hover:text-white";

const footerGroupHeadingClassName = "mb-4 font-roboto text-base font-medium text-white";

const footerLinkClassName =
  "font-roboto text-base text-marketing-neutral-300 transition-colors hover:text-white";

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
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="max-w-md space-y-5">
              <img
                src={logoLight}
                alt="TrustKeyper"
                className="h-10 w-auto sm:h-12"
                draggable={false}
              />

              <p className="font-roboto text-base leading-relaxed text-marketing-neutral-300">
                {FOOTER_TAGLINE}
              </p>

              <div className="space-y-3">
                <a href={CONTACT.emailHref} className={contactRowClassName}>
                  <Mail size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />
                  <span className="underline decoration-white/25 underline-offset-[3px] hover:decoration-white/50">
                    {CONTACT.email}
                  </span>
                </a>

                <a href={CONTACT.phoneHref} className={contactRowClassName}>
                  <Phone size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />
                  <span>{CONTACT.phone}</span>
                </a>

                <div className="flex items-start gap-3 font-roboto text-base text-marketing-neutral-300">
                  <MapPin size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />
                  <span>{FOOTER_ADDRESSES.headOffice.lines}</span>
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
                    className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-marketing-neutral-300 ring-1 ring-white/10 transition-colors hover:text-white"
                  >
                    <Icon size={16} strokeWidth={2} aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:pt-1">
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

          <div className="mt-10 border-t border-white/10 pt-6 lg:mt-14 lg:pt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <p className="shrink-0 font-roboto text-sm text-marketing-neutral-500">
                © {new Date().getFullYear()} TrustKeyper. All rights reserved.
              </p>
              <p className="max-w-xl font-roboto text-sm leading-relaxed text-marketing-neutral-500 lg:text-right">
                {FOOTER_RENTAL_FUNDS_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
