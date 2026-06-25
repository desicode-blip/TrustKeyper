import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
import { TenantDashboardPropertyCard } from "@/components/tenant/TenantDashboardPropertyCard";
import { TenantProgressTracker } from "@/components/tenant/TenantProgressTracker";
import { TenantStatusNotificationCard } from "@/components/tenant/TenantStatusNotificationCard";
import { TENANT_DOCUMENT_MANAGEMENT_UPDATED_EVENT } from "@/lib/tenantDocumentManagementSync";
import { TENANT_DOCUMENT_STATUS_UPDATED_EVENT } from "@/lib/tenantDocumentUploadStatus";
import { TENANT_PROFILE_UPDATED_EVENT } from "@/lib/tenantProfile";
import {
  getActiveTenantWorkspace,
  getTenantDisplayName,
  type TenantWorkspaceRecord,
} from "@/lib/tenantWorkspace";
import {
  resolveTenantWorkflowState,
  TENANT_WORKFLOW_UPDATED_EVENT,
  type TenantWorkflowSnapshot,
} from "@/lib/tenantWorkflowState";

export default function TenantDashboard() {
  const [workspace, setWorkspace] = useState<TenantWorkspaceRecord | null>(null);
  const [workflow, setWorkflow] = useState<TenantWorkflowSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshDashboard = useCallback(() => {
    try {
      const nextWorkspace = getActiveTenantWorkspace();
      const nextWorkflow = resolveTenantWorkflowState(nextWorkspace);
      setWorkspace(nextWorkspace);
      setWorkflow(nextWorkflow);
      setLoadError(null);
    } catch {
      setLoadError("Could not load your dashboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    const onUpdate = () => refreshDashboard();
    window.addEventListener(TENANT_DOCUMENT_STATUS_UPDATED_EVENT, onUpdate);
    window.addEventListener(TENANT_PROFILE_UPDATED_EVENT, onUpdate);
    window.addEventListener(TENANT_WORKFLOW_UPDATED_EVENT, onUpdate);
    window.addEventListener(TENANT_DOCUMENT_MANAGEMENT_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(TENANT_DOCUMENT_STATUS_UPDATED_EVENT, onUpdate);
      window.removeEventListener(TENANT_PROFILE_UPDATED_EVENT, onUpdate);
      window.removeEventListener(TENANT_WORKFLOW_UPDATED_EVENT, onUpdate);
      window.removeEventListener(TENANT_DOCUMENT_MANAGEMENT_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refreshDashboard]);

  const tenantName = getTenantDisplayName();

  return (
    <TenantLayout>
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        <h1 className="text-2xl sm:text-[28px] font-semibold text-primary leading-tight">
          Hi, {tenantName}!
        </h1>

        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex gap-3 items-start">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        ) : null}

        <TenantProgressTracker steps={workflow?.progressSteps ?? []} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <TenantDashboardPropertyCard
              workspace={workspace}
              workflowStage={workflow?.stage ?? "no_workflow"}
              loading={loading}
              errorMessage={
                workflow?.error?.code === "missing_property"
                  ? workflow.error.message
                  : undefined
              }
            />
          </div>
          <div className="lg:col-span-2">
            <TenantStatusNotificationCard
              notification={
                workflow?.notification ?? {
                  kind: "no_property",
                  title: "Loading…",
                  description: "Fetching your latest rental activity.",
                }
              }
              loading={loading}
            />
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}
