import React, { useState } from "react";
import { ChevronLeft, Eye, Info } from "lucide-react";
import { Link, useLocation } from "wouter";
import OwnerLayout from "@/components/OwnerLayout";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "inquiries", label: "Inquiries (3)" },
  { id: "active", label: "Active Tenants (47)" },
  { id: "past", label: "Past Tenants" },
];

const mockActiveTenants = [
  { id: "t1", name: "Karthik M.", phone: "+91 9318142244", property: "Prestige Unit 1806", rent: "₹37,350", status: "Paid" },
  { id: "t2", name: "Priya Sharma", phone: "+91 7575925255", property: "Prestige Unit 1806", rent: "₹37,432", status: "Pending" },
  { id: "t3", name: "Arjun Reddy", phone: "+91 7520259505", property: "Prestige Unit 1806", rent: "₹37,778", status: "Paid" },
  { id: "t4", name: "Sneha Patel", phone: "+91 7198942138", property: "Prestige Unit 1806", rent: "₹22,569", status: "Paid" },
  { id: "t5", name: "Karthik M.", phone: "+91 9318142244", property: "Prestige Unit 1806", rent: "₹37,350", status: "Paid" },
  { id: "t6", name: "Priya Sharma", phone: "+91 7575925255", property: "Prestige Unit 1806", rent: "₹37,432", status: "Due" },
];

const mockInquiries = [
  { id: "i1", name: "Geetha Sharma", property: "Prestige Lakeside unit 1204", type: "Family", food: "Non Veg" },
  { id: "i2", name: "Abdul", property: "Prestige Lakeside unit 1204", type: "Family", food: "Non Veg" },
  { id: "i3", name: "Sana Raju", property: "Prestige Lakeside unit 1204", type: "Bachelor", food: "Veg" },
];

export default function OwnerTenants() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("active");

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-50 text-green-700";
      case "Pending": return "bg-amber-50 text-amber-700";
      case "Due": return "bg-red-50 text-red-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline w-fit">
            <ChevronLeft size={20} /> Back
          </button>
          {activeTab === "inquiries" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <span className="text-lg leading-none mt-[-2px]">↗</span> Invite Tenants
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 mb-8 bg-white border border-gray-200 rounded-md p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`h-9 px-6 rounded text-sm font-medium transition-colors ${activeTab === t.id ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "active" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-gray-200">
                  <th className="py-4 px-6 text-[13px] font-semibold text-gray-600 w-1/4">Tenant</th>
                  <th className="py-4 px-6 text-[13px] font-semibold text-gray-600 w-1/4">Property</th>
                  <th className="py-4 px-6 text-[13px] font-semibold text-gray-600 w-1/6">Rent</th>
                  <th className="py-4 px-6 text-[13px] font-semibold text-gray-600 w-1/6">Rent Status</th>
                  <th className="py-4 px-6 text-[13px] font-semibold text-gray-600 w-1/6"></th>
                </tr>
              </thead>
              <tbody>
                {mockActiveTenants.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{t.property}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{t.rent}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(t.status)}`}>
                        {t.status}
                        {t.status !== "Paid" && <Info size={12} className="opacity-70" />}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setLocation(`/owner/tenants/${t.id}`)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-primary text-primary text-xs font-medium hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={14} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="flex flex-col gap-4">
            {mockInquiries.map(t => (
              <div key={t.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold shrink-0">
                    {getInitials(t.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                      <button className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg> View profile
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">For {t.property}</span>
                      <span className="flex items-center gap-1"><span className="text-[10px]">👥</span> {t.type}</span>
                      <span className="flex items-center gap-1"><span className="text-[10px]">🍴</span> {t.food}</span>
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors w-full sm:w-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  Chat
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </OwnerLayout>
  );
}
