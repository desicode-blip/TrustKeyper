import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import {
  MapPin,
  ChevronLeft,
  Edit,
  Share2,
  Upload,
  Eye,
  FileText,
  Plus,
} from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { PropertyImageGallery } from "@/components/owner/PropertyImageGallery";
import { MaintenanceTicketCard } from "@/components/owner/MaintenanceTicketCard";
import { RaiseMaintenanceModal } from "@/components/owner/RaiseMaintenanceModal";
import { getProperties, type Property } from "@/lib/properties";
import {
  addUploadedDocument,
  formatDocSize,
  listPropertyDocuments,
  removeUploadedDocument,
  type PropertyDocumentListItem,
} from "@/lib/ownerPropertyDocuments";
import {
  addMaintenanceTicket,
  getMaintenanceTicketsForProperty,
  type PropertyMaintenanceTicket,
} from "@/lib/ownerPropertyMaintenance";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "maintenance", label: "Maintenance History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OwnerPropertyDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/owner/properties/:id");
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedImage, setSelectedImage] = useState(0);
  const [documents, setDocuments] = useState<PropertyDocumentListItem[]>([]);
  const [tickets, setTickets] = useState<PropertyMaintenanceTicket[]>([]);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const propertyId = params?.id ?? "";

  const reloadProperty = useCallback(() => {
    if (!propertyId) return;
    const p = getProperties().find((x) => x.id === propertyId);
    if (p) setProperty(p);
  }, [propertyId]);

  const reloadDocuments = useCallback(() => {
    if (!propertyId) return;
    setDocuments(listPropertyDocuments(propertyId));
  }, [propertyId]);

  const reloadTickets = useCallback(() => {
    if (!propertyId) return;
    setTickets(getMaintenanceTicketsForProperty(propertyId));
  }, [propertyId]);

  useEffect(() => {
    reloadProperty();
    reloadDocuments();
    reloadTickets();
  }, [reloadProperty, reloadDocuments, reloadTickets]);

  if (!property) {
    return (
      <OwnerLayout>
        <div className="p-8 text-center text-gray-500">Property not found.</div>
      </OwnerLayout>
    );
  }

  const rent = property.monthlyRent
    ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}`
    : "N/A";
  const title = property.nickname || property.address;
  const thumbForTickets = property.images?.[0];

  const handleShare = async () => {
    const url = `${window.location.origin}/owner/properties/${property.id}`;
    const shareTitle = title;
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: `View ${shareTitle} on TrustKeyper`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Property link copied to clipboard." });
      }
    } catch {
      /* user cancelled share */
    }
  };

  const handleEditDetails = () => {
    setActiveTab("overview");
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleUploadDocument = (file: File) => {
    addUploadedDocument(property.id, file, () => {
      reloadDocuments();
      toast({ title: "Document uploaded", description: file.name });
    });
  };

  const openDocument = (doc: PropertyDocumentListItem) => {
    if (doc.dataUrl) {
      window.open(doc.dataUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (doc.kind === "agreement") {
      setLocation("/owner/agreements");
      return;
    }
    toast({ title: "Preview unavailable", description: "No file preview for this document." });
  };

  return (
    <OwnerLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-6 flex w-fit items-center gap-2 text-lg font-semibold text-primary hover:underline"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <PropertyImageGallery
              images={property.images ?? []}
              selectedIndex={selectedImage}
              onSelect={setSelectedImage}
            />
          </div>

          <div className="border-t border-gray-100 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0" />
                  {property.area}, {property.city}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                    {property.status !== "Rented" && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    )}
                    {property.status === "Rented" ? "Occupied" : "Live"}
                  </span>
                  <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                    {property.bedrooms} Bed • {property.bathrooms} Bath • {property.propertyType}
                  </span>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-sm font-semibold text-gray-500">Expected Rent</p>
                <p className="text-3xl font-semibold text-green-600">
                  {rent}
                  <span className="text-lg font-semibold">/mo</span>
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                className="h-11 flex-1 gap-2 rounded-xl font-semibold shadow-md shadow-primary/20 sm:flex-none sm:px-8"
                onClick={() => void handleShare()}
              >
                <Share2 size={16} /> Share Property
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 rounded-xl border-gray-300 font-semibold sm:flex-none sm:px-8"
                onClick={handleEditDetails}
              >
                <Edit size={16} /> Edit Details
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-gray-100 px-4 sm:px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <div ref={detailsRef} className="animate-in fade-in rounded-xl border border-gray-200 bg-white p-6 shadow-sm duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
              <button
                type="button"
                onClick={() => setLocation(`/owner/properties/add`)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
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
                {
                  label: "Security Deposit",
                  value: `₹${Number(property.securityDeposit || 0).toLocaleString("en-IN")}`,
                },
                { label: "Floor Level", value: property.floorLevel },
                { label: "Direction", value: property.mainDoorDirection },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-none"
                >
                  <span className="text-sm font-medium text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value || "—"}</span>
                </div>
              ))}
              {property.amenities && property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="animate-in fade-in rounded-xl border border-gray-200 bg-white p-6 shadow-sm duration-300 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Property Documents</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your uploads and rental agreements for this property only.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="gap-2 rounded-xl font-semibold"
                onClick={() => uploadRef.current?.click()}
              >
                <Upload size={16} /> Upload documents
              </Button>
              <input
                ref={uploadRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadDocument(f);
                  e.target.value = "";
                }}
              />
            </div>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
                <FileText size={32} className="mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No documents yet</p>
                <p className="mt-1 max-w-sm text-xs text-gray-400">
                  Upload property papers here. Agreements generated for this property will appear automatically.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => uploadRef.current?.click()}
                >
                  <Plus size={16} /> Upload documents
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
                        doc.kind === "agreement"
                          ? "border-blue-100 bg-blue-50 text-blue-600"
                          : "border-red-100 bg-red-50 text-red-500"
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase">
                        {doc.kind === "agreement" ? "AGR" : "PDF"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary">
                        {doc.fileName}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500">
                        {doc.kind === "agreement" ? "From agreement" : "Owner upload"}
                        {doc.kind === "upload" && doc.fileSize
                          ? ` • ${formatDocSize(doc.fileSize)}`
                          : ""}
                        {" • "}
                        {new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openDocument(doc)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-primary"
                        aria-label="View"
                      >
                        <Eye size={18} />
                      </button>
                      {doc.kind === "upload" && (
                        <button
                          type="button"
                          onClick={() => {
                            removeUploadedDocument(doc.id);
                            reloadDocuments();
                            toast({ title: "Document removed" });
                          }}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Maintenance History</h2>
                <p className="mt-1 text-sm text-gray-500">
                  All maintenance complaints raised for this property.
                </p>
              </div>
              <Button
                type="button"
                className="h-10 gap-2 rounded-xl font-semibold"
                onClick={() => setRaiseOpen(true)}
              >
                <Plus size={16} /> Raise complaint
              </Button>
            </div>

            {tickets.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-600">No maintenance complaints yet</p>
                <p className="mt-1 text-xs text-gray-400">Raise a complaint to track issues for this property.</p>
                <Button
                  type="button"
                  className="mt-4 gap-2"
                  onClick={() => setRaiseOpen(true)}
                >
                  <Plus size={16} /> Raise complaint
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <MaintenanceTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    thumbnailUrl={ticket.imageUrl ?? thumbForTickets}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <RaiseMaintenanceModal
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        onSubmit={(data) => {
          addMaintenanceTicket({
            propertyId: property.id,
            category: data.category,
            title: data.title,
            description: data.description,
            priority: data.priority,
            imageUrl: data.imageUrl,
          });
          reloadTickets();
          toast({ title: "Complaint raised", description: "Added to maintenance history." });
        }}
      />
    </OwnerLayout>
  );
}
