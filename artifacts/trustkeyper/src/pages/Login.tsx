import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthFlowLayout } from "@/components/AuthFlowLayout";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { AuthSignupScreenFooter } from "@/components/auth/AuthSignupScreenFooter";
import { AuthGoToSignupLink } from "@/components/AuthFlowFooterLinks";
import { AuthStepHeading } from "@/components/auth/AuthStepHeading";
import {
  authMobileScrollPadClass,
  authOtpDigitEmptyClass,
  authOtpDigitFilledClass,
  authPrimaryButtonClass,
} from "@/components/auth/authStyles";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  type AuthEntryRole,
  clearInvalidAuthPendingRole,
  dashboardRouteFor,
  isAuthEntryRole,
  loginSuccess,
  profileExistsAsync,
  readAuthPendingRole,
  roleDisplayLabel,
} from "@/lib/auth";
import { resetSessionForAuthEntry } from "@/lib/authPublicEntry";
import { createEmptyOtp, OTP_LAST_INDEX } from "@/lib/otp";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/phoneOtp";

type Phase = "phone" | "otp";

/** Phone + OTP login (role from signup / session — no "I am a" cards). */
export default function Login() {
  const [, setLocation] = useLocation();
  const [loginRole, setLoginRole] = useState<AuthEntryRole | null>(() => readAuthPendingRole());
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(createEmptyOtp);
  const [countdown, setCountdown] = useState(10);
  const [accountKnown, setAccountKnown] = useState<boolean | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    resetSessionForAuthEntry();
    clearInvalidAuthPendingRole();
    const pending = readAuthPendingRole();
    if (pending) setLoginRole(pending);
  }, []);

  useEffect(() => {
    if (phase !== "otp" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);

  useEffect(() => {
    if (!loginRole || phoneDigits.length !== 10) {
      setAccountKnown(null);
      return;
    }
    let cancelled = false;
    void profileExistsAsync(phoneDigits, loginRole).then((exists) => {
      if (!cancelled) setAccountKnown(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [phoneDigits, loginRole]);

  const handleBack = () => {
    if (phase === "otp") {
      setPhase("phone");
      setOtp(createEmptyOtp());
      return;
    }
    setLocation("/");
  };

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
    if (!loginRole) return;
    setLoggingIn(true);
    try {
      const exists = await profileExistsAsync(phoneDigits, loginRole);
      if (!exists) {
        toast({
          title: "No account found",
          description: "Sign up first, then log in on any device with the same number.",
          variant: "destructive",
        });
        return;
      }
      const verifyError = await verifyPhoneOtp(phoneDigits, otp.join(""));
      if (verifyError) {
        toast({
          title: "Invalid OTP. Please try again.",
          variant: "destructive",
        });
        return;
      }
      const ok = await loginSuccess(phoneDigits, loginRole);
      if (ok) {
        toast({ title: "Signed in", description: "Welcome back to TrustKeyper." });
        setLocation(dashboardRouteFor(loginRole));
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

  const accountExistsForLogin = phoneDigits.length === 10 && accountKnown === true;
  const showNoAccountHint = phoneDigits.length === 10 && accountKnown === false;
  const isOtpComplete = otp.every((d) => d !== "");

  const resendLoginOtp = async () => {
    const err = await sendPhoneOtp(phoneDigits);
    if (err) {
      toast({
        title: "Could not send OTP",
        description: err,
        variant: "destructive",
      });
      return;
    }
    setCountdown(10);
    setOtp(createEmptyOtp());
  };

  const requestOtpCta = (
    <Button
      size="lg"
      disabled={!accountExistsForLogin}
      onClick={() => {
        void (async () => {
          if (!accountExistsForLogin) return;
          const err = await sendPhoneOtp(phoneDigits);
          if (err) {
            toast({
              title: "Could not send OTP",
              description: err,
              variant: "destructive",
            });
            return;
          }
          setCountdown(10);
          setOtp(createEmptyOtp());
          setPhase("otp");
        })();
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

  if (!loginRole || !isAuthEntryRole(loginRole)) {
    return (
      <AuthFlowLayout onBack={() => setLocation("/")} backDisabled={false}>
        <div className={`flex flex-col flex-1 max-w-md w-full ${authMobileScrollPadClass}`}>
          <div className="mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-semibold text-gray-900">Login to TrustKeyper</h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose Property Owner or Broker on signup first, then return here to log in.
            </p>
          </div>
          <AuthGoToSignupLink className="text-center" />
        </div>
      </AuthFlowLayout>
    );
  }

  return (
    <AuthFlowLayout onBack={handleBack} backDisabled={false}>
      <div className={`flex flex-col flex-1 min-h-0 max-w-md w-full ${authMobileScrollPadClass}`}>
        <div className="mb-8 border-b border-gray-200 pb-4 shrink-0">
          <h1 className="text-3xl font-semibold text-gray-900">
            Login to TrustKeyper as {roleDisplayLabel(loginRole)}
          </h1>
        </div>

        {phase === "phone" && (
          <>
            <div className="max-w-md mb-6">
              <AuthPhoneField
                id="login-phone"
                value={phoneDigits}
                onChange={setPhone}
                helperText={showNoAccountHint ? undefined : "Enter the number you used to sign up"}
                errorText={showNoAccountHint ? "There is no account for this number." : null}
              />
            </div>
            <AuthSignupScreenFooter
              cta={requestOtpCta}
              showTerms={false}
              linkType="signup"
              persistRole={loginRole}
            />
          </>
        )}

        {phase === "otp" && (
          <>
            <div className="space-y-6 mb-6 max-w-md opacity-80 pointer-events-none">
              <AuthPhoneField
                id="login-otp-phone-readonly"
                value={phoneDigits}
                onChange={() => {}}
                disabled
                helperText=""
              />
            </div>

            <p className="text-gray-600 text-sm mb-4 max-w-md">
              Enter the OTP that we have sent to{" "}
              <span className="font-semibold text-gray-900">+91 {phoneDigits}</span>
            </p>

            <div className="flex gap-3 sm:gap-4 mb-4 max-w-md">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`login-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-medium rounded-lg outline-none transition-colors
                    ${digit ? authOtpDigitFilledClass : authOtpDigitEmptyClass}`}
                />
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-2 max-w-md">
              Didn&apos;t receive the verification OTP?{" "}
              {countdown > 0 ? (
                <span className="font-medium text-[#2563EB]">Resend otp in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void resendLoginOtp()}
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
              persistRole={loginRole}
            />
          </>
        )}
      </div>
    </AuthFlowLayout>
  );
}
