import React, { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Check } from "lucide-react";
import sidebarImage from "@assets/Frame_3466237_1777382669479.png";
import Step1Role from "@/components/Step1Role";
import Step2Details from "@/components/Step2Details";
import Step3OTP from "@/components/Step3OTP";
import Step4KYC from "@/components/Step4KYC";
import BrokerForm from "@/components/BrokerForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [details, setDetails] = useState({ name: "", phone: "" });
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [, setLocation] = useLocation();

  const isBrokerFlow = role === "broker" && step >= 2;
  const totalDots = isBrokerFlow ? 2 : 4;

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

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
      <div className="w-full flex-1 flex flex-col pt-[120px] pb-[120px] px-6 lg:px-[140px]">
        {/* Header / Nav */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors hover:bg-gray-300 disabled:hover:bg-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalDots }).map((_, idx) => {
              const i = idx + 1;
              const activeIndex = isBrokerFlow ? step - 1 : step;
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
          {step >= 2 && role === "broker" && (
            <BrokerForm
              onComplete={() => setLocation("/broker/dashboard")}
            />
          )}
          {step === 2 && role !== "broker" && (
            <Step2Details details={details} setDetails={setDetails} onNext={goNext} />
          )}
          {step === 3 && role !== "broker" && (
            <Step3OTP details={details} onNext={goNext} />
          )}
          {step === 4 && role !== "broker" && (
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
              <DialogTitle className="text-2xl font-bold text-center">Successfully Verified!</DialogTitle>
              <DialogDescription className="text-center text-base mt-2">
                Your details have been saved.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
