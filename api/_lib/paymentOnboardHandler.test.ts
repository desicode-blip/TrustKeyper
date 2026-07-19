import { describe, expect, it } from "vitest";
import { razorpayReferenceId } from "./paymentOnboardHandler.js";

const PHONE = "8860826738";

describe("razorpayReferenceId", () => {
  it("returns exactly 20 lowercase-alphanumeric chars with role + phone prefix", () => {
    const id = razorpayReferenceId(PHONE, "owner");
    expect(id).toHaveLength(20);
    expect(id).toMatch(/^o8860826738[0-9a-z]{9}$/);
  });

  it("maps owner/tenant/broker to o/t/b", () => {
    expect(razorpayReferenceId(PHONE, "owner")[0]).toBe("o");
    expect(razorpayReferenceId(PHONE, "tenant")[0]).toBe("t");
    expect(razorpayReferenceId(PHONE, "broker")[0]).toBe("b");
  });

  it("normalizes phone to last 10 digits", () => {
    const id = razorpayReferenceId("+91-8860-826-738", "owner");
    expect(id.slice(1, 11)).toBe(PHONE);
    expect(id).toHaveLength(20);
  });

  it("is unique per call (non-deterministic)", () => {
    const a = razorpayReferenceId(PHONE, "owner");
    const b = razorpayReferenceId(PHONE, "owner");
    expect(a).not.toBe(b);
  });

  it("throws when phone does not normalize to 10 digits", () => {
    expect(() => razorpayReferenceId("12345", "owner")).toThrow(
      /exactly 10 digits/,
    );
    expect(() => razorpayReferenceId("", "owner")).toThrow(/exactly 10 digits/);
  });

  it("throws for unsupported roles", () => {
    expect(() => razorpayReferenceId(PHONE, "admin")).toThrow(/Unsupported role/);
  });

  it("never returns the legacy tk-{phone}-{role} format", () => {
    const id = razorpayReferenceId(PHONE, "owner");
    expect(id).not.toMatch(/^tk-/);
    expect(id).not.toBe(`tk-${PHONE}-owner`);
  });
});
