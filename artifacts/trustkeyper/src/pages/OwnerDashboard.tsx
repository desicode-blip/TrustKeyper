import React, { useEffect, useState } from "react";
import { Plus, MapPin, Building2, Wallet, Clock, AlertTriangle, ArrowRight, Wrench, PenTool, Check, Search, Bell, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { getProperties, type Property } from "@/lib/properties";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const ownerName = getOwnerName();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const all = getProperties();
    const ownerProps = all.filter(p => p.uploadedBy === "owner" || p.ownerName === ownerName);
    setProperties(ownerProps);
  }, [ownerName]);

  return (
    <OwnerLayout>
      <div className="p-6 sm:p-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <h1 className="text-[28px] font-bold text-[#2D3748]">
            Welcome back, {ownerName.replace("!", "")}!
          </h1>
          <Button
            onClick={() => setLocation("/owner/properties/add")}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 h-11 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            Add Property <Plus size={18} />
          </Button>
        </div>

        <div className="mb-10">
          <h2 className="text-[18px] font-bold text-[#1A202C] mb-5">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Properties Card */}
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[14px] font-semibold text-gray-500">Total Properties</p>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B82F6]">
                  <Building2 size={20} />
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-[34px] font-black text-[#1A202C] mb-1">50</h3>
                <p className="text-[13px] font-semibold text-gray-500">47 Occupied <span className="mx-1 text-gray-300">|</span> <span className="text-gray-400 font-medium">3 Vacant</span></p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 mb-2">
                  <div className="bg-[#2ECC71] h-2.5 rounded-full" style={{ width: "94%" }}></div>
                </div>
                <p className="text-[11px] font-bold text-gray-400">94% occupied</p>
              </div>
            </div>

            {/* Monthly Revenue Card */}
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[14px] font-semibold text-gray-500">Monthly Revenue</p>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2ECC71]">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-[34px] font-black text-[#1A202C] mb-1">₹14,28,000</h3>
                <p className="text-[13px] font-bold">
                  <span className="text-[#2ECC71]">40 Paid</span> <span className="mx-1 text-gray-300">|</span> <span className="text-[#E74C3C]">7 Overdue</span>
                </p>
              </div>
              <div className="mt-auto">
                <Link href="/owner/finances" className="inline-flex items-center justify-center text-[12px] font-bold text-[#3B82F6] bg-white border-2 border-[#3B82F6]/10 px-6 py-2 rounded-xl hover:bg-blue-50 transition-colors w-fit">
                  View Details
                </Link>
              </div>
            </div>

            {/* Open Tickets Card */}
            <div className="bg-[#FFF5F0] rounded-[24px] border border-[#FFE7DB] p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[14px] font-semibold text-gray-500">Open Tickets</p>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E67E22]">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="flex gap-6 mb-6">
                <h3 className="text-[44px] font-black text-[#E67E22] leading-none">4</h3>
                <div className="flex flex-col gap-2 flex-1 justify-center">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E74C3C]"></span> High Priority</span>
                    <span className="text-[#1A202C]">1</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E67E22]"></span> Medium Priority</span>
                    <span className="text-[#1A202C]">1</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span> Low Priority</span>
                    <span className="text-[#1A202C]">1</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <Link href="/owner/tickets" className="inline-flex items-center justify-center text-[12px] font-bold text-[#3B82F6] bg-white border-2 border-[#3B82F6]/10 px-6 py-2 rounded-xl hover:bg-blue-50 transition-colors w-fit">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Your Properties Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-[#1A202C]">Your Properties</h2>
            <Link href="/owner/properties" className="text-[13px] font-bold text-[#3B82F6] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm flex flex-col relative transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="relative h-56 group">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Property" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#3B82F6] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-black text-[#1A202C] text-lg leading-tight">Prestige Unit 1806</h3>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
                    <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1.5 mb-5">
                  <MapPin size={14} className="text-[#3B82F6]" /> Plot - 160 , nanakaram guda....
                </p>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#3B82F6] text-[11px] font-black flex items-center justify-center">
                    AR
                  </div>
                  <span className="text-[13px] text-[#2D3748] font-bold">Arjun Reddy</span>
                </div>
                
                <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-black text-[#1A202C] text-[18px]">
                      ₹32,583<span className="text-[12px] text-gray-400 font-semibold">/mo</span>
                    </p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">Rent received 7 days ago</p>
                  </div>
                  <span className="text-[14px] font-black text-[#E67E22]">79/100</span>
                </div>
              </div>
              <div className="bg-[#FAF3F3] text-[#C0392B] text-[12px] font-bold py-3 px-6 text-center border-t border-[#F5E6E6]">
                Property is not rented out for the past 2 months
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-[18px] font-bold text-[#1A202C] mb-6">Recent Activity</h2>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="divide-y divide-gray-50">
              {/* Activity Items */}
              {[
                { time: "2h ago", icon: Wallet, color: "bg-green-50 text-[#2ECC71]", title: "Rent received", subtitle: "Prestige Lakeside Unit 1204", amount: "+₹28,000" },
                { time: "4h ago", icon: Wrench, color: "bg-blue-50 text-[#3B82F6]", title: "Repair ticket closed (AC Fixed)", subtitle: "Prestige Sunrise Unit 305" },
                { time: "5h ago", icon: AlertTriangle, color: "bg-orange-50 text-[#E67E22]", title: "Inspection alert: Minor leak detected", subtitle: "Prestige Heights Unit 1107" },
                { time: "1d ago", icon: PenTool, color: "bg-purple-50 text-[#9B59B6]", title: "New tenant moved in: Priya Sharma", subtitle: "Prestige Royale Unit 204" },
                { time: "1d ago", icon: Check, color: "bg-green-50 text-[#2ECC71]", title: "Rent received", subtitle: "Lodha Belleza Unit 401", amount: "+₹32,000" }
              ].map((activity, idx) => (
                <div key={idx} className="p-5 sm:px-8 flex items-center gap-6 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <span className="text-[12px] font-bold text-gray-400 w-14 text-right shrink-0">{activity.time}</span>
                  <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shrink-0 border border-current opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <activity.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#1A202C] text-[15px]">{activity.title}</p>
                    <p className="text-[12px] font-semibold text-gray-500">{activity.subtitle}</p>
                  </div>
                  {activity.amount && (
                    <div className="text-[16px] font-black text-[#2ECC71] shrink-0">{activity.amount}</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-50 p-4 text-center bg-gray-50/20">
              <button className="text-[13px] font-black text-[#3B82F6] hover:underline">View All Activity</button>
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
