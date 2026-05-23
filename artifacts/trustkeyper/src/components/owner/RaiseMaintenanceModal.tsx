import React, { useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MaintenancePriority } from "@/lib/ownerPropertyMaintenance";

const CATEGORIES = ["Electrical", "Plumbing", "Carpentry", "Painting", "Cleaning", "Other"];

type RaiseMaintenanceModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    title: string;
    description: string;
    priority: MaintenancePriority;
    imageUrl?: string;
  }) => void;
};

export function RaiseMaintenanceModal({ open, onClose, onSubmit }: RaiseMaintenanceModalProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("Normal");
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setCategory(CATEGORIES[0]);
    setTitle("");
    setDescription("");
    setPriority("Normal");
    setImagePreview(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      priority,
      imageUrl: imagePreview,
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="border-b border-gray-100 px-6 pb-4 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Raise a complaint</h3>
          <p className="mt-1 text-sm text-gray-500">This will be saved under this property&apos;s maintenance history.</p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Issue title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC Not Cooling Properly"
              className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Priority</label>
            <div className="flex gap-2">
              {(["Normal", "Urgent"] as MaintenancePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    priority === p
                      ? p === "Urgent"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Photo (optional)</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary/40 hover:bg-gray-50"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full rounded-lg object-cover" />
              ) : (
                <>
                  <Upload size={18} />
                  <span className="text-xs">Upload photo</span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") setImagePreview(reader.result);
                };
                reader.readAsDataURL(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" disabled={!title.trim()} onClick={handleSubmit}>
            Submit complaint
          </Button>
        </div>
      </div>
    </div>
  );
}
