import React from "react";
import { Check } from "lucide-react";

interface PlatformFeature {
  title: string;
  description: string;
}

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    title: "Verified Lead Feed",
    description: "Access newly available property opportunities with verification indicators.",
  },
  {
    title: "Smart Lead Filters",
    description: "Filter by locality, property type, budget, requirement, availability, and recency.",
  },
  {
    title: "Lead Pipeline",
    description:
      "Move leads through New, Contacted, Qualified, Visit Scheduled, Negotiation, Closed, and Archived.",
  },
  {
    title: "Follow-Up Tasks",
    description: "Set reminders and track pending actions.",
  },
  {
    title: "Property Details",
    description: "Review essential property information and owner requirements before contacting.",
  },
  {
    title: "Notifications",
    description: "Receive alerts for matching opportunities and important follow-ups.",
  },
  {
    title: "Broker Profile",
    description: "Manage service locations, property categories, business details, and availability.",
  },
  {
    title: "Performance Insights",
    description: "Monitor lead activity, response time, site visits, and closures.",
  },
  {
    title: "Broker Support",
    description: "Access support for lead issues, verification questions, and account assistance.",
  },
];

function PlatformFeatureCard({ title, description }: PlatformFeature) {
  return (
    <article className="flex gap-4 rounded-3xl bg-white p-5 shadow-[0_1px_1px_rgba(8,50,42,0.04),0_16px_20px_rgba(8,50,42,0.06)] sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marketing-neutral-200">
        <Check size={20} strokeWidth={2.5} className="text-marketing-green" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-medium leading-6 text-marketing-navy-dark">{title}</h3>
        <p className="mt-3 font-roboto text-sm leading-5 text-marketing-neutral-1000">{description}</p>
      </div>
    </article>
  );
}

export function BrokerPlatformFeaturesSection() {
  return (
    <section
      className="bg-marketing-bg py-14 sm:py-16 lg:py-[140px]"
      aria-labelledby="broker-platform-features-heading"
    >
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <header className="max-w-[751px]">
          <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
            Platform Features
          </p>
          <h2
            id="broker-platform-features-heading"
            className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
          >
            Everything brokers need
            <br />
            to manage property opportunities.
          </h2>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-[60px] lg:grid-cols-3 lg:gap-[9px]">
          {PLATFORM_FEATURES.map((feature) => (
            <li key={feature.title}>
              <PlatformFeatureCard {...feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
