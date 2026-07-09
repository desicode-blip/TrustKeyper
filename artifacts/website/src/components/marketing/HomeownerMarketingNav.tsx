import React from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoDark from "@/assets/marketing/trustkeyper Logo.svg";
import {
  MarketingContactUsCta,
  MarketingSignupLoginCta,
} from "@/components/marketing/MarketingNavCtas";
import { MARKETING_CTA } from "@/lib/marketingConstants";
import { cn } from "@/lib/utils";

export interface HomeownerMarketingNavProps {
  className?: string;
}

function AudienceNavLink({
  href,
  isActive,
  children,
  onClick,
  className,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  if (isActive) {
    return (
      <span
        className={cn(
          "relative font-marketing-subheading text-[20px] font-semibold leading-[26px] text-marketing-neutral-1100",
          className,
        )}
      >
        {children}
        <span className="absolute -bottom-[7px] left-0 h-0.5 w-full rounded-full bg-marketing-green" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "font-marketing-heading text-[20px] font-medium leading-[26px] text-marketing-neutral-1100 transition-colors hover:text-marketing-blue",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function HomeownerMarketingNav({ className }: HomeownerMarketingNavProps) {
  const [location] = useLocation();
  const isHomeownersPage = location === "/";
  const isBrokersPage = location === "/for-brokers";
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-[#e3e9ff]/60 bg-marketing-cloud-050/90 backdrop-blur-[6px]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1168px] items-center justify-between gap-6 px-6 py-[15px] lg:px-8 xl:px-0">
        <Link href="/" className="shrink-0" onClick={closeMenu}>
          <img
            src={logoDark}
            alt="TrustKeyper"
            className="h-10 w-auto"
            draggable={false}
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Audience">
          <AudienceNavLink href="/" isActive={isHomeownersPage}>
            For Homeowners
          </AudienceNavLink>
          <AudienceNavLink href="/for-brokers" isActive={isBrokersPage}>
            For Brokers
          </AudienceNavLink>
        </nav>

        <div className="hidden items-center gap-[18px] md:flex">
          <MarketingContactUsCta href={MARKETING_CTA.getStarted} />
          <MarketingSignupLoginCta />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-marketing-neutral-1100 transition-colors hover:bg-white/70 md:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} strokeWidth={2} aria-hidden /> : <Menu size={22} strokeWidth={2} aria-hidden />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-[#e3e9ff]/60 bg-marketing-cloud-050/95 md:hidden">
          <nav
            id={menuId}
            className="mx-auto flex max-w-[1168px] flex-col gap-4 px-6 py-5"
            aria-label="Mobile primary"
          >
            <div className="flex flex-col gap-3">
              <AudienceNavLink
                href="/"
                isActive={isHomeownersPage}
                onClick={closeMenu}
                className="text-lg"
              >
                For Homeowners
              </AudienceNavLink>
              <AudienceNavLink
                href="/for-brokers"
                isActive={isBrokersPage}
                onClick={closeMenu}
                className="text-lg"
              >
                For Brokers
              </AudienceNavLink>
            </div>
            <div className="flex flex-col gap-3 pt-1">
              <MarketingContactUsCta
                className="w-full"
                href={MARKETING_CTA.getStarted}
                onClick={closeMenu}
              />
              <MarketingSignupLoginCta className="w-full" onClick={closeMenu} />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
