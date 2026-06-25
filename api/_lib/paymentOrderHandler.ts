import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { json, readJsonBody } from "./http.js";
import { getRazorpayClient } from "./razorpayClient.js";
import { extractTransfersFromOrder } from "./razorpayRouteHelpers.js";
import { assertPaymentAuth } from "./syncAuth.js";
import { getPool, normalizePhone } from "./vercelSyncDb.js";

const createOrderBodySchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .refine((v) => v.length === 10, "phone must be a 10-digit number"),
  role: z.enum(["owner", "broker"]),
  agreementId: z.string().trim().min(1, "agreementId is required"),
  rentPeriod: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, 'rentPeriod must be in "YYYY-MM" format'),
});

type CreateOrderBody = z.infer<typeof createOrderBodySchema>;

type AgreementRow = {
  property_id: string | null;
  tenant_contact: string;
  monthly_rent_paise: number | null;
  owner_name: string;
};

type RecipientConfigRow = {
  razorpay_linked_account_id: string | null;
  commission_rate_bps: number;
  validation_status: string;
};

type ExistingRentPaymentRow = {
  id: string;
  status: string;
};

type RazorpayErrorShape = {
  error?: {
    description?: string;
    code?: string;
    reason?: string;
  };
};

type RazorpayOrderShape = {
  id: string;
  transfers?: unknown;
};

type TransferSpec = {
  account: string;
  amount: number;
  currency: "INR";
  notes: {
    agreement_id: string;
    rent_period: string;
    owner_phone: string;
  };
  on_hold: 0;
};

function requestAuthorization(req: VercelRequest): string | undefined {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (Array.isArray(header)) return header[0];
  return header;
}

function parseRazorpayError(err: unknown): string {
  const shaped = err as RazorpayErrorShape;
  if (shaped.error?.description) return shaped.error.description;
  if (err instanceof Error) return err.message;
  return "Unknown Razorpay error";
}

function tenantPhoneFromContact(tenantContact: string): string {
  return normalizePhone(tenantContact);
}

async function loadAgreement(
  agreementId: string,
  phone: string,
  role: string,
): Promise<AgreementRow | null> {
  const pool = getPool();
  const result = await pool.query<AgreementRow>(
    `SELECT property_id, tenant_contact, monthly_rent_paise, owner_name
     FROM public.agreements
     WHERE id = $1 AND account_phone = $2 AND account_role = $3
     LIMIT 1`,
    [agreementId, phone, role],
  );
  return result.rows[0] ?? null;
}

async function loadRecipientConfig(phone: string, role: string): Promise<RecipientConfigRow | null> {
  const pool = getPool();
  const result = await pool.query<RecipientConfigRow>(
    `SELECT razorpay_linked_account_id, commission_rate_bps, validation_status
     FROM public.payment_recipient_config
     WHERE phone = $1 AND role = $2
     LIMIT 1`,
    [phone, role],
  );
  return result.rows[0] ?? null;
}

async function loadExistingRentPayment(
  agreementId: string,
  rentPeriod: string,
): Promise<ExistingRentPaymentRow | null> {
  const pool = getPool();
  const result = await pool.query<ExistingRentPaymentRow>(
    `SELECT id, status
     FROM public.rent_payments
     WHERE agreement_id = $1 AND rent_period = $2 AND payment_type = 'rent'
     LIMIT 1`,
    [agreementId, rentPeriod],
  );
  return result.rows[0] ?? null;
}

function buildSingleOwnerTransfer(
  linkedAccountId: string,
  ownerSettlementPaise: number,
  agreementId: string,
  rentPeriod: string,
  ownerPhone: string,
): TransferSpec[] {
  // TODO: multi-split — when agreement.rent_splits and rent_split_mode are set, build one
  // transfer per split party (lookup payment_recipient_config per co-owner phone).
  return [
    {
      account: linkedAccountId,
      amount: ownerSettlementPaise,
      currency: "INR",
      notes: {
        agreement_id: agreementId,
        rent_period: rentPeriod,
        owner_phone: ownerPhone,
      },
      on_hold: 0,
    },
  ];
}

