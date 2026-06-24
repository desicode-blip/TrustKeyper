import React from "react";
import { Building2, Eye, Heart, Phone, KeyRound } from "lucide-react";
import { BrokerFlowButton } from "@/components/broker/BrokerFlowButton";
import { getPropertyTitle, type Property, type PropertyStatus } from "@/lib/properties";
import { timeAgo } from "@/lib/tenants";

function BrokerStatusBadge({ status }: { status: PropertyStatus }) {
  const styles: Record<PropertyStatus, string> = {
    Active: "text-green-600 bg-green-50",
    Draft: "text-gray-500 bg-gray-100",
    Rented: "text-blue-600 bg-blue-50",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${styles[status]}`}>
      {status === "Active" && <span className="text-green-500">✓</span>}
      {status}
    </span>
  );
}

function OwnerStatusBadge({ isRented }: { isRented: boolean }) {
  return (
    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
      {!isRented && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {isRented ? "Occupied" : "Live"}
    </span>
  );
}

export type PropertyListingCardVariant = "broker" | "owner";

export interface PropertyListingCardProps {
  property: Property;
  variant: PropertyListingCardVariant;
  onOpen: () => void;
  onEdit?: () => void;
  onMarkRented?: () => void;
  className?: string;
}

/**
 * Shared property grid card — broker visual design with flow-specific actions.
 */
export function PropertyListingCard({
  property,
  variant,
  onOpen,
  onEdit,
  onMarkRented,
  className = "",
}: PropertyListingCardProps) {
  const type = property.propertyType === "Other"
    ? (property.propertyTypeOther || "Property")
    : property.propertyType;
  const title = getPropertyTitle(property);
  const subtitle = `${property.area}, ${property.city}`;
  const rent = property.monthlyRent
    ? `₹${Number(property.monthlyRent).toLocaleString("en-IN")}/month`
    : "—";
  const deposit = property.securityDeposit
    ? `₹${Number(property.securityDeposit).toLocaleString("en-IN")} deposit`
    : "";
  const area = property.builtUpArea
    ? `${property.builtUpArea} ${property.builtUpUnits}`
    : "";
  const isRented = property.status === "Rented";
  const isOwner = variant === "owner";

  const cardBody = (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="w-full aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden"
      >
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <Building2 size={48} className="text-gray-400" />
        )}
        {isOwner ? <OwnerStatusBadge isRented={isRented} /> : null}
        {property.imageCount > 0 && (
          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
            {property.imageCount} pics
          </span>
        )}
      </button>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 leading-tight truncate" title={title}>{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate" title={subtitle}>{subtitle}</p>
          </div>
          {!isOwner && <BrokerStatusBadge status={property.status} />}
        </div>

        <div>
          <p className="text-base font-semibold text-gray-900">{rent}</p>
          {deposit ? <p className="text-xs text-gray-500 mt-0.5">{deposit}</p> : null}
        </div>

        <p className="text-xs text-gray-500">
          {[area, property.furnishing, `Listed ${timeAgo(property.createdAt)}`]
            .filter(Boolean)
            .join(" • ")}
        </p>

        {variant === "broker" ? (
          <>
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1"><Eye size={12} /> 0</span>
              <span className="flex items-center gap-1"><Heart size={12} /> 0</span>
              <span className="flex items-center gap-1"><Phone size={12} /> 0</span>
            </div>

            <div className="flex flex-col gap-2 pt-2 mt-auto">
              <div className="flex gap-2 w-full min-w-0">
                <BrokerFlowButton
                  type="button"
                  flowVariant="sm-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen();
                  }}
                  className="flex-1 min-w-0 w-full sm:w-full"
                >
                  View Details
                </BrokerFlowButton>
                {onEdit ? (
                  <BrokerFlowButton
                    type="button"
                    flowVariant="sm-ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit();
                    }}
                    className="flex-1 min-w-0 w-full sm:w-full"
                  >
                    Edit
                  </BrokerFlowButton>
                ) : null}
              </div>
              {!isRented && onMarkRented ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMarkRented();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 self-center sm:self-end w-fit border-0 bg-transparent shadow-none px-2 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <KeyRound size={14} className="shrink-0 text-primary" aria-hidden />
                  Mark as Rented
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </>
  );

  if (isOwner) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
        className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer ${className}`}
      >
        {cardBody}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${className}`}>
      {cardBody}
    </div>
  );
}
