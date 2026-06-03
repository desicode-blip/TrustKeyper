import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, FileText } from "lucide-react";
import { useLocation } from "wouter";
import OwnerLayout from "@/components/OwnerLayout";
import { OwnerPageEmpty } from "@/components/owner/OwnerPageEmpty";
import { OwnerFlowButton } from "@/components/owner/OwnerFlowButton";
import { getAgreements, type Agreement } from "@/lib/agreements";
import { getOwnerName } from "@/components/OwnerLayout";

export default function OwnerAgreements() {
  const [, setLocation] = useLocation();
  const ownerName = getOwnerName().replace("!", "").trim().toLowerCase();
  const [agreements, setAgreements] = useState<Agreement[]>([]);

  useEffect(() => {
    const refresh = () => {
      const list = getAgreements().filter(
        (a) => a.ownerName?.trim().toLowerCase() === ownerName,
      );
      setAgreements(list);
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [ownerName]);

  const recentAgreements = useMemo(
    () => [...agreements].sort((a, b) => b.createdAt - a.createdAt),
    [agreements],
  );

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => setLocation("/owner/dashboard")}
          className="flex items-center gap-2 text-primary font-medium text-lg mb-6 hover:underline w-fit"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Agreement</h1>
          <OwnerFlowButton onClick={() => setLocation("/owner/agreements/generate")}>
            Generate Agreement
          </OwnerFlowButton>
        </div>

        {recentAgreements.length === 0 ? (
          <OwnerPageEmpty
            icon={FileText}
            title="No agreements yet"
            description="Create a rental agreement for your property to collect documents and e-signatures."
          />
        ) : (
          <div className="space-y-4">
            {recentAgreements.map((agreement) => (
              <div key={agreement.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{agreement.propertyTitle}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">Tenant: {agreement.tenantName || "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(agreement.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                    {agreement.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
