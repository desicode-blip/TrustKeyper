import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { json, readJsonBody } from "./http.js";
import { getRazorpayClient } from "./razorpayClient.js";
import { assertPaymentAuth } from "./syncAuth.js";
import { getPool } from "./vercelSyncDb.js";

const onboardBodySchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .refine((v) => v.length === 10, "phone must be a 10-digit number"),
  role: z.enum(["owner", "broker"]),
  legalName: z.string().trim().min(4, "legalName must be at least 4 characters"),
  email: z.string().trim().email("email must be valid"),
  registeredAddress: z.object({
    street1: z.string().trim().min(1, "street1 is required"),
    street2: z.string().trim().optional(),
    city: z.string().trim().min(1, "city is required"),
    state: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z][A-Z0-9_ ]+$/.test(v), "state must be an uppercase Indian state name"),
    postalCode: z
      .string()
      .trim()
      .refine((v) => /^\d{6}$/.test(v), "postalCode must be a 6-digit pin code"),
    country: z.string().trim().default("IN"),
  }),
});

type OnboardBody = z.infer<typeof onboardBodySchema>;

type RecipientConfigRow = {
  razorpay_linked_account_id: string | null;
  validation_status: string;
};

type RazorpayErrorShape = {
  error?: {
    description?: string;
    code?: string;
    reason?: string;
    metadata?: unknown;
  };
};

function requestAuthorization(req: VercelRequest): string | undefined {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (Array.isArray(header)) return header[0];
  return header;
}

function razorpayReferenceId(phone: string, role: string): string {
  return `tk-${phone}-${role}`;
}

function parseRazorpayError(err: unknown): string {
  const shaped = err as RazorpayErrorShape;
  if (shaped.error?.description) return shaped.error.description;
  if (err instanceof Error) return err.message;
  return "Unknown Razorpay error";
}

async function getRecipientConfig(
  phone: string,
  role: string,
): Promise<RecipientConfigRow | null> {
  const result = await getPool().query<RecipientConfigRow>(
    `SELECT razorpay_linked_account_id, validation_status
     FROM payment_recipient_config
     WHERE phone = $1 AND role = $2`,
    [phone, role],
  );
  return result.rows[0] ?? null;
}

async function upsertRecipientAccount(params: {
  phone: string;
  role: string;
  accountId: string;
  referenceId: string;
}): Promise<void> {
  await getPool().query(
    `INSERT INTO payment_recipient_config (
       phone,
       role,
       razorpay_linked_account_id,
       razorpay_reference_id,
       validation_status,
       created_at,
       updated_at
     ) VALUES ($1, $2, $3, $4, 'submitted', NOW(), NOW())
     ON CONFLICT (phone, role) DO UPDATE SET
       razorpay_linked_account_id = EXCLUDED.razorpay_linked_account_id,
       razorpay_reference_id = EXCLUDED.razorpay_reference_id,
       validation_status = EXCLUDED.validation_status,
       updated_at = NOW()`,
    [params.phone, params.role, params.accountId, params.referenceId],
  );
}

function buildRazorpayAccountPayload(body: OnboardBody, referenceId: string) {
  const { registeredAddress: addr } = body;
  return {
    email: body.email,
    phone: body.phone,
    type: "route" as const,
    reference_id: referenceId,
    legal_business_name: body.legalName,
    customer_facing_business_name: body.legalName,
    contact_name: body.legalName,
    business_type: "individual",
    profile: {
      category: "housing",
      subcategory: "real_estate_agents",
      business_model: "Individual property owner collecting monthly rent",
      addresses: {
        registered: {
          street1: addr.street1,
          street2: addr.street2 ?? "",
          city: addr.city,
          state: addr.state,
          postal_code: addr.postalCode,
          country: addr.country,
        },
      },
    },
  };
}

export async function handlePaymentOnboardRequest(
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

  const parsed = onboardBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body";
    json(res, 400, { error: message });
    return;
  }

  const body = parsed.data;
  const phone = body.phone;

  const auth = await assertPaymentAuth(requestAuthorization(req), phone);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  try {
    const existing = await getRecipientConfig(phone, body.role);
    if (existing?.razorpay_linked_account_id) {
      json(res, 200, {
        accountId: existing.razorpay_linked_account_id,
        validationStatus: existing.validation_status,
        step: "account_created",
      });
      return;
    }

    const referenceId = razorpayReferenceId(phone, body.role);
    const razorpayPayload = buildRazorpayAccountPayload(body, referenceId);

    let account;
    try {
      account = await getRazorpayClient().accounts.create(razorpayPayload);
    } catch (err) {
      console.error("Razorpay accounts.create failed", {
        phone,
        role: body.role,
        referenceId,
        error: err as RazorpayErrorShape,
      });
      json(res, 502, {
        error: "Razorpay account creation failed",
        detail: parseRazorpayError(err),
      });
      return;
    }

    await upsertRecipientAccount({
      phone,
      role: body.role,
      accountId: account.id,
      referenceId,
    });

    json(res, 200, {
      accountId: account.id,
      validationStatus: "submitted",
      step: "account_created",
    });
  } catch (err) {
    console.error("Payment onboard handler error", {
      phone,
      role: body.role,
      error: err instanceof Error ? err.message : String(err),
    });
    json(res, 500, { error: "Internal server error" });
  }
}
