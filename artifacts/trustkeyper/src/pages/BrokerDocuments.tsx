import React from "react";
import { FileText } from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";

export default function BrokerDocuments() {
  return (
    <BrokerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>

      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 mb-3">
          <FileText size={28} />
        </div>
        <p className="text-gray-500 font-medium">No Documents Found</p>
      </div>
    </BrokerLayout>
  );
}
