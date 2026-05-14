import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  ALL_ROLES,
  type Role,
  dashboardRouteFor,
  loginSuccess,
  profileExists,
  signUpSuccess,
} from "@/lib/auth";
import { setSessionItem } from "@/lib/storageKeys";
import { AuthFlowLayout } from "@/components/AuthFlowLayout";
import { AuthGoToLoginLink } from "@/components/AuthFlowFooterLinks";
import Step1Role from "@/components/Step1Role";
import Step2Details from "@/components/Step2Details";
import Step3OTP from "@/components/Step3OTP";
import Step4KYC from "@/components/Step4KYC";
import BrokerForm from "@/components/BrokerForm";
import OwnerStep1Properties from "@/components/OwnerStep1Properties";
import OwnerStep2Intent from "@/components/OwnerStep2Intent";
import OwnerStep3Details from "@/components/OwnerStep3Details";
import OwnerStep4OTP from "@/components/OwnerStep4OTP";
import OwnerStep5Plan from "@/components/OwnerStep5Plan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [details, setDetails] = useState({ name: "", phone: "" });

  const [propertiesCount, setPropertiesCount] = useState("");
  const [propertyIntent, setPropertyIntent] = useState<string[]>([]);
  const [ownerDetails, setOwnerDetails] = useState({ name: "", phone: "" });

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isManagedPopupOpen, setIsManagedPopupOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const pending = sessionStorage.getItem("tk_pending_role");
    if (pending && ALL_ROLES.includes(pending as Role)) {
      setRole(pending);
    }
  }, []);

  const isBrokerFlow = role === "broker" && step >= 2;
  const isOwnerFlow = role === "owner" && step >= 2;

  const totalDots = isBrokerFlow ? 2 : isOwnerFlow ? 6 : 4;

  const goNext = () => {
    const maxSteps = isOwnerFlow ? 6 : 4;
    setStep((s) => Math.min(maxSteps, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleOwnerSuccessNext = () => {
    try {
      setSessionItem("name", ownerDetails.name);
      setSessionItem("contact", ownerDetails.phone.replace(/\D/g, "").slice(0, 10));
    } catch {
      /* ignore */
    }

    setIsSuccessOpen(false);
    setStep(5);
  };

  const handlePlanSelect = (plan: "diy" | "managed") => {
    if (plan === "managed") {
      setIsManagedPopupOpen(true);
    } else {
      setLocation("/owner/properties/add");
    }
  };

  const progressDots = (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalDots }).map((_, idx) => {
        const i = idx + 1;
        const activeIndex = isBrokerFlow ? step - 1 : isOwnerFlow ? step - 1 : step;
        return (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i <= activeIndex ? "bg-primary" : "bg-gray-300"}`}
          />
        );
      })}
    </div>
  );

  return (
    <AuthFlowLayout onBack={goBack} backDisabled={step === 1} headerFooter={progressDots}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          {step === 1 && (
            <Step1Role
              role={role}
              setRole={setRole}
              onNext={() => {
                if (role) sessionStorage.setItem("tk_pending_role", role);
                goNext();
              }}
            />
          )}

          {step >= 2 && role === "broker" && <BrokerForm />}

          {step === 2 && role === "owner" && (
            <OwnerStep1Properties
              propertiesCount={propertiesCount}
              setPropertiesCount={setPropertiesCount}
              onNext={goNext}
            />
          )}
          {step === 3 && role === "owner" && (
            <OwnerStep3Details details={ownerDetails} setDetails={setOwnerDetails} onNext={goNext} />
          )}
          {step === 4 && role === "owner" && (
            <OwnerStep4OTP
              details={ownerDetails}
              onNext={() => {
                const phoneDigits = ownerDetails.phone.replace(/\D/g, "").slice(0, 10);
                const pending = sessionStorage.getItem("tk_pending_role") || "owner";
                const r = (ALL_ROLES.includes(pending as Role) ? pending : "owner") as Role;
                if (profileExists(phoneDigits, r)) {
                  toast({
                    title: `You already have an Owner account. Logging you in.`,
                  });
                  loginSuccess(phoneDigits, r);
                  setLocation(dashboardRouteFor(r));
                  return;
                }
                signUpSuccess(phoneDigits, r, {
                  name: ownerDetails.name,
                  phone: phoneDigits,
                  email: "",
                  firm: "",
                  bankHolderName: "",
                  bankName: "",
                  bankAccountNumber: "",
                  bankIFSC: "",
                  upiId: "",
                  upiQrFileName: "",
                });
                setIsSuccessOpen(true);
              }}
            />
          )}
          {step === 5 && role === "owner" && (
            <OwnerStep2Intent
              propertyIntent={propertyIntent}
              setPropertyIntent={setPropertyIntent}
              onNext={goNext}
            />
          )}
          {step === 6 && role === "owner" && (
            <OwnerStep5Plan onSelectPlan={handlePlanSelect} />
          )}

          {step === 2 && role !== "broker" && role !== "owner" && (
            <Step2Details details={details} setDetails={setDetails} onNext={goNext} />
          )}
          {step === 3 && role !== "broker" && role !== "owner" && (
            <Step3OTP
              details={details}
              onNext={() => {
                const phoneDigits = details.phone.replace(/\D/g, "").slice(0, 10);
                const pending = sessionStorage.getItem("tk_pending_role") || role;
                const r = (ALL_ROLES.includes(pending as Role) ? pending : role) as Role;
                if (!ALL_ROLES.includes(r)) return;
                if (profileExists(phoneDigits, r)) {
                  toast({
                    title: `You already have a ${r} account. Logging you in.`,
                  });
                  loginSuccess(phoneDigits, r);
                  setLocation(dashboardRouteFor(r));
                  return;
                }
                signUpSuccess(phoneDigits, r, {
                  name: details.name,
                  phone: phoneDigits,
                  email: "",
                  firm: "",
                  bankHolderName: "",
                  bankName: "",
                  bankAccountNumber: "",
                  bankIFSC: "",
                  upiId: "",
                  upiQrFileName: "",
                });
                goNext();
              }}
            />
          )}
          {step === 4 && role !== "broker" && role !== "owner" && (
            <Step4KYC onComplete={() => setIsSuccessOpen(true)} />
          )}
        </div>

        {step > 1 ? <AuthGoToLoginLink persistRole={role} /> : null}

        <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center p-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
              <Check size={24} strokeWidth={3} />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center">Successfully Verified!</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              Your details have been saved.
            </DialogDescription>
          </DialogHeader>
          {role === "owner" && (
            <div className="mt-6 w-full">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm"
                onClick={handleOwnerSuccessNext}
              >
                Add Property
              </Button>
            </div>
          )}
          {role !== "owner" && role !== "broker" && (
            <div className="mt-6 w-full">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm"
                onClick={() => {
                  setIsSuccessOpen(false);
                  setLocation(dashboardRouteFor(role as Role));
                }}
              >
                Go to dashboard
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isManagedPopupOpen} onOpenChange={setIsManagedPopupOpen}>
        <DialogContent className="sm:max-w-md text-center p-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center">We&apos;re on it!</DialogTitle>
            <DialogDescription className="text-center text-base mt-3 text-gray-600">
              Thank you for choosing End-to-End Managed. Our expert property manager will contact you at your
              registered mobile number shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8 w-full">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm"
              onClick={() => {
                setIsManagedPopupOpen(false);
                setLocation("/");
              }}
            >
              Return Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AuthFlowLayout>
  );
}
