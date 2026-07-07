import { describe, it, expect } from "vitest";
import {
  buildContactMailto,
  isContactFormValid,
  normalizePhoneDigits,
  validateContactForm,
  type ContactFormValues,
} from "@/lib/contactFormSchema";

const validValues: ContactFormValues = {
  firstName: "Asha",
  lastName: "Sharma",
  phone: "9876543210",
  email: "asha@example.com",
  role: "property_owner",
  serviceTiming: "within_1_month",
  message: "I need help managing two properties.",
};

describe("normalizePhoneDigits", () => {
  it("strips non-digits and keeps the last 10 digits", () => {
    expect(normalizePhoneDigits("+91 98765 43210")).toBe("9876543210");
  });
});

describe("validateContactForm", () => {
  it("returns no errors for a valid form", () => {
    expect(validateContactForm(validValues)).toEqual({});
    expect(isContactFormValid(validValues)).toBe(true);
  });

  it("requires core fields", () => {
    const errors = validateContactForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: "",
      serviceTiming: "",
      message: "",
    });

    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.role).toBeDefined();
    expect(errors.serviceTiming).toBeDefined();
    expect(errors.message).toBeDefined();
  });

  it("rejects invalid email when provided", () => {
    const errors = validateContactForm({
      ...validValues,
      email: "not-an-email",
    });

    expect(errors.email).toBe("Enter a valid email address");
  });

  it("allows empty email", () => {
    const errors = validateContactForm({
      ...validValues,
      email: "",
    });

    expect(errors.email).toBeUndefined();
  });
});

describe("buildContactMailto", () => {
  it("includes inquiry details in the mailto link", () => {
    const mailto = buildContactMailto(validValues);

    expect(mailto.startsWith("mailto:info@trustkeyper.com?")).toBe(true);
    expect(decodeURIComponent(mailto)).toContain("Property Owner");
    expect(decodeURIComponent(mailto)).toContain("Within 1 month");
    expect(decodeURIComponent(mailto)).toContain("9876543210");
  });
});
