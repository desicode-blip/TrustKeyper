import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
import { TenantMonthlyStatementCard } from "@/components/tenant/TenantMonthlyStatementCard";
import { TenantPaymentHistoryCard } from "@/components/tenant/TenantPaymentHistoryCard";
import { TenantRentBackLink } from "@/components/tenant/TenantRentBackLink";
import { TenantRentExtensionModal } from "@/components/tenant/TenantRentExtensionModal";
import { TenantRentPaymentReceiptModal } from "@/components/tenant/TenantRentPaymentReceiptModal";
import { toast } from "@/hooks/use-toast";
import {
  buildTenantRentPaymentReceipt,
  buildTenantRentPaymentsSnapshot,
  findRentPaymentHistoryRow,
  type TenantRentPaymentReceipt,
  type TenantRentPaymentsSnapshot,
} from "@/lib/tenantRentPayments";
import { getActiveTenantWorkspace } from "@/lib/tenantWorkspace";

export default function TenantRentPayments() {
  const [snapshot, setSnapshot] = useState<TenantRentPaymentsSnapshot | null>(null);
  const [workspace, setWorkspace] = useState<ReturnType<typeof getActiveTenantWorkspace>>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TenantRentPaymentReceipt | null>(null);
  const [extensionOpen, setExtensionOpen] = useState(false);

  const refresh = useCallback(() => {
    try {
      const activeWorkspace = getActiveTenantWorkspace();
      setWorkspace(activeWorkspace);
      setSnapshot(buildTenantRentPaymentsSnapshot(activeWorkspace));
      setLoadError(null);
    } catch {
      setLoadError("Could not load your rent payments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showPlaceholderToast = (title: string) => {
    toast({
      title,
      description: "This action will be connected to payments in a later release.",
    });
  };

  const handleViewReceipt = (rowId: string) => {
    if (!snapshot) return;
    const row = findRentPaymentHistoryRow(snapshot, rowId);
    if (!row) return;
    setReceipt(buildTenantRentPaymentReceipt(workspace, row));
  };

  return (
    <TenantLayout>
      <div className="max-w-6xl mx-auto space-y-7">
        <TenantRentBackLink />

        {loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex gap-3 items-start">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        ) : null}

        <TenantMonthlyStatementCard
          snapshot={snapshot ?? buildTenantRentPaymentsSnapshot(null)}
          loading={loading}
          onRequestExtension={() => setExtensionOpen(true)}
          onPayNow={() => showPlaceholderToast("Pay now")}
        />

        <TenantPaymentHistoryCard
          rows={snapshot?.history ?? []}
          loading={loading}
          hasMore={snapshot?.hasMoreHistory}
          onDownloadAll={() => showPlaceholderToast("Download all receipts")}
          onViewReceipt={handleViewReceipt}
          onDownloadReceipt={() => showPlaceholderToast("Download receipt")}
          onViewAllActivity={() => showPlaceholderToast("View all activity")}
        />
      </div>

      <TenantRentPaymentReceiptModal
        open={receipt !== null}
        receipt={receipt}
        onClose={() => setReceipt(null)}
      />

      <TenantRentExtensionModal
        open={extensionOpen}
        currentDueDateLabel={
          snapshot?.currentDueDateLabel ?? buildTenantRentPaymentsSnapshot(null).currentDueDateLabel
        }
        minimumExtensionDate={
          snapshot?.minimumExtensionDate ?? buildTenantRentPaymentsSnapshot(null).minimumExtensionDate
        }
        onClose={() => setExtensionOpen(false)}
        onSubmitted={() => {
          toast({
            title: "Extension request submitted",
            description: "Your owner will review this request and respond shortly.",
          });
        }}
      />
    </TenantLayout>
  );
}
