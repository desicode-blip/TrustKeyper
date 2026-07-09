import React from "react";
import { Check } from "lucide-react";
import teamPhoto from "@/assets/marketing/homeowners/accountable-team/team-photo.jpg";

const TEAM_RESPONSIBILITIES = [
  "Coordinates tenant requests",
  "Tracks maintenance activity",
  "Shares property updates",
  "Escalates important issues",
  "Manages approved vendor work",
];

export function HomeownerAccountableTeamSection() {
  return (
    <section
      className="bg-marketing-neutral-100 py-14 sm:py-16 lg:py-[140px]"
      aria-labelledby="homeowner-accountable-team-heading"
    >
      <div className="mx-auto max-w-[1168px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-[482px]">
          <p className="text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
            Dedicated Support
          </p>
          <h2
            id="homeowner-accountable-team-heading"
            className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
          >
            One accountable team
            <br />
            for your property.
          </h2>
        </div>

        <div className="relative mt-12 lg:mt-[60px]">
          <div className="relative aspect-[1168/581] overflow-hidden rounded-3xl rounded-tr-[120px] bg-marketing-cloud-050 sm:rounded-tr-[200px] lg:rounded-tr-[400px]">
            <img
              src={teamPhoto}
              alt="TrustKeyper property manager conducting a property inspection visit"
              className="absolute inset-0 h-full w-[112.5%] max-w-none -translate-x-[6.25%] object-cover"
              draggable={false}
            />
          </div>

          <aside className="relative z-10 mx-auto -mt-10 max-w-[539px] rounded-3xl bg-white p-5 shadow-[0_1px_1px_rgba(8,50,42,0.04),0_16px_20px_rgba(8,50,42,0.06)] sm:p-6 lg:absolute lg:bottom-6 lg:left-5 lg:mx-0 lg:mt-0">
            <p className="font-roboto text-base font-medium leading-6 text-marketing-navy-dark">
              <span className="text-marketing-green">Your TrustKeyper team </span>
              understands your property and coordinates the people, services, and updates required
              to keep it running smoothly.
            </p>

            <ul className="mt-6 space-y-4">
              {TEAM_RESPONSIBILITIES.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marketing-green">
                    <Check size={12} strokeWidth={3} className="text-white" aria-hidden />
                  </span>
                  <span className="font-roboto text-sm font-medium leading-5 text-marketing-navy-dark">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
