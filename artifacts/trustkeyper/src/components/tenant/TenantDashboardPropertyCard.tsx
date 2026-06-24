import { Building2, MapPin } from "lucide-react";
import type { TenantWorkspaceRecord } from "@/lib/tenantWorkspace";
import { formatTenantRent } from "@/lib/tenantWorkspace";

export interface TenantDashboardPropertyCardProps {
  workspace: TenantWorkspaceRecord | null;
  loading?: boolean;
}

export function TenantDashboardPropertyCard({ workspace, loading }: TenantDashboardPropertyCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 animate-pulse">
        <div className="flex gap-4">
          <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!workspace?.propertyLabel) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
        <Building2 size={28} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-800">No property assigned</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Your assigned rental will appear here once your owner or broker completes onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex gap-4 items-stretch">
        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {workspace.propertyImage ? (
            <img
              src={workspace.propertyImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F4FC] to-[#D4EBE4]">
              <Building2 size={28} className="text-primary/35" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
            {workspace.propertyLabel}
          </h2>
          {workspace.propertyAddress ? (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{workspace.propertyAddress}</span>
            </p>
          ) : null}
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Expected Rent</p>
            <p className="text-lg font-semibold text-primary">{formatTenantRent(workspace.monthlyRent)}</p>
          </div>
          {workspace.propertyStatus ? (
            <p className="text-xs text-gray-500 mt-2">Status: {workspace.propertyStatus}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
