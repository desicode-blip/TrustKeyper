import { describe, expect, it } from "vitest";
import {
  resolveReturningTenantAccess,
  shouldOpenDocumentManagement,
} from "./tenantReturningAccess";

describe("tenantReturningAccess", () => {
  it("opens document management for submitted invites", () => {
    expect(shouldOpenDocumentManagement("submitted")).toBe(true);
    expect(shouldOpenDocumentManagement("in_progress")).toBe(false);
  });

  it("skips OTP when tenant session matches invite phone", () => {
    const decision = resolveReturningTenantAccess({
      inviteStatus: "submitted",
      tenantPhone: "+91 9876543210",
      hasActiveTenantSession: true,
      activeTenantPhone: "9876543210",
      hasUploadSession: false,
      hasTenantAccount: true,
    });
    expect(decision).toEqual({ kind: "immediate", reason: "active_tenant_session" });
  });

  it("requires OTP when account exists but session expired", () => {
    const decision = resolveReturningTenantAccess({
      inviteStatus: "submitted",
      tenantPhone: "9876543210",
      hasActiveTenantSession: false,
      hasUploadSession: false,
      hasTenantAccount: true,
    });
    expect(decision).toEqual({ kind: "otp", reason: "account_exists" });
  });

  it("uses upload session for immediate access", () => {
    const decision = resolveReturningTenantAccess({
      inviteStatus: "submitted",
      tenantPhone: "9876543210",
      hasActiveTenantSession: false,
      hasUploadSession: true,
      hasTenantAccount: false,
    });
    expect(decision).toEqual({ kind: "immediate", reason: "upload_session" });
  });
});
