import { describe, expect, it, vi } from "vitest";
import { ensureTenantDashboardSession } from "./tenantDocumentUploadRedirect";

describe("ensureTenantDashboardSession", () => {
  it("reuses the active tenant session when it matches the phone", async () => {
    const login = vi.fn<(phone: string, role: "tenant") => Promise<boolean>>().mockResolvedValue(true);

    const ok = await ensureTenantDashboardSession(
      "+91 98765 43210",
      () => ({ phone: "9876543210", role: "tenant" }),
      login,
    );

    expect(ok).toBe(true);
    expect(login).not.toHaveBeenCalled();
  });

  it("logs the tenant back in when no matching active session exists", async () => {
    const login = vi.fn<(phone: string, role: "tenant") => Promise<boolean>>().mockResolvedValue(true);

    const ok = await ensureTenantDashboardSession(
      "+91 98765 43210",
      () => null,
      login,
    );

    expect(ok).toBe(true);
    expect(login).toHaveBeenCalledWith("9876543210", "tenant");
  });
});
