import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { TrustKeyperLogo } from "@/components/brand";
import { TrustKeyperFooter } from "@/components/TrustKeyperFooter";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getBrokerProfile } from "@/lib/brokerProfile";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { logout } from "@/lib/auth";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Ticket,
  FileText,
  FileSignature,
  Settings,
  LogOut,
  Bell,
  Clock,
  Menu,
  X,
  History,
  AlertTriangle,
  Check,
} from "lucide-react";

const navItems = [
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard, href: "/owner/dashboard" },
  { id: "properties", label: "Properties", icon: Building2, href: "/owner/properties" },
  { id: "tenants", label: "Tenants", icon: Users, href: "/owner/tenants" },
  { id: "finances", label: "Rent Management", icon: CreditCard, href: "/owner/finances" },
  { id: "tickets", label: "Tickets", icon: Ticket, href: "/owner/tickets" },
  { id: "agreement", label: "Agreement", icon: FileSignature, href: "/owner/agreements" },
];

const helpItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/owner/settings" },
  { id: "profile", label: "My Profile", icon: Users, href: "/owner/profile" },
  { id: "logout", label: "Logout", icon: LogOut, href: "/" },
];

function HeaderLogo() {
  return <TrustKeyperLogo variant="brand" size="header" />;
}

export function getOwnerName(): string {
  if (typeof window === "undefined") return "Meena!";
  const n = getBrokerProfile().name;
  return n || "Meena!";
}

function getInitials(name: string): string {
  const parts = name.replace("!", "").trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const [location, setLocation] = useLocation();
  const ownerName = getOwnerName();
  const initials = getInitials(ownerName);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

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
          <Link href="/owner/dashboard" className="block">
            <HeaderLogo />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full border border-gray-200 text-sm text-gray-600">
            <Clock size={14} />
            <span>IST</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 focus:outline-none transition-all hover:border-gray-200 shadow-sm">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EB5757] text-[10px] font-semibold text-white flex items-center justify-center border-2 border-white">3</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[360px] p-0 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between p-5 bg-[#F8FAFC] border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                <button className="text-xs text-primary font-semibold hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <div className="p-5 border-b border-gray-50 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100 text-[#27AE60]">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-[14px] mb-0.5 group-hover:text-primary transition-colors">Rent Received</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium">Rent for Prestige Lakeside Unit 1204 has been received successfully.</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-semibold flex items-center gap-1.5"><Clock size={10} /> 2 hours ago</p>
                  </div>
                </div>
                <div className="p-5 border-b border-gray-50 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer bg-blue-50/20 group relative">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-[#EB5757]">
                    <Ticket size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-[14px] mb-0.5 group-hover:text-primary transition-colors">New Ticket Created</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium">Tenant reported an issue with the plumbing in Unit 305.</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-semibold flex items-center gap-1.5"><Clock size={10} /> 4 hours ago</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                </div>
                <div className="p-5 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100 text-[#F2994A]">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-[14px] mb-0.5 group-hover:text-primary transition-colors">Inspection Alert</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium">Minor leak detected in Prestige Heights Unit 1107.</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-semibold flex items-center gap-1.5"><Clock size={10} /> 5 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 text-center bg-white">
                <button className="text-[13px] font-semibold text-primary hover:underline">View All Notifications</button>
              </div>
            </PopoverContent>
          </Popover>
          <Link href="/owner/profile" className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-800">
            <Users size={17} />
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
            <p className="text-[13px] text-gray-400 tracking-wide border-b border-gray-100 pb-2">
              Menu
            </p>
          </div>

          <nav className="flex flex-col gap-1 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} className={active ? "text-primary" : "text-gray-500"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 mb-3">
            <p className="text-[13px] text-gray-400 tracking-wide border-b border-gray-100 pb-2">
              Help
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            <AccountSwitcher onAfterSwitch={closeSidebar} />
            {helpItems.map((item) => {
              const Icon = item.icon;
              if (item.id === "logout") {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      logout();
                      closeSidebar();
                      setLocation("/");
                    }}
                    className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full text-left"
                  >
                    <Icon size={18} className="text-gray-500" />
                    {item.label}
                  </button>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Icon size={18} className="text-gray-500" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <TrustKeyperFooter className="hidden md:block" />
    </div>
  );
}
