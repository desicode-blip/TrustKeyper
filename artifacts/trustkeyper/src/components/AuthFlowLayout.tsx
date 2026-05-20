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
      </div>

      <div className="w-full flex-1 flex flex-col min-h-screen lg:min-h-0">
        <AuthMobileBrandBanner />

        <div className="flex-1 flex flex-col pt-6 pb-[5.5rem] px-6 lg:pt-[60px] lg:pb-[180px] lg:px-[140px] relative bg-[#F5F7FA]">
          <AuthCornerDecor className="hidden lg:block absolute bottom-4 right-8 z-0" />

          <div className="relative z-10 flex-1 flex flex-col min-h-0 max-w-full">
            <div className="mb-8 shrink-0">
              <button
                type="button"
                onClick={onBack}
                disabled={backDisabled}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors hover:bg-gray-300 disabled:hover:bg-gray-200"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
