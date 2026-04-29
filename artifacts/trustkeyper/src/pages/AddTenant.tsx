import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Link2,
  UserPlus,
  ChevronDown,
  ArrowRight,
  X,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Send,
  Smartphone,
} from "lucide-react";
import BrokerLayout from "@/components/BrokerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { addTenant } from "@/lib/tenants";

type ModalStep = "closed" | "form" | "share";

export default function AddTenant() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Modal flow
  const [modalStep, setModalStep] = useState<ModalStep>("closed");
  const [linkName, setLinkName] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Manual form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"Family" | "Bachelor" | "">("");
  const [food, setFood] = useState<"Veg" | "Non-Veg" | "">("");

  const linkValid = linkName.trim().length > 0 && linkPhone.trim().length === 10;
  const manualValid =
    name.trim().length > 0 && phone.trim().length === 10 && type;

  const openLinkModal = () => {
    setLinkName("");
    setLinkPhone("");
    setGeneratedLink("");
    setCopied(false);
    setModalStep("form");
  };

  const handleGenerateLink = () => {
    if (!linkValid) return;
    const code = Math.random().toString(36).slice(2, 12).toUpperCase();
    const link = `https://app.trustkeyper.in/tenant/onboard/${code}`;
    setGeneratedLink(link);
    addTenant({ name: linkName, phone: `+91${linkPhone}`, invitationSent: true });
    setModalStep("share");
    toast({ description: "Onboarding link generated!" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleManualNext = () => {
    if (!manualValid) return;
    addTenant({
      name,
      phone: `+91${phone}`,
      type: type as "Family" | "Bachelor",
      food: food ? (food as "Veg" | "Non-Veg") : undefined,
    });
    toast({ description: "Tenant added!" });
    setLocation("/broker/tenants");
  };

  const shareTargets = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-emerald-50 text-emerald-600" },
    { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-pink-50 text-pink-600" },
    { id: "telegram", label: "Telegram", icon: Send, color: "bg-sky-50 text-sky-600" },
    { id: "sms", label: "SMS", icon: Smartphone, color: "bg-gray-100 text-gray-700" },
  ];

  return (
    <BrokerLayout>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/broker/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Tenant</h1>

        {/* Generate Link card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
              <Link2 size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Generate link</p>
              <p className="text-sm text-gray-500">
                Send onboarding link to tenant, they'll fill it themselves
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={openLinkModal}
            className="border-primary text-primary hover:bg-primary/5"
          >
            Generate Link
          </Button>
        </div>

        {/* Add Manually section */}
        <div className="flex items-center gap-2 text-primary font-medium mb-4">
          <UserPlus size={16} />
          <span>Add Manually</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tenant-name" className="text-gray-700">
              Tenant Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tenant-name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white py-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant-phone" className="text-gray-700">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 rounded-md border border-input bg-gray-50 text-sm text-gray-700"
              >
                India (+91) <ChevronDown size={14} />
              </button>
              <Input
                id="tenant-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="bg-white py-6 flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">
              Tenant Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {(["Family", "Bachelor"] as const).map((opt) => {
                const isActive = type === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setType(opt)}
                    className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt === "Family" ? "👨‍👩‍👧 Family" : "🧑 Bachelor"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Food Preference</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["Veg", "Non-Veg"] as const).map((opt) => {
                const isActive = food === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFood(opt)}
                    className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt === "Veg" ? "🟢 Veg" : "🔴 Non-Veg"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          onClick={handleManualNext}
          disabled={!manualValid}
          className="w-full mt-6 py-6 text-base bg-primary hover:bg-primary/90"
        >
          Next <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>

      {/* Send Onboarding Link / Share modal */}
      <Dialog
        open={modalStep !== "closed"}
        onOpenChange={(o) => !o && setModalStep("closed")}
      >
        <DialogContent className="sm:max-w-md p-0 [&>button]:hidden">
          {modalStep === "form" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Send Onboarding Link
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter tenant's basic details to generate a personalized link
                  </p>
                </div>
                <button
                  onClick={() => setModalStep("closed")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="modal-name" className="text-gray-700">
                    Tenant Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="modal-name"
                    placeholder="Enter name"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-phone" className="text-gray-700">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 rounded-md border border-input bg-gray-50 text-sm text-gray-700"
                    >
                      +91… <ChevronDown size={14} />
                    </button>
                    <Input
                      id="modal-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={linkPhone}
                      onChange={(e) =>
                        setLinkPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="bg-white flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateLink}
                disabled={!linkValid}
                className="w-full mt-6 bg-primary hover:bg-primary/90"
              >
                <Link2 size={16} className="mr-2" /> Generate Link
              </Button>
            </div>
          )}

          {modalStep === "share" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Share link with {linkName}
                </h2>
                <button
                  onClick={() => setModalStep("closed")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-3">Share this link via</p>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {shareTargets.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${t.color}`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-xs text-gray-700">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <Label className="text-gray-700 text-sm">Page link</Label>
              <div className="flex items-center gap-2 mt-2 mb-6">
                <Input
                  readOnly
                  value={generatedLink}
                  className="bg-gray-50 text-sm flex-1"
                />
                <button
                  onClick={handleCopy}
                  className="w-10 h-10 rounded-md border border-input flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
                </button>
              </div>

              <Button
                onClick={() => {
                  setModalStep("closed");
                  setLocation("/broker/tenants");
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Check size={16} className="mr-2" /> Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </BrokerLayout>
  );
}
