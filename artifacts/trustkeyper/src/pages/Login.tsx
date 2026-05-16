import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthFlowLayout } from "@/components/AuthFlowLayout";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { authPrimaryButtonClass } from "@/components/auth/authStyles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  ALL_ROLES,
  type Role,
  dashboardRouteFor,
  loginSuccess,
  profileExistsAsync,
} from "@/lib/auth";
import { resetSessionForAuthEntry } from "@/lib/authPublicEntry";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";

const Box = ("di" + "v") as "div";

type Phase = "phone" | "otp";

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

function readPendingRole(): Role | null {
  if (typeof window === "undefined") return null;
  const pending = sessionStorage.getItem("tk_pending_role");
  return pending && ALL_ROLES.includes(pending as Role) ? (pending as Role) : null;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [pendingRole] = useState<Role | null>(readPendingRole);
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(10);
  const [accountKnown, setAccountKnown] = useState<boolean | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    resetSessionForAuthEntry();
    if (!readPendingRole()) {
      setLocation("/");
    }
  }, [setLocation]);

  useEffect(() => {
    if (phase !== "otp" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);

  useEffect(() => {
    if (!pendingRole || phoneDigits.length !== 10) {
      setAccountKnown(null);
      return;
    }
    let cancelled = false;
    void profileExistsAsync(phoneDigits, pendingRole).then((exists) => {
      if (!cancelled) setAccountKnown(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [phoneDigits, pendingRole]);

  if (!pendingRole) {
    return null;
  }

  const accountExistsForLogin = phoneDigits.length === 10 && accountKnown === true;
  const showNoAccountHint = phoneDigits.length === 10 && accountKnown === false;
  const isOtpComplete = otp.every((d) => d !== "");

  const handleOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < OTP_LAST_INDEX) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const finishLogin = async () => {
    setLoggingIn(true);
    try {
      const exists = await profileExistsAsync(phoneDigits, pendingRole);
      if (!exists) {
        toast({
          title: "No account found",
          description: "Sign up first, then log in on any device with the same number.",
          variant: "destructive",
        });
        return;
      }
      const ok = await loginSuccess(phoneDigits, pendingRole);
      if (ok) {
        toast({ title: "Signed in", description: "Welcome back to TrustKeyper." });
        setLocation(dashboardRouteFor(pendingRole));
        return;
      }
      toast({
        title: "No account found",
        description: "Sign up first, then log in on any device with the same number.",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const loginHeading = `Login to TrustKeyper as ${roleTitle(pendingRole)}`;

  const requestOtpCta = (
    <Button
      size="lg"
      disabled={!accountExistsForLogin}
      onClick={() => {
        if (!accountExistsForLogin) return;
        setCountdown(10);
        setOtp(createEmptyOtp());
        setPhase("otp");
      }}
      className={authPrimaryButtonClass}
    >
      Request OTP &rarr;
    </Button>
  );

  const continueLoginCta = (
    <Button
      size="lg"
      disabled={!isOtpComplete || loggingIn}
      onClick={() => void finishLogin()}
      className={authPrimaryButtonClass}
    >
      Continue &rarr;
    </Button>
  );

  return (
    <AuthFlowLayout onBack={() => setLocation("/")} backDisabled={false}>
      <Box className="max-w-md flex flex-col flex-1 pb-40 sm:pb-0">
        <Box className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-semibold text-gray-900">{loginHeading}</h1>
        </Box>

        {phase === "phone" && (
          <>
            <Box className="space-y-2 mb-8">
              <Label htmlFor="login-phone" className="text-gray-600 text-sm">
                Phone Number
              </Label>
              <Box className="flex gap-2">
                <Box className="w-14 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm shrink-0">
                  +91
                </Box>
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={phoneDigits}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="bg-white border-gray-200"
                />
              </Box>
              {showNoAccountHint ? (
                <p className="text-sm text-destructive">There is no account for this number.</p>
              ) : null}
            </Box>

            <AuthSignupScreenFooter
              cta={requestOtpCta}
              showTerms={false}
              linkType="signup"
              persistRole={pendingRole}
            />
          </>
        )}

        {phase === "otp" && (
          <>
            <Box className="space-y-6 mb-6 max-w-md opacity-80">
              <Box className="space-y-2">
                <Label className="text-gray-600 text-sm">Phone Number</Label>
                <Input readOnly value={`+91 ${phoneDigits}`} className="bg-gray-50 border-gray-200" />
              </Box>
            </Box>

            <p className="text-gray-600 text-sm mb-4">
              Enter the OTP that we have sent to{" "}
              <span className="font-semibold text-gray-900">+91 {phoneDigits}</span>
            </p>

            <Box className="flex gap-4 mb-6">
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
            </Box>

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

            <AuthSignupScreenFooter
              cta={continueLoginCta}
              showTerms={false}
              linkType="signup"
              persistRole={pendingRole}
            />
          </>
        )}
      </Box>
    </AuthFlowLayout>
  );
}
