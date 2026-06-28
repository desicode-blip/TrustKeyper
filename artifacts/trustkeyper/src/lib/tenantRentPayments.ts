import type { TenantWorkspaceRecord } from "./tenantWorkspace";

export type TenantRentPaymentHistoryRow = {
  id: string;
  monthLabel: string;
  amountLabel: string;
  paidOnLabel: string;
  paymentMode: string;
};

export type TenantRentPaymentReceipt = {
  amountPaidLabel: string;
  monthLabel: string;
  paidOnLabel: string;
  paymentMode: string;
  transactionId: string;
  fromLabel: string;
  toLabel: string;
  propertyLabel: string;
};

export type TenantRentPaymentsSnapshot = {
  statusLabel: string;
  dueByLabel: string;
  currentDueDateLabel: string;
  minimumExtensionDate: string;
  monthlyRentAmountLabel: string;
  breakdown: {
    totalPropertyRentLabel: string;
    tenantShareLabel: string;
    maintenanceFeeLabel: string;
    totalPayableLabel: string;
  };
  history: TenantRentPaymentHistoryRow[];
  hasMoreHistory: boolean;
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function parseAmount(value?: string): number {
  if (!value) return 0;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function formatDueByLabel(rentDueDay?: string): string {
  return `Due by ${formatCurrentDueDateLabel(rentDueDay)}`;
}

export function computeCurrentRentDueDate(rentDueDay?: string): Date {
  const dueDay = rentDueDay ? Number(rentDueDay) : 5;
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1);
  if (Number.isFinite(dueDay) && dueDay >= 1 && dueDay <= 28) {
    dueDate.setDate(dueDay);
  }
  dueDate.setHours(0, 0, 0, 0);
  return dueDate;
}

export function formatCurrentDueDateLabel(rentDueDay?: string): string {
  return computeCurrentRentDueDate(rentDueDay).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function computeDaysLeft(rentDueDay?: string): number {
  const dueDate = computeCurrentRentDueDate(rentDueDay);
  const diffMs = dueDate.getTime() - Date.now();
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function minimumExtensionDateInput(rentDueDay?: string): string {
  const nextDay = computeCurrentRentDueDate(rentDueDay);
  nextDay.setDate(nextDay.getDate() + 1);
  return formatDateInputValue(nextDay);
}

export function buildTenantRentPaymentsSnapshot(
  workspace: TenantWorkspaceRecord | null,
): TenantRentPaymentsSnapshot {
  const monthlyRent = parseAmount(workspace?.monthlyRent ?? workspace?.agreementSnapshot?.monthlyRent);
  const tenantShare = monthlyRent > 0 ? Math.max(monthlyRent - 2000, 11000) : 11000;
  const maintenanceFee = 2000;
  const totalPropertyRent = tenantShare * 2 + maintenanceFee;
  const totalPayable = monthlyRent > 0 ? monthlyRent : 13000;
  const daysLeft = computeDaysLeft(workspace?.agreementSnapshot?.rentDueDay);
  const rentDueDay = workspace?.agreementSnapshot?.rentDueDay;

  return {
    statusLabel: `Pending (${daysLeft} days left)`,
    dueByLabel: formatDueByLabel(rentDueDay),
    currentDueDateLabel: formatCurrentDueDateLabel(rentDueDay),
    minimumExtensionDate: minimumExtensionDateInput(rentDueDay),
    monthlyRentAmountLabel: formatInr(totalPayable),
    breakdown: {
      totalPropertyRentLabel: formatInr(totalPropertyRent > 0 ? totalPropertyRent : 26000),
      tenantShareLabel: formatInr(tenantShare),
      maintenanceFeeLabel: formatInr(maintenanceFee),
      totalPayableLabel: formatInr(totalPayable),
    },
    history: [
      {
        id: "rent-mar-2026",
        monthLabel: "Mar 2026",
        amountLabel: formatInr(totalPayable),
        paidOnLabel: "Mar 1, 2026",
        paymentMode: "Net Banking",
      },
    ],
    hasMoreHistory: true,
  };
}

function buildTransactionId(rowId: string): string {
  const suffix = rowId.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
  return `TXN22026${suffix.padStart(5, "0").slice(0, 5)}`;
}

export function buildTenantRentPaymentReceipt(
  workspace: TenantWorkspaceRecord | null,
  row: TenantRentPaymentHistoryRow,
): TenantRentPaymentReceipt {
  const tenantName =
    workspace?.tenantName?.trim() ||
    workspace?.agreementSnapshot?.tenantName?.trim() ||
    "Tenant";
  const ownerName =
    workspace?.ownerName?.trim() ||
    workspace?.agreementSnapshot?.ownerName?.trim() ||
    "Property Owner";
  const propertyLabel =
    workspace?.propertyLabel?.trim() ||
    workspace?.agreementSnapshot?.propertyAddress?.trim() ||
    "Assigned Property";

  return {
    amountPaidLabel: row.amountLabel,
    monthLabel: row.monthLabel,
    paidOnLabel: row.paidOnLabel,
    paymentMode: row.paymentMode,
    transactionId: buildTransactionId(row.id),
    fromLabel: tenantName,
    toLabel: ownerName,
    propertyLabel,
  };
}

export function findRentPaymentHistoryRow(
  snapshot: TenantRentPaymentsSnapshot,
  rowId: string,
): TenantRentPaymentHistoryRow | undefined {
  return snapshot.history.find((row) => row.id === rowId);
}
