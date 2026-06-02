import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Eye,
  Share2,
  FileText,
  Trash2,
  Wrench,
  Building2,
  IndianRupee,
  Ruler,
  Sofa,
  X,
  ExternalLink,
} from "lucide-react";
import OwnerLayout from "@/components/OwnerLayout";
import { FlowSegmentTabs } from "@/components/FlowSegmentTabs";
import { SharePropertyModal } from "@/components/owner/SharePropertyModal";
import { RaiseComplaintModal } from "@/components/owner/RaiseComplaintModal";
import { getProperties, getPropertyTitle, type Property } from "@/lib/properties";
import {
  formatDocumentSize,
  getPropertyDocuments,
  addPropertyDocumentUpload,
  removePropertyDocumentUpload,
  type PropertyDocument,
} from "@/lib/ownerPropertyDocuments";
import { getPropertyMaintenanceTickets } from "@/lib/ownerPropertyMaintenance";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type TabId = "overview" | "documents" | "maintenance";

const TABS: { value: TabId; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "documents", label: "Documents" },
  { value: "maintenance", label: "Maintenance History" },
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function bhkSummary(property: Property): string {
  const beds = property.bedrooms?.trim();
  const baths = property.bathrooms?.trim();
  if (beds && baths) return `${beds} BHK`;
  return property.unitSize || "—";
}

function DocumentViewerModal({
  doc,
  onClose,
}: {
  doc: PropertyDocument | null;
  onClose: () => void;
}) {
  if (!doc) return null;
  const isPdf =
    doc.fileName.toLowerCase().endsWith(".pdf") ||
    doc.mimeType === "application/pdf" ||
    doc.dataUrl.startsWith("data:application/pdf");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0">
        <p className="text-sm font-medium truncate pr-4">{doc.fileName}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-4 flex items-center justify-center">
        {!doc.dataUrl ? (
          <p className="text-white/80 text-sm text-center">No preview available for this document.</p>
        ) : isPdf ? (
          <iframe
            title={doc.fileName}
            src={doc.dataUrl}
            className="w-full max-w-4xl h-[min(85vh,900px)] bg-white rounded-lg"
          />
        ) : (
          <img
            src={doc.dataUrl}
            alt={doc.fileName}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        )}
      </div>
    </div>
  );
}

