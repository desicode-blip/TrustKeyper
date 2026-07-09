import React from "react";
import { LayoutGrid, ShieldCheck, Timer, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyBrokerCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const WHY_BROKER_CARDS: WhyBrokerCard[] = [
  {
    icon: ShieldCheck,
    title: "Verified Opportunities",
    description:
      "Review property opportunities with owner and property information checked through TrustKeyper's verification process.",
  },
  {
    icon: Timer,
    title: "Faster Qualification",
    description: "See essential property and requirement details before beginning your follow-up.",
  },
  {
    icon: LayoutGrid,
    title: "One Organised Workflow",
    description: "Track each opportunity from new lead to site visit, negotiation, and closure.",
  },
];

function WhyBrokerCardItem({ icon: Icon, title, description }: WhyBrokerCard) {
  return (
    <article className="rounded-3xl bg-white p-8 shadow-[0_1px_1px_rgba(8,50,42,0.04),0_16px_20px_rgba(8,50,42,0.06)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marketing-neutral-200">
        <Icon size={24} strokeWidth={2} className="text-marketing-navy-dark" aria-hidden />
      </span>
      <h3 className="mt-5 text-base font-medium leading-6 text-marketing-navy-dark">{title}</h3>
      <p className="mt-4 font-roboto text-sm leading-5 text-marketing-neutral-1000">{description}</p>
    </article>
  );
}

export function BrokerWhyBrokersSection() {
  return (
    <section className="bg-white py-14 sm:py-16 lg:py-[140px]" aria-labelledby="broker-why-heading">
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-[368px] shrink-0">
            <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
              Why Brokers Use TrustKeyper
            </p>
            <h2
              id="broker-why-heading"
              className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
            >
              Spend less time
              <br />
              chasing weak leads.
            </h2>
          </div>
          <p className="max-w-[500px] font-roboto text-base leading-6 text-marketing-navy-dark lg:pb-1">
            Every lead on TrustKeyper goes through a verification process before it reaches you, so you
            can make better decisions about where to invest your time.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-[60px] lg:grid-cols-3 lg:gap-[17px]">
          {WHY_BROKER_CARDS.map((card) => (
            <li key={card.title} className={cn(card.title === "One Organised Workflow" && "md:col-span-2 lg:col-span-1")}>
              <WhyBrokerCardItem {...card} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
