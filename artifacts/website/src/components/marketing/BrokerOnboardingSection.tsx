import React from "react";
import { Link } from "wouter";

interface OnboardingStep {
  number: number;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    number: 1,
    title: "Create your broker profile",
    description: "Register with your professional and contact details.",
  },
  {
    number: 2,
    title: "Complete verification",
    description: "Our team reviews your submitted profile information.",
  },
  {
    number: 3,
    title: "Select preferred areas and property types",
    description: "Set your operating localities and property categories.",
  },
  {
    number: 4,
    title: "Access matching leads",
    description: "Begin receiving verified property opportunities through the portal.",
  },
];

function StepBadge({ number }: { number: number }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marketing-neutral-1100 text-sm font-bold text-white">
      {number}
    </span>
  );
}

export function BrokerOnboardingSection() {
  return (
    <section className="bg-white py-14 sm:py-16 lg:py-[140px]" aria-labelledby="broker-onboarding-heading">
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <header className="max-w-[589px]">
          <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
            Broker Onboarding
          </p>
          <h2
            id="broker-onboarding-heading"
            className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
          >
            Start receiving relevant
            <br />
            opportunities in four steps.
          </h2>
        </header>

        <div className="relative mt-12 lg:mt-[52px]">
          <div
            className="pointer-events-none absolute left-[40px] right-[40px] top-5 hidden h-px bg-marketing-neutral-200 lg:block"
            aria-hidden
          />

          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {ONBOARDING_STEPS.map((step) => (
              <li key={step.number} className="flex flex-col gap-5">
                <StepBadge number={step.number} />
                <div className="space-y-3">
                  <h3 className="font-roboto text-base font-medium leading-6 text-marketing-navy-dark">
                    {step.title}
                  </h3>
                  <p className="font-roboto text-sm leading-5 text-marketing-neutral-1000">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/signup/broker"
          className="mt-12 inline-flex h-14 items-center justify-center rounded-full bg-marketing-green px-10 text-base font-medium text-marketing-neutral-1100 transition-colors hover:bg-marketing-green/90 lg:mt-[52px]"
        >
          Start Broker Registration
        </Link>
      </div>
    </section>
  );
}
