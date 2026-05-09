import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { MapPin, ChevronLeft, PhoneCall, Edit } from "lucide-react";
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
        <button onClick={() => setLocation("/owner/dashboard")} className="flex items-center gap-2 text-primary font-medium text-lg mb-6 hover:underline">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{property.nickname || property.address}</h1>
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
                <p className="text-sm text-gray-500 font-medium mb-0.5">Expected Rent</p>
                <p className="text-3xl font-bold text-green-600">{rent}<span className="text-lg font-medium text-green-600">/mo</span></p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images block */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.images && property.images.length > 0 ? (
                  <>
                    <div className="col-span-2 sm:col-span-3 h-48 md:h-64 rounded bg-gray-100 overflow-hidden relative">
                      <img src={property.images[0]} alt="Main" className="w-full h-full object-cover" />
                    </div>
                    {property.images.slice(1).map((img, i) => (
                      <div key={i} className="aspect-video sm:aspect-square rounded bg-gray-100 overflow-hidden relative">
                        <img src={img} alt={`Thumb ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded">
                    <p>No photos uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details block */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Property Details</h2>
                <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  Edit <Edit size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="text-sm font-medium text-gray-900">{property.propertyType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">BHK</span>
                  <span className="text-sm font-medium text-gray-900">{property.bedrooms} Bed, {property.bathrooms} Bath</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Area</span>
                  <span className="text-sm font-medium text-gray-900">{property.builtUpArea} {property.builtUpUnits}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Furnishing</span>
                  <span className="text-sm font-medium text-gray-900">{property.furnishing}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Expected Rent</span>
                  <span className="text-sm font-medium text-gray-900">{rent}/mo</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Security Deposit</span>
                  <span className="text-sm font-medium text-gray-900">₹{Number(property.securityDeposit || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Amenities</span>
                  <span className="text-sm font-medium text-gray-900 max-w-[200px] text-right truncate" title={property.amenities?.join(", ")}>
                    {property.amenities?.length ? property.amenities.join(", ") : "None specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-md border border-gray-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <PhoneCall size={18} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-800">Need help with maintaining your property?</p>
              <p className="text-[11px] text-gray-500">Our Manager will help you out</p>
            </div>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-blue-50 text-xs px-6 h-8 rounded-sm">
            I'm interested
          </Button>
        </div>

      </div>
    </OwnerLayout>
  );
}
