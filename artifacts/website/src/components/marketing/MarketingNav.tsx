import React from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "wouter";
import logoDark from "@/assets/marketing/trustkeyper Logo.svg";
import { MarketingAuthTrigger } from "@/components/auth/MarketingAuthTrigger";
import { MARKETING_CTA } from "@/lib/marketingConstants";
import { cn } from "@/lib/utils";

export interface MarketingNavProps {
  className?: string;
}

const navCtaClassName = "font-marketing-cta rounded px-5 py-2.5 text-sm font-medium sm:text-base";

function SignupLoginCta({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <MarketingAuthTrigger
      onClick={onClick}
      className={cn(
        navCtaClassName,
        "inline-flex items-center justify-center gap-2 bg-marketing-blue text-white transition-colors hover:bg-marketing-blue-bright",
        className,
      )}
    >
      Signup/Login
      <ArrowRight size={16} strokeWidth={2} aria-hidden />
    </MarketingAuthTrigger>
  );
}

function ContactUsCta({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href={MARKETING_CTA.contactUs}
      onClick={onClick}
      className={cn(
        navCtaClassName,
        "inline-flex items-center justify-center border border-[#cbd5e2] bg-white text-marketing-navy transition-colors hover:bg-marketing-muted-bg",
        className,
      )}
    >
      Contact Us
    </Link>
  );
}

export function MarketingNav({ className }: MarketingNavProps) {
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
    <header className={cn("fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4", className)}>
      <div className="mx-auto max-w-[1200px] rounded-[29px] bg-marketing-bg/70 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md">
        <div className="flex h-[72px] items-center justify-between px-6 sm:px-8">
          <Link href="/" className="shrink-0" onClick={closeMenu}>
            <img
              src={logoDark}
              alt="TrustKeyper"
              className="h-9 w-auto sm:h-10"
              draggable={false}
            />
          </Link>

          <nav className="hidden items-center gap-3 md:flex md:gap-4" aria-label="Primary">
            <ContactUsCta />
            <SignupLoginCta />
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-marketing-navy transition-colors hover:bg-black/[0.04] md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} strokeWidth={2} aria-hidden /> : <Menu size={22} strokeWidth={2} aria-hidden />}
          </button>
        </div>

        {menuOpen ? (
          <nav
            id={menuId}
            className="flex flex-col gap-3 border-t border-black/[0.06] px-6 pb-4 pt-3 md:hidden"
            aria-label="Mobile primary"
          >
            <SignupLoginCta className="w-full" onClick={closeMenu} />
            <ContactUsCta className="w-full" onClick={closeMenu} />
          </nav>
        ) : null}
      </div>
    </header>
  );
}
