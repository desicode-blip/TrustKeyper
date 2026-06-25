import { useEffect, useState } from "react";
import TenantLayout from "@/components/TenantLayout";
import { TenantDashboardProfileCard } from "@/components/tenant/TenantDashboardProfileCard";
import { TenantDashboardPropertyCard } from "@/components/tenant/TenantDashboardPropertyCard";
import { TenantProgressTracker } from "@/components/tenant/TenantProgressTracker";
import { TenantStatusNotificationCard } from "@/components/tenant/TenantStatusNotificationCard";
import { TENANT_DOCUMENT_STATUS_UPDATED_EVENT } from "@/lib/tenantDocumentUploadStatus";
import { TENANT_PROFILE_UPDATED_EVENT } from "@/lib/tenantProfile";
import {
  getActiveTenantWorkspace,
  getTenantDisplayName,
  resolveTenantNotification,
  resolveTenantProgressSteps,
  type TenantWorkspaceRecord,
} from "@/lib/tenantWorkspace";

export default function TenantDashboard() {
  const [workspace, setWorkspace] = useState<TenantWorkspaceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspace = () => {
    setWorkspace(getActiveTenantWorkspace());
    setLoading(false);
  };

  useEffect(() => {
    refreshWorkspace();
    const onUpdate = () => refreshWorkspace();
    window.addEventListener(TENANT_DOCUMENT_STATUS_UPDATED_EVENT, onUpdate);
    window.addEventListener(TENANT_PROFILE_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(TENANT_DOCUMENT_STATUS_UPDATED_EVENT, onUpdate);
      window.removeEventListener(TENANT_PROFILE_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const tenantName = getTenantDisplayName();
  const progressSteps = resolveTenantProgressSteps(workspace);
  const notification = resolveTenantNotification(workspace);

  return (
    <TenantLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-[28px] font-semibold text-primary leading-tight">
          Hi, {tenantName}!
        </h1>

        <TenantProgressTracker steps={progressSteps} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TenantDashboardPropertyCard workspace={workspace} loading={loading} />
          <TenantStatusNotificationCard notification={notification} loading={loading} />
        </div>

        <TenantDashboardProfileCard loading={loading} />
      </div>
    </TenantLayout>
  );
}
