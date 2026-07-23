import type { BrokerProfile } from "@workspace/api-schemas";
import type { Href } from "expo-router";

/**
 * After session is confirmed, route from GET /api/v1/broker/profile.
 * No row or incomplete onboarding → corresponding onboarding step.
 * onboardingCompletedAt set → tabs.
 */
export function routeFromBrokerProfile(profile: BrokerProfile | null): Href {
  if (profile?.onboardingCompletedAt) {
    return "/(tabs)/home";
  }

  const completed = profile?.stepCompleted ?? 0;
  if (completed >= 4) {
    return "/(onboarding)/step-4";
  }
  const nextStep = Math.min(completed + 1, 4);
  if (nextStep === 1) return "/(onboarding)/step-1";
  if (nextStep === 2) return "/(onboarding)/step-2";
  if (nextStep === 3) return "/(onboarding)/step-3";
  return "/(onboarding)/step-4";
}
