import { FileText } from "lucide-react";
import { Link } from "wouter";
import type { TenantNotificationContent } from "@/lib/tenantWorkspace";
import { cn } from "@/lib/utils";

export interface TenantStatusNotificationCardProps {
  notification: TenantNotificationContent;
  loading?: boolean;
}

export function TenantStatusNotificationCard({ notification, loading }: TenantStatusNotificationCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#D9EAF8] bg-[#F3F9FE] p-4 h-full animate-pulse">
        <div className="rounded-xl bg-white p-5 h-full min-h-[160px]">
          <div className="h-10 w-10 rounded-xl bg-gray-100 mb-4" />
          <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>
      </div>
    );
  }

  const isHighlight =
    notification.kind === "documents_under_review" ||
    notification.kind === "agreement_being_prepared" ||
    notification.kind === "agreement_ready";

  return (
    <div className="rounded-2xl border border-[#D9EAF8] bg-[#F3F9FE] p-4 h-full">
      <div
        className={cn(
          "rounded-xl bg-white p-5 sm:p-6 h-full flex flex-col shadow-sm",
          isHighlight && "border border-primary/10",
        )}
      >
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center mb-4 shrink-0",
            isHighlight ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500",
          )}
        >
          <FileText size={20} />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed flex-1">{notification.description}</p>
        {notification.actionHref && notification.actionLabel ? (
          <Link
            href={notification.actionHref}
            className="inline-flex items-center justify-center mt-4 h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors w-fit"
          >
            {notification.actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
