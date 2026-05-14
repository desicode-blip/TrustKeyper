import { dashboardRouteFor, getActiveSession, getOtherAccounts, switchRole, type Role } from "@/lib/auth";
import { useLocation } from "wouter";

export function AccountSwitcher() {
  const [, setLocation] = useLocation();
  const session = getActiveSession();

  if (!session) return null;

  const others = getOtherAccounts(session.phone, session.role);

  if (others.length === 0) return null;

  const handleSwitch = (newRole: Role) => {
    switchRole(newRole);
    setLocation(dashboardRouteFor(newRole));
  };

  return (
    <div className="account-switcher flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      <span className="text-gray-500">Switch Account:</span>
      {others.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => handleSwitch(r)}
          className="switch-btn text-primary font-medium hover:underline"
        >
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}
