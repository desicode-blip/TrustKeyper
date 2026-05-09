import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import brandLogo from "@assets/Trustkeyper_Logo_1777989635996.png";
import footerLogo from "@assets/Frame_3466296_1777451511864.png";
import footerWave from "@assets/Vector_20_1777451511865.png";
import { Phone, Mail } from "lucide-react";
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
  CheckCircle2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navItems = [
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard, href: "/owner/dashboard" },
  { id: "properties", label: "Properties", icon: Building2, href: "/owner/properties" },
  { id: "tenants", label: "Tenants", icon: Users, href: "/owner/tenants" },
  { id: "finances", label: "Finances & Expenses", icon: CreditCard, href: "/owner/finances" },
  { id: "tickets", label: "Tickets", icon: Ticket, href: "/owner/tickets" },
  { id: "report", label: "Report", icon: FileText, href: "/owner/reports" },
  { id: "agreement", label: "Agreement", icon: FileSignature, href: "/owner/agreements" },
  { id: "subscription", label: "Subscription History", icon: History, href: "/owner/subscriptions" },
];

const helpItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/owner/settings" },
  { id: "profile", label: "My Profile", icon: Users, href: "/owner/profile" },
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

export function getOwnerName(): string {
  if (typeof window === "undefined") return "Meena!";
  return sessionStorage.getItem("owner_name") || "Meena!";
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
  const [location] = useLocation();
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
            <TrustKeyperLogo />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full border border-gray-200 text-sm text-gray-600">
            <Clock size={14} />
            <span>IST</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 focus:outline-none">
                <Bell size={17} />
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">3</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button className="text-xs text-primary font-medium hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rent Received</p>
                      <p className="text-xs text-gray-500 mt-0.5">₹28,000 received for Prestige Lakeside Unit 1204</p>
                      <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Ticket size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Ticket Created</p>
                      <p className="text-xs text-gray-500 mt-0.5">AC Not cooling in Unit 1806</p>
                      <p className="text-[10px] text-gray-400 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rent Reminder Sent</p>
                      <p className="text-xs text-gray-500 mt-0.5">Automated reminder sent to Ravi Kumar</p>
                      <p className="text-[10px] text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center rounded-b-xl">
                <Link href="/owner/dashboard" className="text-xs font-semibold text-primary hover:underline">View all notifications</Link>
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
            {helpItems.map((item) => {
              const Icon = item.icon;
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#182335] text-white relative overflow-hidden hidden md:block">
        <img
          src={footerWave}
          alt=""
          aria-hidden
          className="absolute left-0 bottom-0 w-[55%] max-w-[720px] opacity-10 pointer-events-none select-none"
        />
        <div className="relative px-6 sm:px-12 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8">
          <div className="md:col-span-3 flex md:items-start pt-2">
            <img src={footerLogo} alt="TrustKeyper" className="h-10 sm:h-12 w-auto" />
          </div>
          <div className="md:col-span-3 space-y-3 text-[13px] text-white/60">
            <a href="#" className="block hover:text-white">Terms & Conditions</a>
            <a href="#" className="block hover:text-white">About Us</a>
            <a href="#" className="block hover:text-white">FAQs</a>
            <a href="#" className="block hover:text-white">Privacy Policy</a>
          </div>
          <div className="md:col-span-3 text-[13px] text-white/60 space-y-5">
            <div>
              <p className="font-semibold text-white mb-2">Noida</p>
              <p className="leading-relaxed">Office 8, 1st Floor, Block: Mart, Mahagun Moderne, Plot GH-02, Sector 78, Noida, UP, India, 201301</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Bengaluru</p>
              <p className="leading-relaxed">HD-198, Embassy TechVillage, Outer Ring Road ,Bellandur, Bengaluru, Karnataka, India, 560103</p>
            </div>
          </div>
          <div className="md:col-span-3 text-[13px] text-white/60 space-y-5">
            <div>
              <p className="font-semibold text-white mb-3">Contact :</p>
              <p className="flex items-center gap-2 mb-2"><Phone size={14} /> <span>+91 8088516875</span></p>
              <p className="flex items-center gap-2"><Mail size={14} /> <a href="mailto:info@trustkeyper.com" className="underline hover:text-white">info@trustkeyper.com</a></p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Head office :</p>
              <p className="leading-relaxed">HD-198, Embassy TechVillage, Outer Ring Road ,Bellandur, Bengaluru, Karnataka, India, 560103</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
