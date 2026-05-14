import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import brandLogo from "@assets/Trustkeyper_Logo_1777989635996.png";
import footerLogo from "@assets/Frame_3466296_1777451511864.png";
import footerWave from "@assets/Vector_20_1777451511865.png";
import { Phone, Mail } from "lucide-react";
import { hasBankDetails } from "@/lib/brokerProfile";
import { BROKER_PENDING_FLOWS_EVENT, getPendingFlowItems } from "@/lib/brokerPendingFlows";
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  FileText,
  Settings,
  LogOut,
  Bell,
  Clock,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard, href: "/broker/dashboard" },
  { id: "properties", label: "Properties", icon: Building2, href: "/broker/properties" },
  { id: "tenants", label: "Tenants", icon: Users, href: "/broker/tenants" },
  { id: "deals", label: "Deals", icon: Handshake, href: "/broker/deals" },
  { id: "documents", label: "Documents", icon: FileText, href: "/broker/documents" },
];

const helpItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/broker/settings" },
  { id: "logout", label: "Logout", icon: LogOut, href: "/" },
];

function TrustKeyperLogo() {
  return (
    <img
      src={brandLogo}
      alt="TrustKeyper"
      className="h-8 sm:h-10 w-auto select-none"
      draggable={false}
    />
  );
}

export function getBrokerName(): string {
  if (typeof window === "undefined") return "Rahul Sharma";
  return sessionStorage.getItem("broker_name") || localStorage.getItem("broker_name") || "Rahul Sharma";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface BrokerLayoutProps {
  children: React.ReactNode;
}

export default function BrokerLayout({ children }: BrokerLayoutProps) {
  const [location] = useLocation();
  const brokerName = getBrokerName();
  const initials = getInitials(brokerName);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingFlows, setPendingFlows] = useState(() =>
    typeof window !== "undefined" ? getPendingFlowItems() : [],
  );

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const sync = () => setPendingFlows(getPendingFlowItems());
    sync();
    window.addEventListener(BROKER_PENDING_FLOWS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BROKER_PENDING_FLOWS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <header className="h-14 sm:h-[90px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/broker/dashboard" className="block">
            <TrustKeyperLogo />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full border border-gray-200 text-sm text-gray-600">
            <Clock size={14} />
            <span>IST</span>
          </div>
          <Link href="/broker/activity" className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            <Bell size={17} />
            {pendingFlows.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" aria-hidden />
            )}
          </Link>
          <Link href="/broker/settings" className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            <Settings size={17} />
            {!hasBankDetails() && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border border-white" title="Complete your payment details" />
            )}
          </Link>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Mobile sidebar backdrop ─────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/40"
            onClick={closeSidebar}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-auto
            w-64 bg-white border-r border-gray-200 px-4 py-6
            flex flex-col shrink-0 overflow-y-auto
            transition-transform duration-200 ease-in-out
            md:translate-x-0
            ${sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          `}
        >
          {/* Close button — mobile only */}
          <button
            onClick={closeSidebar}
            className="md:hidden absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>

          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Broker's Portal
            </p>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">{brokerName}</span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Help
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-4 py-4 sm:px-8 sm:py-8 pb-20 md:pb-8 min-w-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center justify-around px-2 h-14 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
                active ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#0D1A48] text-white relative overflow-hidden hidden md:block">
        <img
          src={footerWave}
          alt=""
          aria-hidden
          className="absolute left-0 bottom-0 w-[55%] max-w-[720px] opacity-30 pointer-events-none select-none"
        />
        <div className="relative px-6 sm:px-12 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8">
          <div className="md:col-span-3 flex md:items-end">
            <img src={footerLogo} alt="TrustKeyper" className="h-10 sm:h-14 w-auto" />
          </div>
          <div className="md:col-span-3 space-y-3 text-sm text-white/70">
            <a href="#" className="block hover:text-white">Terms & Conditions</a>
            <a href="#" className="block hover:text-white">About Us</a>
            <a href="#" className="block hover:text-white">FAQs</a>
            <a href="#" className="block hover:text-white">Privacy Policy</a>
          </div>
          <div className="md:col-span-3 text-sm text-white/70 space-y-5">
            <div>
              <p className="font-semibold text-white mb-2">Noida</p>
              <p className="leading-relaxed">Office 8, 1st Floor, Block-Mart, Mahagun Moderne, Plot GH-02, Sector 78, Noida, UP, India, 201301</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Bengaluru</p>
              <p className="leading-relaxed">HD-198, Embassy TechVillage, Outer Ring Road, Bellandur, Bengaluru, Karnataka, India, 560103</p>
            </div>
          </div>
          <div className="md:col-span-3 text-sm text-white/70 space-y-5">
            <div>
              <p className="font-semibold text-white mb-3">Contact :</p>
              <p className="flex items-center gap-2 mb-2"><Phone size={14} /> <span>+91 8088516875</span></p>
              <p className="flex items-center gap-2"><Mail size={14} /> <a href="mailto:info@trustkeyper.com" className="underline hover:text-white">info@trustkeyper.com</a></p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Head office :</p>
              <p className="leading-relaxed">HD-198, Embassy TechVillage, Outer Ring Road, Bellandur, Bengaluru, Karnataka, India, 560103</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
