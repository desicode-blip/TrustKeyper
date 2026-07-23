import { describe, expect, it } from "vitest";
import {
  BrokerOnboardingStep1Schema,
  BrokerOnboardingStep4Schema,
  BrokerProfilePatchSchema,
} from "./brokerProfileSchemas.js";
import { mapBrokerRowToProfile } from "./brokerProfileHandler.js";

describe("BrokerProfilePatchSchema", () => {
  it("requires step 1 fields when stepCompleted is 1", () => {
    const result = BrokerProfilePatchSchema.safeParse({
      stepCompleted: 1,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid step 1 payload", () => {
    const result = BrokerOnboardingStep1Schema.safeParse({
      name: "Riya",
      age: 32,
      firmName: null,
      employmentType: "self_employed",
      stepCompleted: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid step 4 payload", () => {
    const result = BrokerOnboardingStep4Schema.safeParse({
      region: "Bengaluru",
      pincodes: ["560001"],
      stepCompleted: 4,
    });
    expect(result.success).toBe(true);
  });
});

describe("mapBrokerRowToProfile", () => {
  it("maps snake_case row to camelCase API shape", () => {
    const profile = mapBrokerRowToProfile({
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "22222222-2222-4222-8222-222222222222",
      name: "Riya",
      age: 32,
      firm_name: null,
      employment_type: "self_employed",
      business_since_year: 2018,
      properties_handled: 40,
      deals_with: ["owners"],
      deals_with_other: null,
      property_types: ["apartment"],
      property_types_other: null,
      region: "Bengaluru",
      pincodes: ["560001"],
      step_completed: 4,
      onboarding_completed_at: new Date("2026-07-23T10:00:00.000Z"),
      created_at: new Date("2026-07-23T09:00:00.000Z"),
      updated_at: new Date("2026-07-23T10:00:00.000Z"),
    });

    expect(profile.userId).toBe("22222222-2222-4222-8222-222222222222");
    expect(profile.firmName).toBeNull();
    expect(profile.stepCompleted).toBe(4);
    expect(profile.onboardingCompletedAt).toBe("2026-07-23T10:00:00.000Z");
    expect(profile.pincodes).toEqual(["560001"]);
  });
});
