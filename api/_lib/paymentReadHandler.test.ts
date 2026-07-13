import { afterEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const { queryMock, assertPaymentAuthMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  assertPaymentAuthMock: vi.fn(),
}));

vi.mock("./vercelSyncDb.js", () => ({
  getPool: () => ({
    query: queryMock,
  }),
  normalizePhone: (phone: string) => phone.replace(/\D/g, "").slice(-10),
}));

vi.mock("./syncAuth.js", () => ({
  assertPaymentAuth: assertPaymentAuthMock,
}));

import { handleTenantPaymentHistoryRequest, mapTenantPaymentHistoryItem } from "./paymentReadHandler.js";

function createMockResponse() {
  let statusCode = 200;
  let body = "";

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    setHeader() {
      return res;
    },
    end(payload?: string) {
      body = payload ?? "";
    },
  };

  return {
    res: res as unknown as VercelResponse,
    get statusCode() {
      return statusCode;
    },
    get parsedBody() {
      return body ? (JSON.parse(body) as unknown) : null;
    },
  };
}

function historyRequest(
  query: Record<string, string | string[] | undefined>,
  auth?: string,
): VercelRequest {
  return {
    method: "GET",
    query,
    headers: auth ? { authorization: auth } : {},
  } as unknown as VercelRequest;
}

describe("mapTenantPaymentHistoryItem", () => {
  it("maps DB columns to tenant-facing fields without commission", () => {
    const item = mapTenantPaymentHistoryItem({
      id: "rp_1",
      rent_period: "2026-07",
      amount_paise: 500,
      status: "paid",
      payment_method: "upi",
      paid_at: new Date("2026-07-13T05:26:33.000Z"),
      created_at: new Date("2026-07-13T05:23:43.000Z"),
    });

    expect(item).toEqual({
      id: "rp_1",
      rentPeriod: "2026-07",
      amountPaise: 500,
      status: "paid",
      paymentMethod: "upi",
      paidAt: "2026-07-13T05:26:33.000Z",
      createdAt: "2026-07-13T05:23:43.000Z",
    });
    expect(item).not.toHaveProperty("commissionPaise");
    expect(item).not.toHaveProperty("ownerSettlementPaise");
  });
});

describe("handleTenantPaymentHistoryRequest", () => {
  afterEach(() => {
    queryMock.mockReset();
    assertPaymentAuthMock.mockReset();
  });

  it("returns 401 when auth fails", async () => {
    assertPaymentAuthMock.mockResolvedValue({ ok: false, status: 401, error: "Unauthorized" });
    const mock = createMockResponse();

    await handleTenantPaymentHistoryRequest(
      historyRequest({ phone: "9000000030" }, "Bearer bad"),
      mock.res,
    );

    expect(mock.statusCode).toBe(401);
    expect(mock.parsedBody).toEqual({ error: "Unauthorized" });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("returns empty payments array when tenant has none", async () => {
    assertPaymentAuthMock.mockResolvedValue({ ok: true, user: { phone: "9000000030" } });
    queryMock.mockResolvedValue({ rows: [] });
    const mock = createMockResponse();

    await handleTenantPaymentHistoryRequest(
      historyRequest({ phone: "9000000030" }, "Bearer tok"),
      mock.res,
    );

    expect(mock.statusCode).toBe(200);
    expect(mock.parsedBody).toEqual({ payments: [] });
    expect(String(queryMock.mock.calls[0]?.[0] ?? "")).toContain("agreements");
    expect(queryMock.mock.calls[0]?.[1]).toEqual(["9000000030"]);
  });

  it("returns mapped payments and normalizes phone for auth", async () => {
    assertPaymentAuthMock.mockResolvedValue({ ok: true, user: { phone: "9000000030" } });
    queryMock.mockResolvedValue({
      rows: [
        {
          id: "rp_new",
          rent_period: "2026-07",
          amount_paise: 500,
          status: "paid",
          payment_method: "upi",
          paid_at: new Date("2026-07-13T05:26:33.000Z"),
          created_at: new Date("2026-07-13T05:23:43.000Z"),
        },
      ],
    });
    const mock = createMockResponse();

    await handleTenantPaymentHistoryRequest(
      historyRequest({ phone: "+91 9000000030" }, "Bearer tok"),
      mock.res,
    );

    expect(assertPaymentAuthMock).toHaveBeenCalledWith("Bearer tok", "9000000030");
    expect(mock.statusCode).toBe(200);
    expect(mock.parsedBody).toEqual({
      payments: [
        {
          id: "rp_new",
          rentPeriod: "2026-07",
          amountPaise: 500,
          status: "paid",
          paymentMethod: "upi",
          paidAt: "2026-07-13T05:26:33.000Z",
          createdAt: "2026-07-13T05:23:43.000Z",
        },
      ],
    });
  });
});
