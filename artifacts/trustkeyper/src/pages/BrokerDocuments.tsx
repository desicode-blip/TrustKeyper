import React from "react";
import { FileText, Eye, Pencil, Download, Clock } from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { getAgreements, type Agreement, type AgreementStatus } from "@/lib/agreements";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: AgreementStatus }) {
  if (status === "Sent") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
        <Clock size={11} />
        Review Pending
      </span>
    );
  }
  if (status === "Signed") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full whitespace-nowrap">
        Signed
      </span>
    );
  }
  if (status === "Expired") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">
        Expired
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap">
      Draft
    </span>
  );
}

function DocumentRow({ agreement }: { agreement: Agreement }) {
  const isNew = Date.now() - agreement.createdAt < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <FileText size={17} className="text-primary" />
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Rental Agreement – {agreement.propertyTitle}
          </p>
          {isNew && (
            <span className="text-[10px] font-bold text-primary bg-blue-50 border border-primary/20 px-1.5 py-0.5 rounded">
              NEW
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Agreement · {formatDate(agreement.createdAt)}
        </p>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={agreement.status} />
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="View">
          <Eye size={15} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Edit">
          <Pencil size={15} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Download">
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}

export default function BrokerDocuments() {
  const agreements = getAgreements();

  return (
    <BrokerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>

      {agreements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-300 mb-3">
            <FileText size={28} />
          </div>
          <p className="text-gray-500 font-medium">No Documents Found</p>
          <p className="text-xs text-gray-400 mt-1">Agreements sent for e-signing will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {agreements.map((agr) => (
            <DocumentRow key={agr.id} agreement={agr} />
          ))}
        </div>
      )}
    </BrokerLayout>
  );
}
