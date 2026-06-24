import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OwnerFlowButtonProps = React.ComponentProps<typeof Button> & {
  /** Filled primary CTA (default) or border-only outline. */
  flowVariant?: "primary" | "outline";
};

/**
 * Standard owner-flow page CTA: 4px radius, semibold text-sm, full width on mobile.
 * Use this for header actions and empty-state CTAs to avoid pill/+ styling drift.
 */
export function OwnerFlowButton({
  className,
  flowVariant = "primary",
  children,
  ...props
}: OwnerFlowButtonProps) {
  return (
    <Button
      variant={flowVariant === "outline" ? "outline" : "default"}
      className={cn(
        "h-10 min-h-10 w-full sm:w-fit px-6 text-sm font-semibold rounded-[4px] gap-2",
        flowVariant === "primary" && "border-0 shadow-md shadow-primary/25",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
