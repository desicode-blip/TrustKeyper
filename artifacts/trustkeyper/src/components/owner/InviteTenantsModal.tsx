import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Calendar, Send, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { OwnerFlowButton } from "@/components/owner/OwnerFlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/lib/properties";
import {
  formatMemberContact,
  getPropertyInviteLabel,
  sendOwnerTenantInvites,
} from "@/lib/ownerTenants";

type Step = "count" | "members" | "confirm";

interface MemberSlot {
  name: string;
  contact: string;
}

function emptySlot(): MemberSlot {
  return { name: "", contact: "" };
}

function parseRent(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function formatRentInput(value: string): string {
  const n = parseRent(value);
  if (!n) return "";
  return `₹ ${Number(n).toLocaleString("en-IN")}`;
}

export interface InviteTenantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onSuccess: () => void;
}

export function InviteTenantsModal({
  open,
  onOpenChange,
  properties,
  onSuccess,
}: InviteTenantsModalProps) {
  const [step, setStep] = useState<Step>("count");
  const [propertyId, setPropertyId] = useState("");
  const [tenantCount, setTenantCount] = useState(1);
  const [slots, setSlots] = useState<MemberSlot[]>([emptySlot()]);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(false);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [startDate, setStartDate] = useState("");

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === propertyId),
    [properties, propertyId],
  );

  useEffect(() => {
    if (!open) return;
    setStep("count");
    const first = properties[0];
    setPropertyId(first?.id ?? "");
    setTenantCount(1);
    setSlots([emptySlot()]);
    if (first) {
      setMonthlyRent(formatRentInput(first.monthlyRent || ""));
      setMaintenanceIncluded(!!first.maintenanceIncluded);
      setMonthlyMaintenance(formatRentInput(first.monthlyMaintenance || ""));
      setSecurityDeposit(formatRentInput(first.securityDeposit || ""));
    } else {
      setMonthlyRent("");
      setMaintenanceIncluded(false);
      setMonthlyMaintenance("");
      setSecurityDeposit("");
    }
    setStartDate("");
  }, [open, properties]);

  useEffect(() => {
    if (!selectedProperty) return;
    setMonthlyRent(formatRentInput(selectedProperty.monthlyRent || ""));
    setMaintenanceIncluded(!!selectedProperty.maintenanceIncluded);
    setMonthlyMaintenance(formatRentInput(selectedProperty.monthlyMaintenance || ""));
    setSecurityDeposit(formatRentInput(selectedProperty.securityDeposit || ""));
  }, [propertyId, selectedProperty?.id]);

  useEffect(() => {
    setSlots((prev) => {
      const next = [...prev];
      while (next.length < tenantCount) next.push(emptySlot());
      while (next.length > tenantCount) next.pop();
      return next;
    });
  }, [tenantCount]);

  const propertyLabel = selectedProperty
    ? getPropertyInviteLabel(selectedProperty)
    : "";

  const canContinueCount = !!propertyId && tenantCount >= 1;

  const canContinueMembers = slots.every(
    (slot) => slot.name.trim().length > 0 && slot.contact.replace(/\D/g, "").length === 10,
  );

  const canSendInvite =
    !!propertyId &&
    parseRent(monthlyRent).length > 0 &&
    parseRent(securityDeposit).length > 0 &&
    !!startDate &&
    (maintenanceIncluded || parseRent(monthlyMaintenance).length > 0);

  const modalTitle =
    step === "count"
      ? null
      : step === "members"
        ? "Add members to your property"
        : "Confirm rental details for your property";

  const handleClose = (next: boolean) => {
    if (!next) onOpenChange(false);
  };

  const handleSendInvite = () => {
    if (!selectedProperty || !canSendInvite) return;

    const members = slots.map((slot) => {
      const digits = slot.contact.replace(/\D/g, "").slice(-10);
      return {
        name: slot.name.trim(),
        phone: formatMemberContact(digits),
      };
    });

    sendOwnerTenantInvites({
      propertyId: selectedProperty.id,
      propertyLabel,
      members,
      monthlyRent: parseRent(monthlyRent),
      maintenanceIncluded,
      monthlyMaintenance: parseRent(monthlyMaintenance),
      securityDeposit: parseRent(securityDeposit),
      startDate,
    });

    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 gap-0">
        {modalTitle ? (
          <h2 className="text-center text-lg font-semibold text-gray-900 mb-6 pr-8">
            {modalTitle}
          </h2>
        ) : null}

        <PropertyField
          properties={properties}
          propertyId={propertyId}
          onPropertyIdChange={setPropertyId}
        />

        {step === "count" && (
          <div className="mt-6">
            <p className="text-center text-sm font-medium text-gray-700 mb-4">
              Choose total number of tenants
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTenantCount(n)}
                  className={`aspect-square rounded-md border text-sm font-semibold transition-colors ${
                    tenantCount === n
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <OwnerFlowButton
                type="button"
                disabled={!canContinueCount || properties.length === 0}
                className="sm:min-w-[160px]"
                onClick={() => setStep("members")}
              >
                Continue <ArrowRight size={16} />
              </OwnerFlowButton>
            </div>
          </div>
        )}

        {step === "members" && (
          <div className="mt-4 space-y-4">
            {slots.map((slot, index) => (
              <TenantMemberBlock
                key={index}
                index={index}
                slot={slot}
                onChange={(next) =>
                  setSlots((prev) => {
                    const copy = [...prev];
                    copy[index] = next;
                    return copy;
                  })
                }
              />
            ))}
            <div className="flex justify-center pt-4">
              <OwnerFlowButton
                type="button"
                disabled={!canContinueMembers}
                className="sm:min-w-[160px]"
                onClick={() => setStep("confirm")}
              >
                Continue <ArrowRight size={16} />
              </OwnerFlowButton>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">
                Monthly Rent<span className="text-red-500">*</span>
              </Label>
              <Input
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(formatRentInput(e.target.value))}
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="maint-included"
                checked={maintenanceIncluded}
                onCheckedChange={(checked) => {
                  const on = checked === true;
                  setMaintenanceIncluded(on);
                  if (on) setMonthlyMaintenance("");
                }}
              />
              <label htmlFor="maint-included" className="text-sm text-gray-700 cursor-pointer">
                Maintenance included
              </label>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">
                Monthly Maintenance Amount
                {!maintenanceIncluded ? <span className="text-red-500">*</span> : null}
              </Label>
              <Input
                value={monthlyMaintenance}
                onChange={(e) => setMonthlyMaintenance(formatRentInput(e.target.value))}
                className={`h-10 ${maintenanceIncluded ? "opacity-40 bg-gray-50" : ""}`}
                disabled={maintenanceIncluded}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">
                Security Deposit<span className="text-red-500">*</span>
              </Label>
              <Input
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(formatRentInput(e.target.value))}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">
                Start Date<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 pr-10"
                />
                <Calendar
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <OwnerFlowButton
                type="button"
                disabled={!canSendInvite}
                className="sm:min-w-[160px]"
                onClick={handleSendInvite}
              >
                <Send size={16} />
                Send Invite
              </OwnerFlowButton>
            </div>
          </div>
        )}

        {properties.length === 0 && (
          <p className="text-sm text-amber-700 text-center mt-4">
            Add a property before inviting tenants.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PropertyField({
  properties,
  propertyId,
  onPropertyIdChange,
}: {
  properties: Property[];
  propertyId: string;
  onPropertyIdChange: (id: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-500 mb-1.5 block">Property name</Label>
      <Select value={propertyId} onValueChange={onPropertyIdChange} disabled={properties.length === 0}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Select property" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {getPropertyInviteLabel(p)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TenantMemberBlock({
  index,
  slot,
  onChange,
}: {
  index: number;
  slot: MemberSlot;
  onChange: (slot: MemberSlot) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/40">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center shrink-0">
          <User size={16} />
        </div>
        <span className="text-sm font-semibold text-gray-900">Tenant {index + 1}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">
            Tenant name<span className="text-red-500">*</span>
          </Label>
          <Input
            value={slot.name}
            onChange={(e) => onChange({ ...slot, name: e.target.value })}
            className="h-10 bg-white"
            placeholder="Full name"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">
            Phone Number<span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 shrink-0">+91</span>
            <Input
              type="tel"
              inputMode="numeric"
              value={slot.contact}
              onChange={(e) =>
                onChange({
                  ...slot,
                  contact: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="h-10 bg-white flex-1"
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>
          {slot.contact.length > 0 && slot.contact.length < 10 ? (
            <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit mobile number.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
