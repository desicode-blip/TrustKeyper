import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { MapPin, ChevronLeft, PhoneCall, Edit, Plus, Eye, Check } from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { getProperties, type Property } from "@/lib/properties";
import { Button } from "@/components/ui/button";

export default function OwnerPropertyDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/owner/properties/:id");
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (params?.id) {
      const all = getProperties();
      const p = all.find(x => x.id === params.id);
      if (p) setProperty(p);
    }
  }, [params?.id]);

  if (!property) {
    return (
      <OwnerLayout>
        <div className="p-8 text-center text-gray-500">Property not found.</div>
      </OwnerLayout>
    );
  }

  const rent = property.monthlyRent ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}` : "N/A";

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-primary font-semibold text-lg mb-6 hover:underline w-fit">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">{property.nickname || property.address}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> {property.area}, {property.city}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    {property.status !== "Rented" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />} 
                    {property.status === "Rented" ? "Occupied" : "Live"}
                  </div>
                  <div className="border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {property.bedrooms} Bed • {property.bathrooms} Bath • {property.propertyType}
                  </div>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-gray-500 font-semibold mb-0.5">Expected Rent</p>
                <p className="text-3xl font-semibold text-green-600">{rent}<span className="text-lg font-semibold text-green-600">/mo</span></p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 px-6 flex items-center gap-6">
            {["overview", "documents", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Images block */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.images && property.images.length > 0 ? (
                  <>
                    <div className="col-span-2 sm:col-span-3 h-48 md:h-64 rounded-xl bg-gray-100 overflow-hidden relative">
                      <img src={property.images[0]} alt="Main" className="w-full h-full object-cover" />
                    </div>
                    {property.images.slice(1).map((img, i) => (
                      <div key={i} className="aspect-video sm:aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
                        <img src={img} alt={`Thumb ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm font-semibold">No photos uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details block */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  Edit Details <Edit size={14} />
                </button>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Property Type", value: property.propertyType },
                  { label: "BHK / Size", value: `${property.bedrooms} Bed, ${property.bathrooms} Bath` },
                  { label: "Built-up Area", value: `${property.builtUpArea} ${property.builtUpUnits}` },
                  { label: "Furnishing", value: property.furnishing },
                  { label: "Expected Rent", value: `${rent}/mo` },
                  { label: "Security Deposit", value: `₹${Number(property.securityDeposit || 0).toLocaleString("en-IN")}` },
                  { label: "Floor Level", value: property.floorLevel },
                  { label: "Direction", value: property.mainDoorDirection },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-none">
                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
                <div className="pt-4 flex flex-wrap gap-2">
                  {property.amenities?.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-[#3B82F6] text-[11px] font-semibold rounded-full border border-blue-100">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Property Documents</h2>
              <Button size="sm" className="bg-primary text-white gap-2 rounded-sm"><Plus size={16} /> Upload New</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Property Tax Receipt 2023-24.pdf", size: "1.2 MB", date: "Oct 12, 2023" },
                { name: "Sale Deed Copy.pdf", size: "4.5 MB", date: "Aug 05, 2023" },
                { name: "Electricity Bill - May.pdf", size: "0.8 MB", date: "May 20, 2024" },
                { name: "Gas Pipeline Agreement.pdf", size: "2.1 MB", date: "Jan 15, 2024" }
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                    <span className="text-[10px] font-semibold uppercase">PDF</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{doc.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{doc.size} • Uploaded on {doc.date}</p>
                  </div>
                  <button className="text-gray-400 hover:text-primary"><Eye size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-8">Maintenance & Repair History</h2>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
              {[
                { type: "Plumbing", desc: "Kitchen tap leakage fixed", date: "Apr 15, 2024", cost: "₹1,200", status: "Completed" },
                { type: "Electrical", desc: "AC Servicing & Gas refill", date: "Mar 10, 2024", cost: "₹2,500", status: "Completed" },
                { type: "Painting", desc: "Living room wall touch-up", date: "Jan 22, 2024", cost: "₹4,000", status: "Completed" },
                { type: "Cleaning", desc: "Deep cleaning before new tenant", date: "Dec 05, 2023", cost: "₹3,500", status: "Completed" }
              ].map((item, i) => (
                <div key={i} className="relative flex items-center justify-between pl-12 group">
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                    <Check size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-blue-50 rounded uppercase tracking-wider">{item.type}</span>
                      <span className="text-xs text-gray-400 font-semibold">{item.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.cost}</p>
                    <p className="text-[11px] text-[#2ECC71] font-semibold">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <PhoneCall size={24} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-800">Need help with maintaining your property?</p>
              <p className="text-[12px] text-gray-500">Our expert team is available 24/7 for all maintenance requests</p>
            </div>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-blue-50 text-sm px-8 h-11 rounded-sm font-semibold shadow-sm transition-all">
            Contact Support
          </Button>
        </div>

      </div>
    </OwnerLayout>
  );
}
