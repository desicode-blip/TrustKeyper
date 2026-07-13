/**
 * Read APIs for rent payment history (tenant / owner).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { json } from "./http.js";
import { assertPaymentAuth } from "./syncAuth.js";
import { sanitizeErrorForLog } from "./sanitizeErrorForLog.js";
import { getPool, normalizePhone } from "./vercelSyncDb.js";

const phoneQuerySchema = z.object({
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .refine((v) => v.length === 10, "phone must be a 10-digit number"),
});

type TenantPaymentHistoryRow = {
  id: string;
  rent_period: string | null;
  amount_paise: number;
  status: string;
  payment_method: string | null;
  paid_at: Date | string | null;
  created_at: Date | string;
};

function requestAuthorization(req: VercelRequest): string | undefined {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (Array.isArray(header)) return header[0];
  return header;
}

function queryParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function toIsoString(value: Date | string | null): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Map a DB row to the tenant-facing payment history item (no commission fields). */
export function mapTenantPaymentHistoryItem(row: TenantPaymentHistoryRow): {
  id: string;
  rentPeriod: string | null;
  amountPaise: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
} {
  return {
    id: row.id,
    rentPeriod: row.rent_period,
    amountPaise: row.amount_paise,
    status: row.status,
    paymentMethod: row.payment_method,
    paidAt: toIsoString(row.paid_at),
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
  };
}

/**
 * GET /api/payments-tenant-history?phone=
 * Returns rent payments for agreements where tenant_contact matches the caller.
 */
export async function handleTenantPaymentHistoryRequest(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const parsed = phoneQuerySchema.safeParse({
    phone: queryParam(req.query.phone),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid query parameters";
    json(res, 400, { error: message });
    return;
  }

  const { phone } = parsed.data;
  const auth = await assertPaymentAuth(requestAuthorization(req), phone);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  try {
    const result = await getPool().query<TenantPaymentHistoryRow>(
      `SELECT
         rp.id,
         rp.rent_period,
         rp.amount_paise,
         rp.status,
         rp.payment_method,
         rp.paid_at,
         rp.created_at
       FROM public.rent_payments rp
       INNER JOIN public.agreements a ON a.id = rp.agreement_id
       WHERE RIGHT(regexp_replace(COALESCE(a.tenant_contact, ''), '\\D', '', 'g'), 10) = $1
         AND rp.payment_type = 'rent'
       ORDER BY rp.created_at DESC`,
      [phone],
    );

    json(res, 200, {
      payments: result.rows.map(mapTenantPaymentHistoryItem),
    });
  } catch (err) {
    console.error("payments-tenant-history unexpected error", sanitizeErrorForLog(err));
    json(res, 500, { error: "Internal server error" });
  }
}
