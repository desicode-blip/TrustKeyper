import { logout } from "./auth";
import { clearActiveSessionBackup } from "./initAppStorage";

/**
 * Call when entering login/signup so a restored backup session cannot
 * expose dashboards via browser back navigation.
 */
export function resetSessionForAuthEntry(): void {
  logout();
  clearActiveSessionBackup();
}
