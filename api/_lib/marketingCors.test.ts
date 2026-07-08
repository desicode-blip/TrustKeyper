import { afterEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getMarketingCorsAllowlist,
  getMarketingCorsRoute,
  handleMarketingCorsPreflight,
  matchMarketingOrigin,
  setMarketingCorsHeaders,
} from "./marketingCors.js";

describe("marketingCors allowlist", () => {
  afterEach(() => {
    delete process.env.MARKETING_STAGING_ORIGIN;
  });

  it("includes production and local marketing origins by default", () => {
    expect(getMarketingCorsAllowlist()).toEqual([
      "https://trustkeyper.com",
      "http://localhost:5174",
    ]);
  });

  it("adds MARKETING_STAGING_ORIGIN when set", () => {
    process.env.MARKETING_STAGING_ORIGIN = "https://trustkeyper-marketing.vercel.app/";
    expect(getMarketingCorsAllowlist()).toContain("https://trustkeyper-marketing.vercel.app");
  });

  it("matches allowed origins exactly and rejects wildcards", () => {
    expect(matchMarketingOrigin("https://trustkeyper.com")).toBe("https://trustkeyper.com");
    expect(matchMarketingOrigin("http://localhost:5174")).toBe("http://localhost:5174");
    expect(matchMarketingOrigin("https://evil.example.com")).toBeNull();
    expect(matchMarketingOrigin("*")).toBeNull();
  });
});

describe("getMarketingCorsRoute", () => {
  it("identifies marketing lookup and profile routes only", () => {
    expect(getMarketingCorsRoute(["accounts", "9876543210", "roles"], "GET")).toBe("roles");
    expect(getMarketingCorsRoute(["accounts", "9876543210", "summaries"], "GET")).toBe("summaries");
    expect(getMarketingCorsRoute(["accounts", "9876543210", "owner", "profile"], "PUT")).toBe(
      "profile",
    );
    expect(getMarketingCorsRoute(["accounts", "9876543210", "owner", "profile"], "OPTIONS")).toBe(
      "profile",
    );
    expect(getMarketingCorsRoute(["accounts", "9876543210", "owner", "exists"], "GET")).toBeNull();
    expect(getMarketingCorsRoute(["accounts", "9876543210", "owner"], "GET")).toBeNull();
    expect(getMarketingCorsRoute(["accounts", "9876543210", "owner", "settings"], "PUT")).toBeNull();
  });
});

describe("setMarketingCorsHeaders", () => {
  it("sets method and header allowances for profile PUT", () => {
    const headers: Record<string, string> = {};
    const res = {
      setHeader(name: string, value: string) {
        headers[name] = value;
      },
    } as unknown as VercelResponse;

    setMarketingCorsHeaders(res, "https://trustkeyper.com", "profile");

    expect(headers["Access-Control-Allow-Origin"]).toBe("https://trustkeyper.com");
    expect(headers["Access-Control-Allow-Methods"]).toBe("PUT, OPTIONS");
    expect(headers["Access-Control-Allow-Headers"]).toContain("Authorization");
    expect(headers["Access-Control-Allow-Headers"]).toContain("Content-Type");
    expect(headers.Vary).toBe("Origin");
  });
});

describe("handleMarketingCorsPreflight", () => {
  function mockResponse() {
    const headers: Record<string, string> = {};
    let statusCode = 200;
    let ended = false;
    const res = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      setHeader(name: string, value: string) {
        headers[name] = value;
        return res;
      },
      end() {
        ended = true;
      },
      get statusCode() {
        return statusCode;
      },
      get headers() {
        return headers;
      },
      get ended() {
        return ended;
      },
    };
    return res;
  }

  it("returns preflight headers for allowed profile origin", () => {
    const req = {
      method: "OPTIONS",
      headers: { origin: "http://localhost:5174" },
    } as VercelRequest;
    const res = mockResponse();

    const handled = handleMarketingCorsPreflight(req, res as unknown as VercelResponse, [
      "accounts",
      "9876543210",
      "owner",
      "profile",
    ]);

    expect(handled).toBe(true);
    expect(res.statusCode).toBe(204);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("http://localhost:5174");
    expect(res.headers["Access-Control-Allow-Methods"]).toBe("PUT, OPTIONS");
    expect(res.ended).toBe(true);
  });

  it("rejects preflight for disallowed origins", () => {
    const req = {
      method: "OPTIONS",
      headers: { origin: "https://evil.example.com" },
    } as VercelRequest;
    const res = mockResponse();

    const handled = handleMarketingCorsPreflight(req, res as unknown as VercelResponse, [
      "accounts",
      "9876543210",
      "owner",
      "profile",
    ]);

    expect(handled).toBe(true);
    expect(res.statusCode).toBe(403);
    expect(res.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("ignores OPTIONS on non-profile routes", () => {
    const req = {
      method: "OPTIONS",
      headers: { origin: "https://trustkeyper.com" },
    } as VercelRequest;
    const res = mockResponse();

    const handled = handleMarketingCorsPreflight(req, res as unknown as VercelResponse, [
      "accounts",
      "9876543210",
      "roles",
    ]);

    expect(handled).toBe(false);
    expect(res.ended).toBe(false);
  });
});
