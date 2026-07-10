import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import heroBlueCurve from "@/assets/marketing/brokers/hero/hero-blue-curve.svg";
import heroPhoneMockup from "@/assets/marketing/brokers/hero/hero-phone-mockup.png";

export function BrokerHeroSection() {
  return (
    <section className="px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-marketing-neutral-1300 sm:rounded-[36px] lg:rounded-[44px]">
        <div
          className="pointer-events-none absolute -right-32 bottom-[-10%] hidden h-[min(50vw,480px)] w-[min(90vw,1168px)] rotate-[-22deg] lg:block"
          aria-hidden
        >
          <img
            src={heroBlueCurve}
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>

        <div className="relative grid min-h-[min(88vh,816px)] gap-10 px-6 py-12 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-6 lg:px-[124px] lg:py-[88px]">
          <div className="flex max-w-[576px] flex-col gap-10 lg:gap-[40px]">
            <div className="space-y-5">
              <h1 className="text-[40px] font-medium leading-[1.08] tracking-tight text-white sm:text-[52px] sm:leading-[1.05] lg:text-[64px] lg:leading-[70px]">
                Get verified property leads.
                <br />
                Close with confidence.
              </h1>
              <p className="max-w-xl font-roboto text-sm font-medium leading-5 text-marketing-neutral-300 sm:text-[15px] sm:leading-5">
                Join the TrustKeyper broker network and access a dedicated portal for verified property
                opportunities, lead management, and faster follow-ups.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/signup/broker"
                className="inline-flex w-full max-w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-center font-roboto text-sm font-medium text-marketing-navy-dark transition-colors hover:bg-white/95 sm:w-auto sm:px-8 sm:text-base"
              >
                Register Now
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
              <p className="font-roboto text-xs leading-4 text-marketing-neutral-300">
                Broker access is subject to profile verification.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none lg:justify-self-end">
            <img
              src={heroPhoneMockup}
              alt="Hand holding a phone showing the TrustKeyper broker portal"
              className="mx-auto h-auto w-full max-w-[min(100%,780px)] object-contain lg:mx-0"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
