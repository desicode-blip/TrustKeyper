import { bigint, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { agreementsTable } from "./agreements.js";
import { propertiesTable } from "./properties.js";

export const ownerPaymentConfigTable = pgTable("owner_payment_config", {
  phone: text("phone").primaryKey(),
  razorpayContactId: text("razorpay_contact_id"),
  razorpayFundAccountId: text("razorpay_fund_account_id"),
  razorpayLinkedAccountId: text("razorpay_linked_account_id"),
  commissionRateBps: integer("commission_rate_bps").notNull().default(0),
  validationStatus: text("validation_status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const rentPaymentsTable = pgTable(
  "rent_payments",
  {
    id: text("id").primaryKey(),
    agreementId: text("agreement_id").references(() => agreementsTable.id, { onDelete: "set null" }),
    propertyId: text("property_id").references(() => propertiesTable.id, { onDelete: "set null" }),
    ownerPhone: text("owner_phone").notNull(),
    tenantPhone: text("tenant_phone").notNull(),
    rentPeriod: text("rent_period").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    commissionPaise: bigint("commission_paise", { mode: "number" }).notNull().default(0),
    ownerSettlementPaise: bigint("owner_settlement_paise", { mode: "number" }),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpayTransferIds: jsonb("razorpay_transfer_ids"),
    initiatedBy: text("initiated_by"),
    payerPhone: text("payer_phone"),
    status: text("status").notNull().default("created"),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
    settledAt: timestamp("settled_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    agreementRentPeriodUnique: unique("rent_payments_agreement_id_rent_period_unique").on(
      table.agreementId,
      table.rentPeriod,
    ),
  }),
);

export const rentPaymentTransfersTable = pgTable("rent_payment_transfers", {
  id: text("id").primaryKey(),
  rentPaymentId: text("rent_payment_id")
    .notNull()
    .references(() => rentPaymentsTable.id, { onDelete: "cascade" }),
  ownerPhone: text("owner_phone").notNull(),
  ownerName: text("owner_name").notNull().default(""),
  amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
  razorpayTransferId: text("razorpay_transfer_id"),
  razorpayFundAccountId: text("razorpay_fund_account_id"),
  status: text("status").notNull().default("pending"),
  processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export type OwnerPaymentConfigRow = typeof ownerPaymentConfigTable.$inferSelect;
export type InsertOwnerPaymentConfigRow = typeof ownerPaymentConfigTable.$inferInsert;
export type RentPaymentsRow = typeof rentPaymentsTable.$inferSelect;
export type InsertRentPaymentsRow = typeof rentPaymentsTable.$inferInsert;
export type RentPaymentTransfersRow = typeof rentPaymentTransfersTable.$inferSelect;
export type InsertRentPaymentTransfersRow = typeof rentPaymentTransfersTable.$inferInsert;
