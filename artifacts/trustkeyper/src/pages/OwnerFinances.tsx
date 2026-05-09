import React, { useState } from "react";
import { ChevronLeft, Send, Clock, Check, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import OwnerLayout from "@/components/OwnerLayout";

const RENT_DATA = [
  {
    id: "r1",
    property: "3 BHK in Prestige Lakeside",
    tenant: "Karthik Manjunath",
    dueDate: "Apr 1, 2026",
    paidDate: null,
    amount: "₹28,000",
    status: "Due"
  },
  {
    id: "r2",
    property: "2 BHK in Phoenix Towers",
    tenant: "Priya Sharma",
    dueDate: "Apr 1, 2026",
    paidDate: "Mar 29, 2026",
    amount: "₹22,000",
    status: "Paid"
  },
  {
    id: "r3",
    property: "1 BHK in Hi-Tech City",
    tenant: "Ravi Kumar",
    dueDate: "Apr 1, 2026",
    paidDate: null,
    amount: "₹15,000",
    status: "Overdue"
  }
];

export default function OwnerFinances() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [rentData, setRentData] = useState(RENT_DATA);

  const handleMarkPaid = (id: string) => {
    setRentData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: "Paid", paidDate: "Apr 2, 2026" };
      }
      return item;
    }));
  };

  const visibleData = rentData.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "overdue") return item.status === "Overdue";
    if (activeTab === "paid") return item.status === "Paid";
    return true;
  });

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <button onClick={() => setLocation("/owner/dashboard")} className="flex items-center gap-2 text-primary font-medium text-lg mb-6 hover:underline">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Rent Management</h1>
          <p className="text-[#64748B] text-sm">Track and manage rent payments across all properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-[#94A3B8] mb-2">Total Due</p>
            <h2 className="text-3xl font-bold text-[#EF4444]">₹43,000</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-[#94A3B8] mb-2">Total Collected</p>
            <h2 className="text-3xl font-bold text-[#22C55E]">₹1.4L</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-[#94A3B8] mb-2">Collection Rate</p>
            <h2 className="text-3xl font-bold text-[#0F172A]">76%</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 bg-white border border-gray-200 rounded-lg p-1.5 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`h-9 px-5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all" ? "bg-[#DCFCE7] text-[#166534]" : "text-[#64748B] hover:bg-gray-50"
            }`}
          >
            All (8)
          </button>
          <button
            onClick={() => setActiveTab("overdue")}
            className={`h-9 px-5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overdue" ? "bg-[#DCFCE7] text-[#166534]" : "text-[#64748B] hover:bg-gray-50"
            }`}
          >
            Overdue (2)
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`h-9 px-5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "paid" ? "bg-[#DCFCE7] text-[#166534]" : "text-[#64748B] hover:bg-gray-50"
            }`}
          >
            Paid (6)
          </button>
        </div>

        <div className="space-y-4">
          {visibleData.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  item.status === "Due" ? "bg-[#FEF3C7] text-[#D97706]" :
                  item.status === "Paid" ? "bg-[#DCFCE7] text-[#16A34A]" :
                  "bg-[#FEE2E2] text-[#DC2626]"
                }`}>
                  {item.status === "Due" && <Clock size={20} strokeWidth={2.5} />}
                  {item.status === "Paid" && <Check size={20} strokeWidth={3} />}
                  {item.status === "Overdue" && <AlertTriangle size={20} strokeWidth={2.5} />}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-1">{item.property}</h3>
                  <p className="text-[13px] text-[#64748B]">
                    {item.tenant} • Due {item.dueDate}
                  </p>
                  {item.paidDate && (
                    <p className="text-[12px] text-[#22C55E] mt-0.5 font-medium">Paid on {item.paidDate}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#0F172A] text-lg">{item.amount}</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    item.status === "Due" ? "bg-[#FEF3C7] text-[#D97706]" :
                    item.status === "Paid" ? "bg-[#DCFCE7] text-[#16A34A]" :
                    "bg-[#FEE2E2] text-[#DC2626]"
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.status !== "Paid" && (
                  <div className="flex items-center gap-2">
                    <button className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-md border border-gray-200 text-[#334155] text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                      <Send size={14} /> Remind
                    </button>
                    <button onClick={() => handleMarkPaid(item.id)} className="h-9 px-4 rounded-md bg-[#2D31A6] text-white text-sm font-semibold hover:bg-[#2D31A6]/90 transition-colors shadow-sm">
                      Mark Paid
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
}
