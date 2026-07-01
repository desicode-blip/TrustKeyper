import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TenantRentPaymentsSnapshot } from "@/lib/tenantRentPayments";

export interface TenantMonthlyStatementCardProps {
  snapshot: TenantRentPaymentsSnapshot;
  loading?: boolean;
  payNowLoading?: boolean;
  onRequestExtension?: () => void;
  onPayNow?: () => void;
}

export function TenantMonthlyStatementCard({
  snapshot,
  loading,
  payNowLoading,
  onRequestExtension,
  onPayNow,
}: TenantMonthlyStatementCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm animate-pulse min-h-[280px]">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0px_12px_32px_-8px_rgba(25,27,35,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <h2 className="text-xl text-[#192839]">Your Monthly Statement</h2>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span className="inline-flex items-center rounded-full bg-[#fff3d6] px-2 py-1 text-sm font-semibold text-[#e8a200]">
            {snapshot.statusLabel}
          </span>
          <p className="text-sm text-[#6b7280] tracking-wide">{snapshot.dueByLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <p className="text-sm text-[#40566d] tracking-wide">Your Share (Monthly Rent)</p>
          <div className="flex items-end gap-1">
            <p className="text-[48px] font-bold leading-none text-[#191b23] tracking-tight">
              {snapshot.monthlyRentAmountLabel}
            </p>
            <p className="text-sm text-[#40566d] tracking-wide pb-2">/ month</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-5 rounded border-primary text-primary text-base font-normal hover:bg-primary/5"
              onClick={onRequestExtension}
            >
              Request Extension
            </Button>
            <Button
              type="button"
              className="h-12 px-5 rounded text-base font-normal gap-2"
              disabled={payNowLoading}
              onClick={onPayNow}
            >
              {payNowLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Pay Now
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-xl bg-primary/[0.09] px-6 py-4 space-y-3">
          <p className="text-xs font-medium text-[#40566d]">Payment Breakdown</p>
          <div className="space-y-3 text-sm tracking-wide">
            <div className="flex items-center justify-between text-black/30">
              <span>Total Property Rent</span>
              <span className="font-bold">{snapshot.breakdown.totalPropertyRentLabel}</span>
            </div>
            <div className="flex items-center justify-between text-[#40566d]">
              <span>Your Share</span>
              <span className="font-bold text-[#192839]">{snapshot.breakdown.tenantShareLabel}</span>
            </div>
            <div className="flex items-center justify-between text-[#40566d]">
              <span>Maintenance Fee</span>
              <span className="font-bold text-[#192839]">{snapshot.breakdown.maintenanceFeeLabel}</span>
            </div>
            <div className="border-t border-[rgba(195,198,215,0.3)] pt-3 flex items-center justify-between">
              <span className="text-base font-semibold text-[#192839]">Total Payable</span>
              <span className="text-base font-semibold text-primary">
                {snapshot.breakdown.totalPayableLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
