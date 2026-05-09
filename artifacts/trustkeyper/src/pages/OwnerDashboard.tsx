import React, { useEffect, useState } from "react";
import { Plus, Eye, MapPin, Check, Building2, Wallet, AlertTriangle, ChevronRight, Activity, Wrench, AlertCircle, UserPlus, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import OwnerLayout, { getOwnerName } from "@/components/OwnerLayout";
import { getProperties, type Property } from "@/lib/properties";

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const ownerName = getOwnerName();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Show only properties uploaded by owner or properties matching owner
    const all = getProperties();
    const ownerProps = all.filter(p => p.uploadedBy === "owner" || p.ownerName === ownerName);
    setProperties(ownerProps);
  }, [ownerName]);

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[28px] font-bold text-[#1a56db]">
            Welcome back, {ownerName}!
          </h1>
          <button
            onClick={() => setLocation("/owner/properties/add")}
            className="inline-flex items-center gap-2 h-10 px-5 rounded bg-[#2D31A6] text-white text-sm font-medium hover:bg-[#2D31A6]/90 transition-colors shadow-sm"
          >
            Add Property <Plus size={16} />
          </button>
        </div>

        {/* Overview */}
        <h2 className="text-[15px] font-semibold text-gray-600 mb-3 uppercase tracking-wider">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Total Properties */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <Building2 size={20} className="text-[#2D31A6]" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">50</h3>
            <p className="text-[11px] font-medium text-gray-500 mb-4">47 Occupied | 3 Vacant</p>
            
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <p className="text-[10px] text-gray-400">94% occupied</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <Wallet size={20} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">₹14,28,000</h3>
            <p className="text-[11px] font-medium mb-4">
              <span className="text-green-600">40 Paid</span> | <span className="text-red-500">7 Overdue</span>
            </p>
            <div className="mt-auto flex justify-center">
              <button onClick={() => setLocation("/owner/finances")} className="w-full h-8 rounded border border-[#2D31A6] text-[#2D31A6] text-xs font-semibold hover:bg-blue-50 transition-colors">
                View Details
              </button>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="bg-[#FFF5F5] rounded-xl border border-red-100 shadow-sm p-5 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-medium text-gray-500">Open Tickets</p>
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div className="flex items-center gap-6 mb-4">
              <h3 className="text-3xl font-bold text-[#E02424]">4</h3>
              <div className="flex flex-col gap-1 w-full max-w-[120px]">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High Priority</span>
                  <span className="text-gray-900 font-bold">1</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium Priority</span>
                  <span className="text-gray-900 font-bold">1</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Low Priority</span>
                  <span className="text-gray-900 font-bold">1</span>
                </div>
              </div>
            </div>
            <div className="mt-auto flex justify-center">
              <button onClick={() => setLocation("/owner/tickets")} className="w-full h-8 rounded border border-[#2D31A6] text-[#2D31A6] text-xs font-semibold hover:bg-blue-50 transition-colors bg-white">
                View Details
              </button>
            </div>
          </div>

        </div>

        {/* Your Properties */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-gray-600 uppercase tracking-wider">Your Properties</h2>
          <Link href="/owner/properties" className="text-xs font-medium text-[#2D31A6] hover:underline flex items-center gap-1">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-48 bg-gray-100">
               <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Property" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-[#0A84FF] text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">Prestige Unit 1806</h3>
                <button className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 shrink-0">
                  <ChevronRight size={14} />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-3">
                <MapPin size={10} /> Plot - 160, nanakaram guda....
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[8px] font-bold">
                  AR
                </div>
                <span className="text-[10px] font-medium text-gray-600">Arjun Reddy</span>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-xs">
                    ₹32,583<span className="text-[10px] text-gray-500 font-normal">/mo</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-500">79/100</span>
              </div>
              <p className="text-[9px] text-gray-400 mb-3">Rent received 7 days ago</p>

              <div className="bg-[#F5E6E6] text-[#9B1C1C] text-[10px] font-medium px-3 py-2 rounded-sm text-center">
                Property is not rented out for the past 2 months
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <h2 className="text-[15px] font-semibold text-gray-600 uppercase tracking-wider mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col">
            
            <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <span className="text-[10px] text-gray-400 font-medium w-8 text-right shrink-0">2h ago</span>
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                <CreditCard size={14} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-[13px]">Rent received</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Prestige Lakeside Unit 1204</p>
              </div>
              <span className="text-green-500 font-bold text-[13px]">+₹28,000</span>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <span className="text-[10px] text-gray-400 font-medium w-8 text-right shrink-0">4h ago</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                <Wrench size={14} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-[13px]">Repair ticket closed (AC Fixed)</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Prestige Sunrise Unit 305</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <span className="text-[10px] text-gray-400 font-medium w-8 text-right shrink-0">5h ago</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                <AlertCircle size={14} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-[13px]">Inspection alert: Minor leak detected</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Prestige Heights Unit 1107</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <span className="text-[10px] text-gray-400 font-medium w-8 text-right shrink-0">1d ago</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100">
                <UserPlus size={14} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-[13px]">New tenant moved in: Priya Sharma</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Prestige Royale Unit 204</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <span className="text-[10px] text-gray-400 font-medium w-8 text-right shrink-0">1d ago</span>
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                <Check size={14} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-[13px]">Rent received</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Lodha Belleza Unit 401</p>
              </div>
              <span className="text-green-500 font-bold text-[13px]">+₹32,000</span>
            </div>

          </div>
          <div className="border-t border-gray-100 p-3 text-center">
            <button className="text-xs font-semibold text-[#2D31A6] hover:underline">View All Activity</button>
          </div>
        </div>

      </div>
    </OwnerLayout>
  );
}
