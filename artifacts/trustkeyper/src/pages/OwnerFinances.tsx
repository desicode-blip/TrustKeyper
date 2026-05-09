import React, { useState } from "react";
import { Bell, Send, Check, Clock, AlertTriangle, ChevronLeft } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { Button } from "@/components/ui/button";

export default function OwnerFinances() {
  const [activeTab, setActiveTab] = useState("All");

  const rentData = [
    {
      id: 1,
      property: "3 BHK in Prestige Lakeside",
      tenant: "Karthik Manjunath",
      dueDate: "Apr 1, 2026",
      amount: "₹28,000",
      status: "Due",
      statusType: "due",
    },
    {
      id: 2,
      property: "2 BHK in Phoenix Towers",
      tenant: "Priya Sharma",
      dueDate: "Apr 1, 2026",
      paidDate: "Mar 29, 2026",
      amount: "₹22,000",
      status: "Paid",
      statusType: "paid",
    },
    {
      id: 3,
      property: "1 BHK in Hi-Tech City",
      tenant: "Ravi Kumar",
      dueDate: "Apr 1, 2026",
      amount: "₹15,000",
      status: "Overdue",
      statusType: "overdue",
    }
  ];

  const filteredData = activeTab === "All" 
    ? rentData 
    : rentData.filter(item => item.statusType === activeTab.toLowerCase());

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-[1000px] mx-auto">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-primary font-semibold text-lg mb-6 hover:underline w-fit">
          <ChevronLeft size={20} /> Back
        </button>
        <div className="mb-6">
          <h1 className="text-[26px] font-semibold text-gray-900 mb-1">Rent Management</h1>
          <p className="text-gray-500 text-[15px]">Track and manage rent payments across all properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-[14px] font-medium text-gray-500 mb-3">Total Due</p>
            <h2 className="text-[32px] font-semibold text-[#E64848]">₹43,000</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-[14px] font-medium text-gray-500 mb-3">Total Collected</p>
            <h2 className="text-[32px] font-semibold text-[#27AE60]">₹1.4L</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-[14px] font-medium text-gray-500 mb-3">Collection Rate</p>
            <h2 className="text-[32px] font-semibold text-[#1F2937]">76%</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 bg-white border border-gray-200 rounded-xl p-1.5 w-fit shadow-sm">
          {[
            { label: "All (8)", id: "All" },
            { label: "Overdue (2)", id: "Overdue" },
            { label: "Paid (6)", id: "Paid" }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-[#E8F5EE] text-[#27AE60]" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm transition-all hover:border-gray-200">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                  item.statusType === 'due' ? "bg-[#FFF9EB] border-[#FFEBBD] text-[#F2994A]" :
                  item.statusType === 'paid' ? "bg-[#E8F5EE] border-[#D1EBDD] text-[#27AE60]" :
                  "bg-[#FFF0F0] border-[#FFD9D9] text-[#EB5757]"
                }`}>
                  {item.statusType === 'due' && <Clock size={22} />}
                  {item.statusType === 'paid' && <Check size={22} strokeWidth={3} />}
                  {item.statusType === 'overdue' && <AlertTriangle size={22} />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-[17px] mb-0.5">{item.property}</h3>
                  <p className="text-[13px] text-gray-500 font-medium">
                    {item.tenant} <span className="mx-1">•</span> Due {item.dueDate}
                  </p>
                  {item.paidDate && (
                    <p className="text-[12px] text-[#27AE60] mt-1 font-semibold">Paid on {item.paidDate}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                  <p className="font-semibold text-[#1F2937] text-[18px]">{item.amount}</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    item.statusType === 'due' ? "bg-[#FFF9EB] text-[#F2994A] border-[#FFEBBD]" :
                    item.statusType === 'paid' ? "bg-[#E8F5EE] text-[#27AE60] border-[#D1EBDD]" :
                    "bg-[#FFF0F0] text-[#EB5757] border-[#FFD9D9]"
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                {item.statusType !== 'paid' && (
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 gap-2 border-gray-200 text-gray-700 font-semibold px-4 rounded-xl hover:bg-gray-50">
                      <Send size={16} /> Remind
                    </Button>
                    <Button className="h-10 bg-[#2F65FF] hover:bg-[#1E50FF] text-white font-semibold px-5 rounded-xl shadow-[0_4px_10px_-4px_rgba(47,101,255,0.5)]">
                      Mark Paid
                    </Button>
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
