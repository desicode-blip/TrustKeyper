import React from "react";
import { ChevronLeft } from "lucide-react";
import sidebarImage from "@assets/Frame_3466237_1777382669479.png";
import { AuthCornerDecor } from "@/components/AuthCornerDecor";
import { AuthMobileBrandBanner } from "@/components/auth/AuthMobileBrandBanner";

interface AuthFlowLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  backDisabled?: boolean;
}

export function AuthFlowLayout({
  children,
  onBack,
  backDisabled = false,
}: AuthFlowLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F7FA]">
      <div className="hidden lg:block relative bg-primary overflow-hidden shrink-0 h-screen sticky top-0">
        <img src={sidebarImage} alt="" className="h-full w-auto block" />
        <a
          href="https://trustkeyper.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-10 left-10 z-10 block h-12 w-[112px] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="TrustKeyper"
        />
      </div>

      <div className="w-full flex-1 flex flex-col min-h-screen lg:min-h-0">
        <AuthMobileBrandBanner />

        <div className="flex-1 flex flex-col pt-4 pb-[5.5rem] px-5 sm:px-6 lg:pt-[60px] lg:pb-16 lg:px-[140px] relative bg-[#F5F7FA]">
          <AuthCornerDecor className="hidden lg:block absolute bottom-4 right-8 z-0" />

          <div className="relative z-10 flex-1 flex flex-col min-h-0 max-w-full mx-auto w-full lg:max-w-none">
            {!backDisabled ? (
              <div className="mb-5 lg:mb-8 shrink-0">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#E8EEF4] text-gray-700 transition-colors hover:bg-[#DCE4EC]"
                  aria-label="Go back"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            ) : null}

            <div className="flex-1 flex flex-col min-h-0 lg:max-w-none">{children}</div>
          </div>
        </div>

        <div className="lg:hidden h-1.5 shrink-0 bg-[#1E4FD9]" aria-hidden />
      </div>
    </div>
  );
}
