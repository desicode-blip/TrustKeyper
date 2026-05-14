import React from "react";
import { ChevronLeft } from "lucide-react";
import brandLogo from "@assets/Trustkeyper_Logo_1777989635996.png";
import sidebarImage from "@assets/Frame_3466237_1777382669479.png";
import { AuthCornerDecor } from "@/components/AuthCornerDecor";

interface AuthFlowLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  backDisabled?: boolean;
  /** Optional row under the nav (e.g. onboarding progress dots). */
  headerFooter?: React.ReactNode;
}

export function AuthFlowLayout({
  children,
  onBack,
  backDisabled = false,
  headerFooter,
}: AuthFlowLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F7FA]">
      <div className="hidden lg:block relative bg-primary overflow-hidden shrink-0 h-screen sticky top-0">
        <img src={sidebarImage} alt="" className="h-full w-auto block" />
      </div>

      <div className="w-full flex-1 flex flex-col pt-[60px] pb-[180px] px-6 lg:px-[140px] relative min-h-screen">
        <AuthCornerDecor className="absolute bottom-4 right-2 lg:right-8 z-0" />

        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <div className="mb-10 shrink-0">
            <div className="relative flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={backDisabled}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors hover:bg-gray-300 disabled:hover:bg-gray-200"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="absolute left-1/2 top-0 -translate-x-1/2 sm:hidden">
                <img src={brandLogo} alt="TrustKeyper" className="h-10 w-auto" />
              </div>

              <div className="w-10" />
            </div>

            {headerFooter ? <div className="mt-4">{headerFooter}</div> : null}
          </div>

          <div className="flex-1 flex flex-col min-h-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
