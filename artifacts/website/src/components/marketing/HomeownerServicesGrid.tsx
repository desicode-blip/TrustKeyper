import React from "react";
import {
  CalendarDays,
  ClipboardList,
  Info,
  UserSearch,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import serviceHomeServicingIllustration from "@/assets/marketing/homeowners/services/service-home-servicing.png";
import serviceRentCollectionIllustration from "@/assets/marketing/homeowners/services/service-rent-collection.png";
import serviceRepairsIllustration from "@/assets/marketing/homeowners/services/service-repairs.png";
import serviceTenantScreeningIllustration from "@/assets/marketing/homeowners/services/service-tenant-screening.png";
import { cn } from "@/lib/utils";

interface ServiceCardData {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  illustration: string;
  illustrationAlt: string;
  disclaimer?: string;
  tall?: boolean;
}

const SERVICE_CARDS: ServiceCardData[] = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Rent Collection Assistance",
    description:
      "TrustKeyper coordinates rent reminders, payment follow-ups, status tracking, owner notifications, and delayed-payment escalation.",
    bullets: [
      "Tenant payment reminders",
      "Rent follow-up coordination",
      "Payment status tracking",
      "Owner notifications",
      "Delayed-payment escalation",
    ],
    illustration: serviceRentCollectionIllustration,
    illustrationAlt: "Rent collection reminders and payment tracking illustration",
    disclaimer:
      "Rental payments are made directly between the tenant and property owner. TrustKeyper assists with reminders, tracking, and coordination and does not hold rental funds.",
    tall: true,
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Regular Home Servicing",
    description:
      "Regular, scheduled upkeep to keep your property in good condition and reduce avoidable deterioration.",
    bullets: [
      "Routine property check-ups",
      "Preventive servicing",
      "Basic maintenance coordination",
      "Property-condition updates",
      "Recurring service scheduling",
    ],
    illustration: serviceHomeServicingIllustration,
    illustrationAlt: "Regular home servicing and property check-up illustration",
    tall: true,
  },
  {
    number: "03",
    icon: Wrench,
    title: "Repairs and Remodeling",
    description:
      "From minor fixes to larger renovation projects, TrustKeyper coordinates vendors, estimates, and progress.",
    bullets: [
      "Repair coordination",
      "Vendor sourcing",
      "Estimate collection",
      "Progress supervision",
      "Remodeling management",
    ],
    illustration: serviceRepairsIllustration,
    illustrationAlt: "Repairs and remodeling tools illustration",
  },
  {
    number: "04",
    icon: UserSearch,
    title: "Tenant Sourcing and Screening",
    description:
      "Finding and verifying the right tenant requires time and thoroughness. We manage the process on your behalf.",
    bullets: [
      "Property-listing assistance",
      "Tenant enquiry management",
      "Identity and background screening",
      "Tenant shortlisting",
      "Move-in coordination",
    ],
    illustration: serviceTenantScreeningIllustration,
    illustrationAlt: "Tenant sourcing and screening illustration",
  },
];

function ServiceBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3.5 font-roboto text-sm leading-5 text-marketing-navy-dark">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marketing-neutral-1100"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ServiceCard({
  number,
  icon: Icon,
  title,
  description,
  bullets,
  illustration,
  illustrationAlt,
  disclaimer,
  tall = false,
}: ServiceCardData) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white p-8",
        "shadow-[0_1px_2px_rgba(8,50,42,0.04),0_16px_40px_rgba(8,50,42,0.06)]",
        tall ? "min-h-[420px] lg:min-h-[517px]" : "min-h-[360px] lg:min-h-[406px]",
      )}
    >
      <div className="relative z-10 max-w-[calc(100%-7rem)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marketing-green">
            <Icon size={20} strokeWidth={2} className="text-white" aria-hidden />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.6px] text-marketing-neutral-1000">
            {number}
          </span>
        </div>

        <h3 className="mt-6 text-xl font-semibold leading-[26px] text-marketing-navy-dark">{title}</h3>
        <p className="mt-4 max-w-md font-roboto text-sm leading-5 text-marketing-neutral-1000">
          {description}
        </p>

        <div className="mt-5">
          <ServiceBulletList items={bullets} />
        </div>

        {disclaimer ? (
          <div className="mt-6 flex max-w-[338px] gap-2 rounded-[20px] border border-marketing-blue/20 bg-marketing-blue/[0.09] p-3.5">
            <Info size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-marketing-navy-dark" aria-hidden />
            <p className="text-xs leading-4 text-marketing-navy-dark">{disclaimer}</p>
          </div>
        ) : null}
      </div>

      <img
        src={illustration}
        alt={illustrationAlt}
        className="pointer-events-none absolute -bottom-8 -right-4 z-0 w-[min(46%,220px)] max-w-[301px] object-contain sm:w-[min(42%,240px)] lg:-bottom-8 lg:-right-5"
        draggable={false}
      />
    </article>
  );
}

export function HomeownerServicesGrid() {
  return (
    <section
      className="bg-marketing-cloud-050 py-14 sm:py-16 lg:py-[140px]"
      aria-labelledby="homeowner-services-heading"
    >
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-[673px]">
          <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
            Services
          </p>
          <h2
            id="homeowner-services-heading"
            className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
          >
            Everything your property needs,
            <br />
            managed in one place.
          </h2>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-5 lg:mt-[60px] lg:grid-cols-2 lg:gap-5">
          {SERVICE_CARDS.map((card) => (
            <li key={card.number}>
              <ServiceCard {...card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
