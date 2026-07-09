import React from "react";
import brokerPortalDashboard from "@/assets/marketing/brokers/portal-preview/broker-portal-dashboard.png";

export function BrokerPortalPreviewSection() {
  return (
    <section
      className="bg-marketing-bg py-14 sm:py-16 lg:py-[140px]"
      aria-labelledby="broker-portal-preview-heading"
    >
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <header className="mx-auto max-w-[489px] text-center">
          <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
            The Broker Portal
          </p>
          <h2
            id="broker-portal-preview-heading"
            className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
          >
            Every opportunity,
            <br />
            in one organised workflow.
          </h2>
          <p className="mt-6 font-roboto text-base leading-6 text-marketing-navy-dark">
            A purpose-built workspace for managing your property leads, pipeline, and follow-ups.
          </p>
        </header>

        <div className="mt-12 lg:mt-[60px]">
          <img
            src={brokerPortalDashboard}
            alt="TrustKeyper broker portal dashboard with leads, pipeline, and task overview"
            className="h-auto w-full"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
