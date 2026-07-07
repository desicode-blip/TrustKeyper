import React, { useCallback, useMemo, useState } from "react";
import { ChevronDown, Home, IndianRupee, Loader2, User } from "lucide-react";
import {
  buildContactMailto,
  CONTACT_SERVICE_TIMINGS,
  CONTACT_USER_ROLES,
  isContactFormValid,
  normalizePhoneDigits,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormField,
  type ContactFormValues,
  type ContactUserRole,
} from "@/lib/contactFormSchema";
import { cn } from "@/lib/utils";

const EMPTY_VALUES: ContactFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  role: "",
  serviceTiming: "",
  message: "",
};

type SubmitState = "idle" | "loading" | "success" | "error";

const SUBMIT_DELAY_MS = 600;

const ROLE_ICONS: Record<ContactUserRole, typeof User> = {
  property_owner: User,
  tenant: Home,
  broker: IndianRupee,
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-marketing-navy">
      {children}
      {required ? <span className="text-marketing-blue"> *</span> : null}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f1f5f9] px-4 py-3 text-sm text-marketing-navy outline-none transition-colors placeholder:text-marketing-muted/70 focus:border-marketing-blue focus:bg-white";

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = useMemo(() => isContactFormValid(values), [values]);

  const updateField = useCallback((field: ContactFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitState("loading");
    setSubmitError(null);

    window.setTimeout(() => {
      try {
        const mailto = buildContactMailto(values);
        window.location.href = mailto;
        setSubmitState("success");
      } catch {
        setSubmitState("error");
        setSubmitError("Unable to open your email client. Please email us at info@trustkeyper.com.");
      }
    }, SUBMIT_DELAY_MS);
  }, [values]);

  if (submitState === "success") {
    return (
      <div
        className="rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(25,40,57,0.08)] ring-1 ring-black/[0.04] sm:p-10"
        role="status"
      >
        <h2 className="text-2xl font-medium text-marketing-navy">Message ready to send</h2>
        <p className="mt-3 font-roboto text-sm leading-relaxed text-marketing-muted">
          Your email app should open with your message pre-filled. If it did not open, email us at{" "}
          <a
            href="mailto:info@trustkeyper.com"
            className="font-medium text-marketing-blue underline decoration-marketing-blue/30 underline-offset-2"
          >
            info@trustkeyper.com
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY_VALUES);
            setErrors({});
            setSubmitState("idle");
            setSubmitError(null);
          }}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-marketing-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-marketing-blue-bright"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(25,40,57,0.08)] ring-1 ring-black/[0.04] sm:p-10">
      <div className="grid gap-5 sm:gap-6">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div>
            <FieldLabel required>First Name</FieldLabel>
            <input
              type="text"
              autoComplete="given-name"
              value={values.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(errors.firstName)}
            />
            <FieldError message={errors.firstName} />
          </div>

          <div>
            <FieldLabel required>Last Name</FieldLabel>
            <input
              type="text"
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(errors.lastName)}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div>
            <FieldLabel required>Contact Number</FieldLabel>
            <div className="flex overflow-hidden rounded-lg bg-[#f1f5f9] ring-1 ring-transparent focus-within:bg-white focus-within:ring-marketing-blue">
              <span className="flex shrink-0 items-center border-r border-[#e2e8f0] px-4 text-sm text-marketing-muted">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={values.phone}
                onChange={(event) => updateField("phone", normalizePhoneDigits(event.target.value))}
                maxLength={10}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-marketing-navy outline-none placeholder:text-marketing-muted/70"
                aria-invalid={Boolean(errors.phone)}
              />
            </div>
            <FieldError message={errors.phone} />
          </div>

          <div>
            <FieldLabel>Email Address</FieldLabel>
            <input
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(errors.email)}
            />
            <FieldError message={errors.email} />
          </div>
        </div>

        <div>
          <FieldLabel required>I am A</FieldLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CONTACT_USER_ROLES.map((role) => {
              const Icon = ROLE_ICONS[role.id];
              const selected = values.role === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateField("role", role.id)}
                  className={cn(
                    "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center transition-colors",
                    selected
                      ? "border-0 border-b-2 border-marketing-green bg-marketing-mint-card text-marketing-navy shadow-[1px_2px_5px_rgba(103,103,103,0.08)]"
                      : "border border-marketing-border bg-[#f8fafc] text-marketing-body hover:border-marketing-muted/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      selected
                        ? "bg-marketing-green text-white"
                        : "bg-white text-marketing-muted",
                    )}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-sm font-medium">{role.label}</span>
                </button>
              );
            })}
          </div>
          <FieldError message={errors.role} />
        </div>

        <div>
          <FieldLabel required>When do you need this service?</FieldLabel>
          <div className="relative">
            <select
              value={values.serviceTiming}
              onChange={(event) => updateField("serviceTiming", event.target.value)}
              className={cn(
                inputClassName,
                "appearance-none pr-10",
                !values.serviceTiming && "text-marketing-muted/70",
              )}
              aria-invalid={Boolean(errors.serviceTiming)}
            >
              <option value="">Select</option>
              {CONTACT_SERVICE_TIMINGS.map((timing) => (
                <option key={timing.value} value={timing.value}>
                  {timing.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-marketing-muted"
              aria-hidden
            />
          </div>
          <FieldError message={errors.serviceTiming} />
        </div>

        <div>
          <FieldLabel required>Message</FieldLabel>
          <textarea
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={5}
            placeholder="Placeholder"
            className={cn(inputClassName, "resize-none")}
            aria-invalid={Boolean(errors.message)}
          />
          <FieldError message={errors.message} />
        </div>

        {submitState === "error" && submitError ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {submitError}
          </p>
        ) : null}

        <div>
          <button
            type="button"
            disabled={!canSubmit || submitState === "loading"}
            onClick={handleSubmit}
            className={cn(
              "inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors",
              canSubmit && submitState !== "loading"
                ? "bg-marketing-blue text-white hover:bg-marketing-blue-bright"
                : "cursor-not-allowed bg-[#cbd5e1] text-white",
            )}
          >
            {submitState === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