async function persistRentPayment(
  params: {
    agreementId: string;
    propertyId: string;
    ownerPhone: string;
    tenantPhone: string;
    rentPeriod: string;
    amountPaise: number;
    commissionPaise: number;
    ownerSettlementPaise: number;
    razorpayOrderId: string;
    razorpayTransferIds: string[];
    ownerName: string;
    role: string;
  },
): Promise<string> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const paymentResult = await client.query<{ id: string }>(
      `INSERT INTO public.rent_payments (
         id,
         agreement_id,
         property_id,
         owner_phone,
         tenant_phone,
         rent_period,
         payment_type,
         amount_paise,
         commission_paise,
         owner_settlement_paise,
         razorpay_order_id,
         status,
         initiated_by,
         payer_phone
       ) VALUES (
         gen_random_uuid()::text,
         $1, $2, $3, $4, $5, 'rent',
         $6, $7, $8, $9, 'created', 'owner', $10
       )
       ON CONFLICT (agreement_id, rent_period) WHERE payment_type = 'rent'
       DO UPDATE SET
         razorpay_order_id = EXCLUDED.razorpay_order_id,
         status = 'created',
         updated_at = NOW()
       RETURNING id`,
      [
        params.agreementId,
        params.propertyId,
        params.ownerPhone,
        params.tenantPhone,
        params.rentPeriod,
        params.amountPaise,
        params.commissionPaise,
        params.ownerSettlementPaise,
        params.razorpayOrderId,
        params.tenantPhone,
      ],
    );

    const rentPaymentId = paymentResult.rows[0]?.id;
    if (!rentPaymentId) {
      throw new Error("rent_payments upsert did not return id");
    }

    await client.query(
      `DELETE FROM public.rent_payment_transfers
       WHERE rent_payment_id = $1`,
      [rentPaymentId],
    );

    const primaryTransferId = params.razorpayTransferIds[0] ?? null;

    await client.query(
      `INSERT INTO public.rent_payment_transfers (
         id,
         rent_payment_id,
         recipient_phone,
         recipient_name,
         recipient_role,
         amount_paise,
         razorpay_transfer_id,
         status
       ) VALUES (
         gen_random_uuid()::text,
         $1, $2, $3, $4, $5, $6, 'pending'
       )`,
      [
        rentPaymentId,
        params.ownerPhone,
        params.ownerName,
        params.role,
        params.ownerSettlementPaise,
        primaryTransferId,
      ],
    );

    if (params.razorpayTransferIds.length > 0) {
      await client.query(
        `UPDATE public.rent_payments
         SET razorpay_transfer_ids = $2::jsonb,
             updated_at = NOW()
         WHERE id = $1`,
        [rentPaymentId, JSON.stringify(params.razorpayTransferIds)],
      );
    }

    await client.query("COMMIT");
    return rentPaymentId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function handlePaymentCreateOrderRequest(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const rawBody = readJsonBody(req);
  if (rawBody === null) {
    json(res, 400, { error: "Malformed JSON body" });
    return;
  }

  const parsed = createOrderBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body";
    json(res, 400, { error: message });
    return;
  }

  const body: CreateOrderBody = parsed.data;
  const phone = body.phone;

  const auth = await assertPaymentAuth(requestAuthorization(req), phone);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  try {
    const agreement = await loadAgreement(body.agreementId, phone, body.role);
    if (!agreement) {
      json(res, 404, { error: "Agreement not found" });
      return;
    }

    const tenantPhone = tenantPhoneFromContact(agreement.tenant_contact);
    if (!agreement.property_id || tenantPhone.length !== 10) {
      json(res, 400, {
        error: "Agreement is missing property or tenant — cannot collect rent",
      });
      return;
    }

    const amountPaise = agreement.monthly_rent_paise;
    if (amountPaise == null || amountPaise <= 0) {
      json(res, 400, { error: "Agreement has no monthly rent configured" });
      return;
    }

    const recipientConfig = await loadRecipientConfig(phone, body.role);
    if (!recipientConfig?.razorpay_linked_account_id) {
      json(res, 409, {
        error: "Owner payment account not set up",
        hint: "Complete onboarding first",
      });
      return;
    }

    if (recipientConfig.validation_status !== "activated") {
      json(res, 409, {
        error: "Owner payment account not yet activated",
        validationStatus: recipientConfig.validation_status,
        hint: "Account is under review — transfers available once activated",
      });
      return;
    }

    const existingPayment = await loadExistingRentPayment(body.agreementId, body.rentPeriod);
    if (existingPayment && existingPayment.status !== "failed") {
      json(res, 409, {
        error: "Rent already collected or in progress for this period",
        status: existingPayment.status,
      });
      return;
    }

    const commissionRateBps = recipientConfig.commission_rate_bps ?? 0;
    const commissionPaise = Math.round((amountPaise * commissionRateBps) / 10000);
    const ownerSettlementPaise = amountPaise - commissionPaise;

    const linkedAccountId = recipientConfig.razorpay_linked_account_id;
    const transfers = buildSingleOwnerTransfer(
      linkedAccountId,
      ownerSettlementPaise,
      body.agreementId,
      body.rentPeriod,
      phone,
    );

    const receipt = `rent_${body.agreementId}_${body.rentPeriod}`;

    let order: RazorpayOrderShape;
    try {
      order = (await getRazorpayClient().orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt,
        transfers,
      })) as RazorpayOrderShape;
    } catch (err) {
      console.error("Razorpay orders.create failed", {
        agreementId: body.agreementId,
        rentPeriod: body.rentPeriod,
        phone,
        role: body.role,
        error: err as RazorpayErrorShape,
      });
      json(res, 502, {
        error: "Failed to create payment order",
        detail: parseRazorpayError(err),
      });
      return;
    }

    const orderTransfers = extractTransfersFromOrder(order);
    const razorpayTransferIds = orderTransfers.map((t) => t.id);

    let rentPaymentId: string;
    try {
      rentPaymentId = await persistRentPayment({
        agreementId: body.agreementId,
        propertyId: agreement.property_id,
        ownerPhone: phone,
        tenantPhone,
        rentPeriod: body.rentPeriod,
        amountPaise,
        commissionPaise,
        ownerSettlementPaise,
        razorpayOrderId: order.id,
        razorpayTransferIds,
        ownerName: agreement.owner_name,
        role: body.role,
      });
    } catch (err) {
      console.error("rent_payments write failed after Razorpay order created", {
        orderId: order.id,
        agreementId: body.agreementId,
        rentPeriod: body.rentPeriod,
        error: err,
      });
      json(res, 500, { error: "Failed to record payment order" });
      return;
    }

    json(res, 200, {
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      rentPaymentId,
      commissionPaise,
      ownerSettlementPaise,
      rentPeriod: body.rentPeriod,
    });
  } catch (err) {
    console.error("payments-create-order unexpected error", { error: err });
    json(res, 500, { error: "Internal server error" });
  }
}
