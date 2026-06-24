import { FileText } from "lucide-react";
import type { TenantNotificationContent } from "@/lib/tenantWorkspace";
import { cn } from "@/lib/utils";

export interface TenantStatusNotificationCardProps {
  notification: TenantNotificationContent;
  loading?: boolean;
}

export function TenantStatusNotificationCard({ notification, loading }: TenantStatusNotificationCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-10 w-10 rounded-xl bg-gray-100 mb-4" />
        <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  const isHighlight =
    notification.kind === "documents_under_review" ||
    notification.kind === "agreement_being_prepared" ||
    notification.kind === "agreement_ready";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 sm:p-6 shadow-sm h-full",
        isHighlight ? "border-primary/20 bg-[#F8FBFF]" : "border-gray-200",
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
          isHighlight ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500",
        )}
      >
        <FileText size={20} />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{notification.description}</p>
    </div>
  );
}
