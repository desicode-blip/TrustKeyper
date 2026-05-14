import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthFlowLayout } from "@/components/AuthFlowLayout";
import { AuthGoToSignupLink } from "@/components/AuthFlowFooterLinks";
import Step1Role from "@/components/Step1Role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  ALL_ROLES,
  type Role,
  dashboardRouteFor,
  loginSuccess,
  profileExists,
} from "@/lib/auth";

type Phase = "role" | "phone" | "otp";

function roleTitle(r: Role): string {
  switch (r) {
    case "owner":
      return "Owner";
    case "broker":
      return "Broker";
    case "tenant":
      return "Tenant";
    case "manager":
      return "Manager";
    default:
      return r;
  }
}

function readPendingRoleForLogin(): { phase: Phase; role: string } {
  if (typeof window === "undefined") return { phase: "role", role: "" };
  const pending = sessionStorage.getItem("tk_pending_role");
  if (pending && ALL_ROLES.includes(pending as Role)) {
    return { phase: "phone", role: pending };
  }
  return { phase: "role", role: "" };
}

const loginCtaClass =
  "rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white border-0 shadow-none disabled:opacity-50";

export default function Login() {
  const [loc, setLocation] = useLocation();
  const [phase, setPhase] = useState<Phase>(() => readPendingRoleForLogin().phase);
  const [role, setRole] = useState(() => readPendingRoleForLogin().role);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(10);

  // Keep login aligned with signup flow: role was already chosen when tk_pending_role is set.
  useLayoutEffect(() => {
    const pending = sessionStorage.getItem("tk_pending_role");
    if (pending && ALL_ROLES.includes(pending as Role)) {
      setRole(pending);
      setPhase((p) => (p === "role" ? "phone" : p));
    }
  }, [loc]);

  useEffect(() => {
    if (!otpSent || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, otpSent]);

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);
  const activeRole = ((): Role | null => {
    const p = sessionStorage.getItem("tk_pending_role");
    if (p && ALL_ROLES.includes(p as Role)) return p as Role;
    if (role && ALL_ROLES.includes(role as Role)) return role as Role;
    return null;
  })();
  const accountExistsForLogin =
    activeRole !== null && phoneDigits.length === 10 && profileExists(phoneDigits, activeRole);
  const canRequest = phoneDigits.length === 10 && accountExistsForLogin;
  const showNoAccountHint =
    activeRole !== null && phoneDigits.length === 10 && !profileExists(phoneDigits, activeRole);
  const isOtpComplete = otp.every((d) => d !== "");

  const handleOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 3) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const finishLogin = () => {
    const r = (sessionStorage.getItem("tk_pending_role") || role) as Role;
    if (!ALL_ROLES.includes(r)) {
      toast({ title: "Select a role", variant: "destructive" });
      return;
    }
    if (!profileExists(phoneDigits, r)) {
      toast({
        title: "No account found",
        description: "There is no account for this number.",
        variant: "destructive",
      });
      return;
    }
    const ok = loginSuccess(phoneDigits, r);
    if (ok) {
      toast({ title: "Signed in", description: "Welcome back to TrustKeyper." });
      setLocation(dashboardRouteFor(r));
      return;
    }
    toast({
      title: "No account found",
      description: "There is no account for this number.",
      variant: "destructive",
    });
  };

  const headingRoleFromSession = ((): Role | null => {
    const p = sessionStorage.getItem("tk_pending_role");
    return p && ALL_ROLES.includes(p as Role) ? (p as Role) : null;
  })();
  const loginHeading =
    headingRoleFromSession || (phase !== "role" && activeRole)
      ? `Login to TrustKeyper as ${roleTitle((headingRoleFromSession ?? activeRole) as Role)}`
      : "Login to TrustKeyper";

  return (
    <AuthFlowLayout onBack={() => setLocation("/")} backDisabled={false}>
      <div className="max-w-md flex flex-col flex-1">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-semibold text-gray-900">{loginHeading}</h1>
        </div>

        {phase === "role" && (
          <>
            <Step1Role
              role={role}
              setRole={setRole}
              onNext={() => {
                if (!role) return;
                sessionStorage.setItem("tk_pending_role", role);
                setPhone("");
                setPhase("phone");
              }}
            />
            <AuthGoToSignupLink persistRole={role} />
          </>
        )}

        {phase === "phone" && (
          <>
            <div className="space-y-2 mb-8">
              <Label htmlFor="login-phone" className="text-gray-600 text-sm">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <div className="w-14 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm shrink-0">
                  +91
                </div>
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Placeholder"
                  value={phoneDigits}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="bg-white border-gray-200"
                />
              </div>
              {showNoAccountHint ? (
                <p className="text-sm text-destructive">There is no account for this number.</p>
              ) : null}
            </div>

            <div className="hidden sm:block">
              <Button
                size="lg"
                disabled={!canRequest}
                onClick={() => {
                  if (!canRequest) return;
                  setOtpSent(true);
                  setCountdown(10);
                  setOtp(["", "", "", ""]);
                  setPhase("otp");
                }}
                className={`w-full sm:w-52 ${loginCtaClass}`}
              >
                Request OTP &rarr;
              </Button>
            </div>
            <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
              <Button
                size="lg"
                disabled={!canRequest}
                onClick={() => {
                  if (!canRequest) return;
                  setOtpSent(true);
                  setCountdown(10);
                  setOtp(["", "", "", ""]);
                  setPhase("otp");
                }}
                className={`w-full ${loginCtaClass}`}
              >
                Request OTP &rarr;
              </Button>
            </div>

            <AuthGoToSignupLink persistRole={role || sessionStorage.getItem("tk_pending_role") || undefined} />
          </>
        )}

        {phase === "otp" && (
          <>
            <div className="space-y-6 mb-6 max-w-md opacity-80">
              <div className="space-y-2">
                <Label className="text-gray-600 text-sm">Phone Number</Label>
                <Input readOnly value={`+91 ${phoneDigits}`} className="bg-gray-50 border-gray-200" />
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Enter the OTP that we have sent to{" "}
              <span className="font-semibold text-gray-900">+91 {phoneDigits}</span>
            </p>

            <div className="flex gap-4 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`login-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className={`w-14 h-14 text-center text-xl font-medium rounded-lg border outline-none transition-colors
                    ${digit ? "bg-[#E8F5EE] border-accent border-b-4" : "bg-white border-gray-300 focus:border-primary"}`}
                />
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-8">
              Didn&apos;t receive the verification OTP?{" "}
              {countdown > 0 ? (
                <span className="font-medium text-[#2563EB]">Resend otp in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCountdown(10)}
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  Resend otp
                </button>
              )}
            </p>

            <div className="hidden sm:block">
              <Button
                size="lg"
                disabled={!isOtpComplete}
                onClick={finishLogin}
                className={`w-full sm:w-52 ${loginCtaClass}`}
              >
                Continue &rarr;
              </Button>
            </div>
            <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] safe-area-bottom">
              <Button
                size="lg"
                disabled={!isOtpComplete}
                onClick={finishLogin}
                className={`w-full ${loginCtaClass}`}
              >
                Continue &rarr;
              </Button>
            </div>

            <AuthGoToSignupLink persistRole={role || sessionStorage.getItem("tk_pending_role") || undefined} />
          </>
        )}
      </div>
    </AuthFlowLayout>
  );
}
