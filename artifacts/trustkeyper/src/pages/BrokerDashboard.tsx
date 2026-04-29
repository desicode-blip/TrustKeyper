import React from "react";
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
  Plus,
  UserPlus,
  FilePlus2,
  ArrowRight,
  Check,
} from "lucide-react";

const navItems = [
  { id: "dashboards", label: "Dashboards", icon: LayoutDashboard, active: true },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "deals", label: "Deals", icon: Handshake },
  { id: "commission", label: "Commission", icon: IndianRupee },
  { id: "documents", label: "Documents", icon: FileText },
];

const helpItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "My Profile", icon: UserCircle2 },
  { id: "logout", label: "Logout", icon: LogOut },
];

function TrustKeyperLogo({ light = false }: { light?: boolean }) {
  return (
    <div className={`font-extrabold leading-none tracking-tight text-2xl ${light ? "text-white" : "text-primary"}`}>
      <div>TRUST</div>
      <div>KEYPER</div>
    </div>
  );
}

export default function BrokerDashboard() {
  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex flex-col">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
        <TrustKeyperLogo />
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
              RS
            </div>
            <span className="text-sm font-medium text-gray-900">Rahul Sharma</span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-50 text-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
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
                <button
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          {/* Welcome row */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h1 className="text-2xl font-bold text-primary">
              Welcome, Rahul Sharma{" "}
              <span className="inline-block">👋</span>
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                <Plus size={16} /> Generate Rent Agreement
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5">
                <Plus size={16} /> Add Property
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5">
                <UserPlus size={16} /> Add Tenant
              </button>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
                <FilePlus2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Generate Rental Agreement
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Generate rental agreements, collect documents, and complete
                digital signing, all in one place with TrustKeyper.
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                Continue <ArrowRight size={14} />
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
                <Plus size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Add Your First Property
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                List and manage your property details to start renting
                seamlessly through TrustKeyper.
              </p>
              <button className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline">
                <Plus size={14} /> Add Property
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-6">
                <UserPlus size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Add Potential Tenants
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Add tenant details, send invitations, and manage the rental
                process digitally through TrustKeyper.
              </p>
              <button className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline">
                <UserPlus size={14} /> Add Tenant
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 w-12">22:40</span>
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                <Check size={16} />
              </div>
              <span className="text-sm text-gray-900">
                Your Profile has been created
              </span>
            </div>
            <button className="w-full text-center text-sm text-accent font-medium pt-4 hover:underline">
              View All Activity
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F1B3D] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,160 C240,80 480,240 720,160 C960,80 1200,240 1440,160 L1440,320 L0,320 Z"
              fill="#fff"
            />
            <path
              d="M0,220 C240,140 480,300 720,220 C960,140 1200,300 1440,220 L1440,320 L0,320 Z"
              fill="#fff"
              opacity="0.5"
            />
          </svg>
        </div>
        <div className="relative px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <TrustKeyperLogo light />
          </div>
          <div className="space-y-2 text-sm">
            <a href="#" className="block hover:underline">Terms & Conditions</a>
            <a href="#" className="block hover:underline">About Us</a>
            <a href="#" className="block hover:underline">FAQs</a>
            <a href="#" className="block hover:underline">Privacy Policy</a>
          </div>
          <div className="text-sm text-white/80">
            <p className="font-semibold text-white mb-2">Noida</p>
            <p>
              Office 8, 1st Floor, Block-Mart, Mahagun Moderne, Plot GH-02,
              Sector 78, Noida, UP, India, 201301
            </p>
          </div>
          <div className="text-sm text-white/80">
            <p className="font-semibold text-white mb-2">Bengaluru</p>
            <p>
              HD-198, Embassy TechVillage, Outer Ring Road, Bellandur,
              Bengaluru, Karnataka, India, 560103
            </p>
          </div>
          <div className="text-sm text-white/80">
            <p className="font-semibold text-white mb-2">Contact :</p>
            <p>📞 +91 8088516875</p>
            <p>
              ✉️{" "}
              <a href="mailto:info@trustkeyper.com" className="underline">
                info@trustkeyper.com
              </a>
            </p>
            <p className="font-semibold text-white mt-4 mb-1">Head office :</p>
            <p>
              HD-198, Embassy TechVillage, Outer Ring Road, Bellandur,
              Bengaluru, Karnataka, India, 560103
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
