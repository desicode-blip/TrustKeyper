import React from "react";
import type { Property } from "@/lib/properties";
import { PropertyListingCard } from "@/components/property/PropertyListingCard";

export interface OwnerPropertyCardProps {
  property: Property;
  onClick: () => void;
  className?: string;
}

/** Owner grid card — uses the shared broker-style listing card layout. */
export function OwnerPropertyCard({ property, onClick, className = "" }: OwnerPropertyCardProps) {
  return (
    <PropertyListingCard
      property={property}
      variant="owner"
      onOpen={onClick}
      className={className}
    />
  );
}
