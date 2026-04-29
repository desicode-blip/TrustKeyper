import React from "react";
import { Link, useLocation } from "wouter";
import footerLogo from "@assets/Frame_3466296_1777451511864.png";
import footerWave from "@assets/Vector_20_1777451511865.png";
import { Phone, Mail } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  IndianRupee,
  FileText,
  Settings,
  UserCircle2,
  LogOut,
  Bell,
  Clock,
} from "lucide-react";

const navItems = [
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard, href: "/broker/dashboard" },
  { id: "properties", label: "Properties", icon: Building2, href: "/broker/properties" },
  { id: "tenants", label: "Tenants", icon: Users, href: "/broker/tenants" },
  { id: "deals", label: "Deals", icon: Handshake, href: "/broker/deals" },
  { id: "commission", label: "Commission", icon: IndianRupee, href: "/broker/commission" },
  { id: "documents", label: "Documents", icon: FileText, href: "/broker/documents" },
];

const helpItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/broker/settings" },
  { id: "profile", label: "My Profile", icon: UserCircle2, href: "/broker/profile" },
  { id: "logout", label: "Logout", icon: LogOut, href: "/" },
];

function TrustKeyperLogo({ light = false }: { light?: boolean }) {
  return (
    <div className={`font-extrabold leading-none tracking-tight text-2xl ${light ? "text-white" : "text-primary"}`}>
      <div>TRUST</div>
      <div>KEYPER</div>
    </div>
  );
}

export function getBrokerName(): string {
  if (typeof window === "undefined") return "Rahul Sharma";
  return sessionStorage.getItem("broker_name") || "Rahul Sharma";
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

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
        <Link href="/broker/dashboard" className="block">
          <TrustKeyperLogo />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600">
            <Clock size={14} />
            <span>IST</span>
          </div>
          <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            <UserCircle2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 px-4 py-6 flex flex-col shrink-0">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1A2438] text-white relative overflow-hidden">
        {/* Decorative wave */}
        <img
          src={footerWave}
          alt=""
          aria-hidden
          className="absolute left-0 bottom-0 w-[55%] max-w-[720px] opacity-30 pointer-events-none select-none"
        />

        <div className="relative px-12 py-12 grid grid-cols-12 gap-8">
          {/* Logo column */}
          <div className="col-span-12 md:col-span-3 flex md:items-end">
            <img
              src={footerLogo}
              alt="TrustKeyper"
              className="h-14 w-auto mt-6 md:mt-0"
            />
          </div>

          {/* Links column */}
          <div className="col-span-12 md:col-span-3 space-y-3 text-sm text-white/70">
            <a href="#" className="block hover:text-white">Terms & Conditions</a>
            <a href="#" className="block hover:text-white">About Us</a>
            <a href="#" className="block hover:text-white">FAQs</a>
            <a href="#" className="block hover:text-white">Privacy Policy</a>
          </div>

          {/* Offices column */}
          <div className="col-span-12 md:col-span-3 text-sm text-white/70 space-y-5">
            <div>
              <p className="font-semibold text-white mb-2">Noida</p>
              <p className="leading-relaxed">
                Office 8, 1st Floor, Block-Mart, Mahagun Moderne, Plot GH-02,
                Sector 78, Noida, UP, India, 201301
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Bengaluru</p>
              <p className="leading-relaxed">
                HD-198, Embassy TechVillage, Outer Ring Road, Bellandur,
                Bengaluru, Karnataka, India, 560103
              </p>
            </div>
          </div>

          {/* Contact column */}
          <div className="col-span-12 md:col-span-3 text-sm text-white/70 space-y-5">
            <div>
              <p className="font-semibold text-white mb-3">Contact :</p>
              <p className="flex items-center gap-2 mb-2">
                <Phone size={14} className="text-white/70" />
                <span>+91 8088516875</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-white/70" />
                <a
                  href="mailto:info@trustkeyper.com"
                  className="underline hover:text-white"
                >
                  info@trustkeyper.com
                </a>
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Head office :</p>
              <p className="leading-relaxed">
                HD-198, Embassy TechVillage, Outer Ring Road, Bellandur,
                Bengaluru, Karnataka, India, 560103
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
