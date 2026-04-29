import React from "react";
import { useLocation } from "wouter";
import {
  Plus,
  UserPlus,
  FilePlus2,
  ArrowRight,
  Check,
} from "lucide-react";
import BrokerLayout, { getBrokerName } from "@/components/BrokerLayout";

export default function BrokerDashboard() {
  const brokerName = getBrokerName();
  const [, setLocation] = useLocation();
  const goAddTenant = () => setLocation("/broker/tenants/add");

  return (
    <BrokerLayout>
      {/* Welcome row */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="text-2xl font-bold text-primary">
          Welcome, {brokerName}{" "}
          <span className="inline-block">👋</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
            <Plus size={16} /> Generate Rent Agreement
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5">
            <Plus size={16} /> Add Property
          </button>
          <button
            onClick={goAddTenant}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5"
          >
            <UserPlus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
            <FilePlus2 size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Generate Rental Agreement
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Generate rental agreements, collect documents, and complete
            digital signing, all in one place with TrustKeyper.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
            Continue <ArrowRight size={14} />
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
            <Plus size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Add Your First Property
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            List and manage your property details to start renting
            seamlessly through TrustKeyper.
          </p>
          <button className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline">
            <Plus size={14} /> Add Property
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
            <UserPlus size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Add Potential Tenants
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Add tenant details, send invitations, and manage the rental
            process digitally through TrustKeyper.
          </p>
          <button
            onClick={goAddTenant}
            className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline"
          >
            <UserPlus size={14} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Recent Activity
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500 w-12">22:40</span>
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
            <Check size={16} />
          </div>
          <span className="text-sm text-gray-900">
            Your Profile has been created
          </span>
        </div>
        <button className="w-full text-center text-sm text-accent font-medium pt-4 hover:underline">
          View All Activity
        </button>
      </div>
    </BrokerLayout>
  );
}
