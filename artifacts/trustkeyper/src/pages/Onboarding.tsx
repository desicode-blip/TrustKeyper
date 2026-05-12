import React, { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Check } from "lucide-react";
import brandLogo from "@assets/Trustkeyper_Logo_1777989635996.png";
import sidebarImage from "@assets/Frame_3466237_1777382669479.png";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [details, setDetails] = useState({ name: "", phone: "" });
  
  // Owner flow states
  const [propertiesCount, setPropertiesCount] = useState("");
  const [propertyIntent, setPropertyIntent] = useState<string[]>([]);
  const [ownerDetails, setOwnerDetails] = useState({ name: "", contact: "" });
  const [ownerPlan, setOwnerPlan] = useState<"diy" | "managed" | null>(null);
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isManagedPopupOpen, setIsManagedPopupOpen] = useState(false);
  const [, setLocation] = useLocation();

  const isBrokerFlow = role === "broker" && step >= 2;
  const isOwnerFlow = role === "owner" && step >= 2;
  
  const totalDots = isBrokerFlow ? 2 : isOwnerFlow ? 6 : 4;

  const goNext = () => {
    const maxSteps = isOwnerFlow ? 6 : 4;
    setStep((s) => Math.min(maxSteps, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleOwnerSuccessNext = () => {
    // Save to session storage for the next screens to pre-fill
    sessionStorage.setItem("owner_name", ownerDetails.name);
    sessionStorage.setItem("owner_contact", ownerDetails.contact);
    
    setIsSuccessOpen(false);
    setStep(5);
  };

  const handlePlanSelect = (plan: "diy" | "managed") => {
    setOwnerPlan(plan);
    if (plan === "managed") {
      setIsManagedPopupOpen(true);
    } else {
      setLocation("/owner/properties/add");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F7FA]">
      {/* Left Sidebar */}
      <div className="hidden lg:block relative bg-primary overflow-hidden shrink-0 h-screen sticky top-0">
        <img 
          src={sidebarImage} 
          alt="TrustKeyper Sidebar" 
          className="h-full w-auto block" 
        />
      </div>

      {/* Right Content Area */}
      <div className="w-full flex-1 flex flex-col pt-[120px] pb-[180px] px-6 lg:px-[140px]">
        {/* Header / Nav */}
      <div className="mb-10">
        <div className="relative flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors hover:bg-gray-300 disabled:hover:bg-gray-200"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="absolute left-1/2 top-0 -translate-x-1/2 sm:hidden">
            <img src={brandLogo} alt="TrustKeyper" className="h-10 w-auto" />
          </div>

          <div className="w-10" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalDots }).map((_, idx) => {
            const i = idx + 1;
            const activeIndex = isBrokerFlow ? step - 1 : isOwnerFlow ? step - 1 : step;
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= activeIndex ? "bg-primary" : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>

        {/* Step Content */}
        <div className="flex-1">
          {step === 1 && (
            <Step1Role role={role} setRole={setRole} onNext={goNext} />
          )}
          
          {/* Broker Flow */}
          {step >= 2 && role === "broker" && (
            <BrokerForm
              onComplete={() => setLocation("/broker/dashboard")}
            />
          )}
          
          {/* Owner Flow */}
          {step === 2 && role === "owner" && (
            <OwnerStep1Properties propertiesCount={propertiesCount} setPropertiesCount={setPropertiesCount} onNext={goNext} />
          )}
          {step === 3 && role === "owner" && (
            <OwnerStep3Details details={ownerDetails} setDetails={setOwnerDetails} onNext={goNext} />
          )}
          {step === 4 && role === "owner" && (
            <OwnerStep4OTP details={ownerDetails} onNext={() => setIsSuccessOpen(true)} />
          )}
          {step === 5 && role === "owner" && (
            <OwnerStep2Intent propertyIntent={propertyIntent} setPropertyIntent={setPropertyIntent} onNext={goNext} />
          )}
          {step === 6 && role === "owner" && (
            <OwnerStep5Plan onSelectPlan={handlePlanSelect} />
          )}

          {/* Default Flow (Tenant / Manager) */}
          {step === 2 && role !== "broker" && role !== "owner" && (
            <Step2Details details={details} setDetails={setDetails} onNext={goNext} />
          )}
          {step === 3 && role !== "broker" && role !== "owner" && (
            <Step3OTP details={details} onNext={goNext} />
          )}
          {step === 4 && role !== "broker" && role !== "owner" && (
            <Step4KYC onComplete={() => setIsSuccessOpen(true)} />
          )}
        </div>

        {/* Success Modal */}
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
          </DialogContent>
        </Dialog>

        {/* Managed Plan Popup */}
        <Dialog open={isManagedPopupOpen} onOpenChange={setIsManagedPopupOpen}>
          <DialogContent className="sm:max-w-md text-center p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-center">We're on it!</DialogTitle>
              <DialogDescription className="text-center text-base mt-3 text-gray-600">
                {ownerDetails.contact.includes("@") 
                  ? "Thank you for choosing End-to-End Managed. You will receive a meeting link at your registered email address shortly to discuss your property."
                  : "Thank you for choosing End-to-End Managed. Our expert property manager will contact you at your registered mobile number shortly."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 w-full">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm"
                onClick={() => {
                  setIsManagedPopupOpen(false);
                  setLocation("/"); // Or dashboard if there is one
                }}
              >
                Return Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
