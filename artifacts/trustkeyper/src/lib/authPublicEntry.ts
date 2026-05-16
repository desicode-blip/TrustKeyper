import { clearActiveSessionBackup } from "./initAppStorage";

/**
 * Call when entering login/signup so a restored backup session cannot
 * expose dashboards via browser back navigation. Preserves tk_pending_role
 * so login still knows which role the user chose on signup.
 */
export function resetSessionForAuthEntry(): void {
  sessionStorage.removeItem("tk_active_phone");
  sessionStorage.removeItem("tk_active_role");
  clearActiveSessionBackup();
}
