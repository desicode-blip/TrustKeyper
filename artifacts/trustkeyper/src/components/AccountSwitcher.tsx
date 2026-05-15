import { useEffect, useState } from "react";
import { Briefcase, Check, Home, IndianRupee, User, Users } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  dashboardRouteFor,
  getAccountsForPhoneAsync,
  getActiveSession,
  getProfileDisplayName,
  roleDisplayLabel,
  switchRoleAsync,
  type Role,
} from "@/lib/auth";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function roleIcon(role: Role) {
  switch (role) {
    case "owner":
      return User;
    case "broker":
      return IndianRupee;
    case "tenant":
      return Home;
    case "manager":
      return Briefcase;
    default:
      return Users;
  }
}

interface AccountSwitcherProps {
  /** Called after switching (e.g. close mobile sidebar). */
  onAfterSwitch?: () => void;
  className?: string;
}

export function AccountSwitcher({ onAfterSwitch, className }: AccountSwitcherProps) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const session = getActiveSession();
  const [accounts, setAccounts] = useState<Role[]>([]);

  useEffect(() => {
    if (!session) {
      setAccounts([]);
      return;
    }
    void getAccountsForPhoneAsync(session.phone).then(setAccounts);
  }, [session?.phone, session?.role]);

  if (!session || accounts.length <= 1) return null;

  const handleSwitch = async (role: Role) => {
    if (role === session.role) {
      setOpen(false);
      return;
    }
    await switchRoleAsync(role);
    setOpen(false);
    onAfterSwitch?.();
    setLocation(dashboardRouteFor(role));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full text-left"
        }
      >
        <Users size={18} className="text-gray-500 shrink-0" />
        Switch account
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)]">
          <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-center text-lg font-semibold text-gray-900 pr-8">
              Account switch
            </DialogTitle>
          </DialogHeader>

          <ul className="py-2 max-h-[min(60vh,360px)] overflow-y-auto">
            {accounts.map((role) => {
              const name = getProfileDisplayName(session.phone, role);
              const active = role === session.role;
              const RoleIcon = roleIcon(role);
              return (
                <li key={role}>
                  <button
                    type="button"
                    onClick={() => handleSwitch(role)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 ${
                      active ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold">{initialsFromName(name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <RoleIcon size={12} className="shrink-0" />
                        {roleDisplayLabel(role)}
                      </p>
                    </div>
                    {active ? (
                      <Check size={20} className="text-primary shrink-0" strokeWidth={2.5} />
                    ) : (
                      <span className="w-5 shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
