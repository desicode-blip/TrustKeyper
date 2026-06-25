import { describe, expect, it } from "vitest";
import {
  buildProgressStepsFromStage,
  resolveTenantWorkflowState,
  shouldShowBrokerForStage,
} from "./tenantWorkflowState";
import type { TenantWorkspaceRecord } from "./tenantWorkspace";

const baseWorkspace: TenantWorkspaceRecord = {
  phone: "9876543210",
  tenantName: "Meena",
  propertyId: "prop-1",
  propertyLabel: "Prestige Unit 1806",
  propertyAddress: "Financial District, Hyderabad",
  monthlyRent: "13000",
  securityDeposit: "39000",
  propertyType: "Apartment",
  propertyStatus: "Available",
  ownerName: "Anita Owner",
  brokerName: "Demo Broker",
  requesterName: "Demo Broker",
  requesterRole: "broker",
  updatedAt: Date.now(),
};

describe("tenantWorkflowState", () => {
  it("matches design state after documents submitted", () => {
    const snapshot = resolveTenantWorkflowState({
      ...baseWorkspace,
      documentUploadStatus: "documents_submitted",
      documentUploadSubmittedAt: Date.now(),
    });

    expect(snapshot.stage).toBe("documents_under_review");
    expect(snapshot.progressSteps[0]?.state).toBe("complete");
    expect(snapshot.progressSteps[1]?.state).toBe("current");
    expect(snapshot.progressSteps[2]?.state).toBe("upcoming");
    expect(snapshot.notification.title).toBe("Documents Under Review");
    expect(snapshot.notification.description).toContain("currently being reviewed");
    expect(snapshot.showBroker).toBe(true);
  });

  it("hides broker after agreement is ready", () => {
    expect(shouldShowBrokerForStage("documents_under_review")).toBe(true);
    expect(shouldShowBrokerForStage("agreement_ready")).toBe(false);
  });

  it("keeps progress and notification in sync for in-progress uploads", () => {
    const snapshot = resolveTenantWorkflowState({
      ...baseWorkspace,
      documentUploadStatus: "documents_in_progress",
      documentUploadToken: "adu_token",
    });

    expect(snapshot.stage).toBe("documents_in_progress");
    expect(snapshot.progressSteps[0]?.state).toBe("current");
    expect(snapshot.notification.actionHref).toBe("/upload/documents/adu_token");
  });

  it("builds completed document step for agreement ready", () => {
    const steps = buildProgressStepsFromStage("agreement_ready");
    expect(steps[0]?.state).toBe("complete");
    expect(steps[1]?.state).toBe("complete");
    expect(steps[2]?.state).toBe("current");
  });

  it("returns empty-state notification when no property assigned", () => {
    const snapshot = resolveTenantWorkflowState({
      ...baseWorkspace,
      propertyId: undefined,
      propertyLabel: "",
    });
    expect(snapshot.stage).toBe("no_property");
    expect(snapshot.notification.kind).toBe("no_property");
  });

  it("flags missing property relationships", () => {
    const snapshot = resolveTenantWorkflowState({
      ...baseWorkspace,
      propertyMissing: true,
    });
    expect(snapshot.stage).toBe("property_removed");
    expect(snapshot.error?.code).toBe("missing_property");
  });
});