export default function OwnerPropertyDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/owner/properties/:id");
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [shareOpen, setShareOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<PropertyDocument | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [tickets, setTickets] = useState(() =>
    params?.id ? getPropertyMaintenanceTickets(params.id) : [],
  );
  const uploadRef = useRef<HTMLInputElement>(null);

  const refreshDocuments = useCallback(() => {
    if (params?.id) setDocuments(getPropertyDocuments(params.id));
  }, [params?.id]);

  const refreshTickets = useCallback(() => {
    if (params?.id) setTickets(getPropertyMaintenanceTickets(params.id));
  }, [params?.id]);

  useEffect(() => {
    if (params?.id) {
      const p = getProperties().find((x) => x.id === params.id);
      if (p) setProperty(p);
      refreshDocuments();
      refreshTickets();
    }
  }, [params?.id, refreshDocuments, refreshTickets]);

  if (!property) {
    return (
      <OwnerLayout>
        <div className="p-8 text-center text-gray-500">Property not found.</div>
      </OwnerLayout>
    );
  }

  const rent = property.monthlyRent
    ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}`
    : "—";
  const areaLabel = property.builtUpArea
    ? `${property.builtUpArea} ${property.builtUpUnits || ""}`.trim()
    : "—";
  const isRented = property.status === "Rented";
  const title = property.nickname || property.address || "Property";
  const location = [property.area, property.city].filter(Boolean).join(", ");

  const handleUpload = async (file: File) => {
    try {
      await addPropertyDocumentUpload(property.id, file);
      refreshDocuments();
      toast({ title: "Document uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const openDocument = (doc: PropertyDocument) => {
    if (!doc.dataUrl && doc.agreementId) {
      setLocation("/owner/agreements");
      toast({
        title: "View agreement",
        description: "Open the agreement from your Agreements list for full details.",
      });
      return;
    }
    if (!doc.dataUrl) {
      toast({ title: "No preview", description: "This document has no file attached yet.", variant: "destructive" });
      return;
    }
    setViewerDoc(doc);
  };

  const images = property.images ?? [];
  const visibleThumbs = images.slice(1, 6);

  const openImageViewer = (list: string[], startIndex: number) => {
    if (!list[startIndex]) return;
    setGalleryImages(list);
    setActiveImageIndex(startIndex);
  };

  const closeImageViewer = () => {
    setActiveImageIndex(null);
    setGalleryImages([]);
  };

  const goToImage = (delta: number) => {
    if (activeImageIndex === null || galleryImages.length === 0) return;
    const next = (activeImageIndex + delta + galleryImages.length) % galleryImages.length;
    setActiveImageIndex(next);
  };

  return (
    <OwnerLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-primary font-semibold text-lg mb-6 hover:underline w-fit"
        >
          <ChevronLeft size={20} /> Back
        </button>

        {/* Hero property card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="relative h-44 sm:h-52 bg-gradient-to-br from-[#E8F4FC] to-[#D4EBE4]">
            {property.images?.[0] ? (
              <>
                <img
                  src={property.images[0]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 size={48} className="text-primary/30" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {!isRented && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                {isRented ? "Occupied" : "Live"}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-[26px] font-semibold text-gray-900 leading-tight mb-1">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                  <MapPin size={14} className="shrink-0" />
                  {location || "—"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { icon: Building2, label: "BHK", value: bhkSummary(property) },
                    { icon: IndianRupee, label: "Price", value: `${rent}/mo` },
                    { icon: Ruler, label: "Area", value: areaLabel },
                    { icon: Sofa, label: "Furnishing", value: property.furnishing || "—" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-[#F5F9FC] border border-[#E8EEF4] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#768EA7] uppercase tracking-wide mb-0.5">
                        <Icon size={12} />
                        {label}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <Button
                  type="button"
                  className="h-11 px-6 gap-2 font-semibold shadow-sm w-full sm:min-w-[180px]"
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 size={16} />
                  Share Property
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-6 gap-2 font-semibold border-gray-300 w-full sm:min-w-[180px]"
                  onClick={() => setLocation(`/owner/properties/add?edit=${property.id}`)}
                >
                  <Edit size={16} />
                  Edit Details
                </Button>
              </div>
            </div>
          </div>

        </div>

        <FlowSegmentTabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as TabId)}
          options={TABS}
          fullWidth
          className="mb-6 bg-transparent border-transparent p-0"
        />

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-3">
              <div className="space-y-3">
                {images.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openImageViewer(images, 0)}
                      className="w-full h-[260px] sm:h-[320px] rounded-xl bg-gray-100 overflow-hidden block"
                    >
                      <img src={images[0]} alt="Main" className="w-full h-full object-cover" />
                    </button>
                    {visibleThumbs.length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {visibleThumbs.map((img, i) => (
                          <button
                            key={img + i}
                            type="button"
                            onClick={() => openImageViewer(images, i + 1)}
                            className="h-16 sm:h-20 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 hover:border-primary/50"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm font-semibold">No photos uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h2>
              <div className="space-y-4">
                {[
                  { label: "Property Type", value: property.propertyType },
                  { label: "BHK / Size", value: `${property.bedrooms} Bed, ${property.bathrooms} Bath` },
                  { label: "Built-up Area", value: areaLabel },
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
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none"
                  >
                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
              {property.amenities && property.amenities.length > 0 && (
                <div className="pt-5 flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a}
                      className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-semibold rounded-full border border-primary/15"
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Rental agreements and files linked to this property.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="gap-2 h-10 shrink-0"
                onClick={() => uploadRef.current?.click()}
              >
                <Plus size={16} /> Upload document
              </Button>
              <input
                ref={uploadRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                  e.target.value = "";
                }}
              />
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-14 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">No documents yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Agreements created for this property and your uploads will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-primary/30 hover:bg-[#F8FBFF] transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => openDocument(doc)}
                      className="flex items-center gap-4 flex-1 min-w-0 text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-primary truncate">
                          {doc.fileName}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {doc.source === "agreement" ? "Rental agreement" : "Uploaded"}
                          {" · "}
                          {formatDocumentSize(doc.fileSize)}
                          {" · "}
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                      <Eye size={18} className="text-gray-400 group-hover:text-primary shrink-0" />
                    </button>
                    {doc.source === "upload" && (
                      <button
                        type="button"
                        onClick={() => {
                          removePropertyDocumentUpload(property.id, doc.id);
                          refreshDocuments();
                          toast({ title: "Document removed" });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {doc.source === "agreement" && !doc.dataUrl && (
                      <button
                        type="button"
                        onClick={() => setLocation("/owner/agreements")}
                        className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-blue-50"
                        aria-label="Open agreements"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Maintenance History</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {tickets.length === 0
                    ? "No maintenance records for this property yet."
                    : `${tickets.length} record${tickets.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="gap-2 h-10 shrink-0"
                onClick={() => setComplaintOpen(true)}
              >
                <Wrench size={16} /> Log Maintenance
              </Button>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-14 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                <Wrench size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">No maintenance history</p>
                <p className="text-xs text-gray-500 mt-1">
                  Log maintenance to record an issue for this property.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-[#FAFCFE]"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-blue-50 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(t.createdAt)}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                      {Array.isArray(t.images) && t.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {t.images.slice(0, 4).map((img, idx) => (
                            <button
                              key={`${t.id}-img-${idx}`}
                              type="button"
                              onClick={() => openImageViewer(t.images, idx)}
                              className="h-12 rounded-md overflow-hidden border border-gray-200"
                            >
                              <img src={img} alt={`Issue ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center ${
                        t.status === "Resolved"
                          ? "bg-green-50 text-green-700"
                          : t.status === "In Progress"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SharePropertyModal property={property} open={shareOpen} onClose={() => setShareOpen(false)} />
      <RaiseComplaintModal
        propertyId={property.id}
        propertyLabel={getPropertyTitle(property)}
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        onSubmitted={refreshTickets}
      />
      <DocumentViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />
      {activeImageIndex !== null && galleryImages[activeImageIndex] && (
        <div className="fixed inset-0 z-[65] bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeImageViewer}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            aria-label="Close viewer"
          >
            <X size={18} />
          </button>
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() => goToImage(-1)}
              className="absolute left-4 sm:left-8 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <img
            src={galleryImages[activeImageIndex]}
            alt={`Property view ${activeImageIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          />
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() => goToImage(1)}
              className="absolute right-4 sm:right-8 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </OwnerLayout>
  );
}
