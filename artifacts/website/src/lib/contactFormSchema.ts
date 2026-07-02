export const CONTACT_USER_ROLES = [
  { id: "property_owner", label: "Property Owner" },
  { id: "tenant", label: "Tenant" },
  { id: "broker", label: "Broker" },
] as const;

export type ContactUserRole = (typeof CONTACT_USER_ROLES)[number]["id"];

export const CONTACT_SERVICE_TIMINGS = [
  { value: "immediately", label: "Immediately" },
  { value: "within_1_month", label: "Within 1 month" },
  { value: "within_3_months", label: "Within 3 months" },
  { value: "within_6_months", label: "Within 6 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

export type ContactServiceTiming = (typeof CONTACT_SERVICE_TIMINGS)[number]["value"];

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: ContactUserRole | "";
  serviceTiming: ContactServiceTiming | "";
  message: string;
}

export type ContactFormField =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "role"
  | "serviceTiming"
  | "message";

export type ContactFormErrors = Partial<Record<ContactFormField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  const phoneDigits = normalizePhoneDigits(values.phone);
  if (phoneDigits.length !== 10) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!values.role) {
    errors.role = "Select your role";
  }

  if (!values.serviceTiming) {
    errors.serviceTiming = "Select when you need this service";
  }

  if (!values.message.trim()) {
    errors.message = "Message is required";
  }

  return errors;
}

export function isContactFormValid(values: ContactFormValues): boolean {
  return Object.keys(validateContactForm(values)).length === 0;
}

export function buildContactMailto(values: ContactFormValues): string {
  const roleLabel =
    CONTACT_USER_ROLES.find((role) => role.id === values.role)?.label ?? values.role;
  const timingLabel =
    CONTACT_SERVICE_TIMINGS.find((timing) => timing.value === values.serviceTiming)?.label ??
    values.serviceTiming;

  const subject = encodeURIComponent(
    `Contact inquiry from ${values.firstName.trim()} ${values.lastName.trim()}`,
  );

  const body = encodeURIComponent(
    [
      `Name: ${values.firstName.trim()} ${values.lastName.trim()}`,
      `Phone: +91 ${normalizePhoneDigits(values.phone)}`,
      values.email.trim() ? `Email: ${values.email.trim()}` : null,
      `Role: ${roleLabel}`,
      `Service needed: ${timingLabel}`,
      "",
      values.message.trim(),
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return `mailto:info@trustkeyper.com?subject=${subject}&body=${body}`;
}
