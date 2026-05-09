import React from "react";
import { ChevronLeft, FileText, Eye, Download, Edit } from "lucide-react";
import { useLocation } from "wouter";
import OwnerLayout from "@/components/OwnerLayout";

export default function OwnerAgreements() {
  const [, setLocation] = useLocation();

  const agreements = [
    { id: "a1", name: "Rental Agreement - Prestige Lakeside", date: "Mar 26, 2026", status: "E-sign Pending" }
  ];

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button onClick={() => setLocation("/owner/dashboard")} className="flex items-center gap-2 text-primary font-medium text-lg mb-6 hover:underline">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Agreement</h1>

        <div className="space-y-4">
          {agreements.map(a => (
            <div key={a.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{a.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Agreement- {a.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-4 text-gray-700">
                  <button className="hover:text-primary transition-colors"><Eye size={18} /></button>
                  <button className="hover:text-primary transition-colors"><Download size={18} /></button>
                  <button className="hover:text-primary transition-colors"><Edit size={18} /></button>
                </div>
                <span className="bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                  {a.status} <span className="text-orange-500 border border-orange-500 w-3 h-3 rounded-full flex items-center justify-center text-[8px]">!</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
}
