import { describe, expect, it } from "vitest";
import {
  buildTenantRentPaymentReceipt,
  buildTenantRentPaymentsSnapshot,
  findRentPaymentHistoryRow,
} from "./tenantRentPayments";
import type { TenantWorkspaceRecord } from "./tenantWorkspace";

const workspace: TenantWorkspaceRecord = {
  phone: "9876543210",
  tenantName: "Meena",
  propertyLabel: "Flat 401",
  monthlyRent: "13000",
  agreementSnapshot: {
    ownerName: "Anita",
    tenantName: "Meena",
    propertyAddress: "Madhapur",
    leaseStartDate: "2025-09-05",
    monthlyRent: "13000",
    securityDeposit: "39000",
    rentDueDay: "5",
    lockInPeriod: "11 months",
    noticePeriod: "2 months",
  },
  updatedAt: Date.now(),
};

describe("tenantRentPayments", () => {
  it("builds monthly statement and history snapshot", () => {
    const snapshot = buildTenantRentPaymentsSnapshot(workspace);
    expect(snapshot.monthlyRentAmountLabel).toBe("₹13,000");
    expect(snapshot.breakdown.totalPayableLabel).toBe("₹13,000");
    expect(snapshot.statusLabel).toMatch(/^Pending \(/);
    expect(snapshot.dueByLabel).toContain("Due by");
    expect(snapshot.currentDueDateLabel).toMatch(/[A-Za-z]+ \d{1,2}, \d{4}/);
    expect(snapshot.minimumExtensionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.history[0]?.monthLabel).toBe("Mar 2026");
    expect(snapshot.history[0]?.paymentMode).toBe("Net Banking");
  });

  it("builds receipt detail from a history row", () => {
    const snapshot = buildTenantRentPaymentsSnapshot(workspace);
    const row = findRentPaymentHistoryRow(snapshot, "rent-mar-2026");
    expect(row).toBeDefined();
    if (!row) return;

    const receipt = buildTenantRentPaymentReceipt(workspace, row);
    expect(receipt.amountPaidLabel).toBe("₹13,000");
    expect(receipt.monthLabel).toBe("Mar 2026");
    expect(receipt.paidOnLabel).toBe("Mar 1, 2026");
    expect(receipt.paymentMode).toBe("Net Banking");
    expect(receipt.transactionId).toMatch(/^TXN22026/);
    expect(receipt.fromLabel).toBe("Meena");
    expect(receipt.toLabel).toBe("Anita");
    expect(receipt.propertyLabel).toBe("Flat 401");
  });
});
