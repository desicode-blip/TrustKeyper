import React from "react";
import { Check } from "lucide-react";

const LEAD_QUALITY_BADGES = [
  "Owner identity reviewed",
  "Property details checked",
  "Requirement confirmed",
  "Property availability reviewed",
  "Duplicate leads reduced",
  "Outdated opportunities flagged",
  "Lead issue-reporting process available",
] as const;

/**
 * Figma node 7223:147509 — metadata exports only the bold prefix "Please note:".
 * Body copy below is from the reference screenshot in the design brief; confirm against Figma before launch.
 */
const LEAD_QUALITY_DISCLAIMER = {
  prefix: "Please note:",
  body: "While we verify all leads for intent and accuracy, TrustKeyper does not guarantee lead conversion or final sale outcomes.",
} as const;

function LeadQualityBadge({ label }: { label: string }) {
  return (
    <li className="flex min-h-[80px] items-center gap-4 rounded-[52px] border border-white/10 bg-marketing-neutral-1050 px-5 py-5 sm:px-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marketing-green">
        <Check size={18} strokeWidth={2.5} className="text-white" aria-hidden />
      </span>
      <span className="font-roboto text-base font-medium leading-6 text-white">{label}</span>
    </li>
  );
}

export function BrokerLeadQualitySection() {
  return (
    <section
      className="bg-marketing-neutral-1100 py-14 sm:py-16 lg:py-[140px]"
      aria-labelledby="broker-lead-quality-heading"
    >
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-[540px] shrink-0">
            <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-green">
              Lead Quality
            </p>
            <h2
              id="broker-lead-quality-heading"
              className="mt-5 text-[32px] font-medium leading-tight text-marketing-azure-050 sm:text-[40px] sm:leading-[46px]"
            >
              Better information
              <br />
              before you make the call.
            </h2>
          </div>
          <p className="max-w-[456px] font-roboto text-base leading-6 text-white lg:pb-1">
            Each property opportunity on TrustKeyper goes through a review process before it&apos;s visible
            to brokers.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-[60px] lg:grid-cols-4 lg:gap-4">
          {LEAD_QUALITY_BADGES.map((label) => (
            <LeadQualityBadge key={label} label={label} />
          ))}
        </ul>

        <div className="mt-8 rounded-[20px] border border-white/10 bg-marketing-neutral-1050 px-5 py-6 sm:px-6 lg:mt-10">
          <p className="font-roboto text-sm leading-5 text-white/90 sm:text-base sm:leading-6">
            <strong className="font-semibold text-white">{LEAD_QUALITY_DISCLAIMER.prefix}</strong>{" "}
            {LEAD_QUALITY_DISCLAIMER.body}
          </p>
        </div>
      </div>
    </section>
  );
}
