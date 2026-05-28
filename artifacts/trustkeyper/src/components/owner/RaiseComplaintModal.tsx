import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addPropertyMaintenanceTicket } from "@/lib/ownerPropertyMaintenance";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Painting",
  "Cleaning",
  "Appliance",
  "Structural",
  "Other",
];

export function RaiseComplaintModal({
  propertyId,
  propertyLabel,
  open,
  onClose,
  onSubmitted,
}: {
  propertyId: string;
  propertyLabel: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing details",
        description: "Add a short title and description for your complaint.",
        variant: "destructive",
      });
      return;
    }
    addPropertyMaintenanceTicket({
      propertyId,
      category,
      title: title.trim(),
      description: description.trim(),
    });
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    toast({ title: "Complaint raised", description: "Your maintenance ticket has been logged." });
    onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          aria-label="Close"
        >
          <X size={16} className="text-gray-600" />
        </button>
        <div className="p-6 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Raise complaint</h3>
          <p className="text-sm text-gray-500 mb-5 line-clamp-2">{propertyLabel}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kitchen tap leakage"
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail…"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button type="button" variant="outline" className="flex-1 h-11" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" className="flex-1 h-11" onClick={submit}>
              Submit complaint
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
