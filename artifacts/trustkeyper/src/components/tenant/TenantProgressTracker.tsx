import { Check, FileText, Hourglass, Scale } from "lucide-react";
import type { TenantProgressStep } from "@/lib/tenantWorkspace";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<string, typeof FileText> = {
  documents: FileText,
  agreement: Scale,
  review: Hourglass,
};

export interface TenantProgressTrackerProps {
  steps: TenantProgressStep[];
}

export function TenantProgressTracker({ steps }: TenantProgressTrackerProps) {
  return (
    <div className="rounded-2xl border border-[#D9EAF8] bg-[#F3F9FE] p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id] ?? FileText;
          const isLast = index === steps.length - 1;
          return (
            <div key={step.id} className="flex items-center gap-3 sm:flex-1 min-w-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  step.state === "complete" && "bg-green-500 border-green-500 text-white",
                  step.state === "current" && "bg-[#E8F4FC] border-primary text-primary",
                  step.state === "upcoming" && "bg-white border-gray-200 text-gray-400",
                )}
              >
                {step.state === "complete" ? <Check size={18} strokeWidth={2.5} /> : <Icon size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    step.state === "upcoming" ? "text-gray-400" : "text-gray-900",
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "hidden sm:block h-0.5 flex-1 mx-2 rounded-full",
                    step.state === "complete" ? "bg-primary" : "bg-gray-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
