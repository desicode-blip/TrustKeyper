import React from "react";

export type FlowSegmentOption<T extends string> = { value: T; label: string };

type FlowSegmentTabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  /** NoInfer keeps T from `value` / `onChange`, not widened by `.map()` on options */
  options: FlowSegmentOption<NoInfer<T>>[];
  className?: string;
  /** Stretch tabs to fill the container width (e.g. 3-way brokerage payer). */
  fullWidth?: boolean;
};

export function FlowSegmentTabs<T extends string>({
  value,
  onChange,
  options,
  className = "",
  fullWidth = false,
}: FlowSegmentTabsProps<T>) {
  return (
    <div
      className={`inline-flex rounded-xl border border-gray-200 bg-white p-1 ${
        fullWidth ? "w-full" : "w-fit"
      } ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              fullWidth ? "flex-1 text-center" : ""
            } ${
              active
                ? "bg-green-50 text-green-800 border border-green-200"
                : "text-gray-600 hover:bg-gray-50 border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
