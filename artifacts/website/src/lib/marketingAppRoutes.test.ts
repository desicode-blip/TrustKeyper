import { describe, expect, it } from "vitest";
import {
  buildMarketingExistingAccountUrl,
  buildMarketingNewUserSignupUrl,
  buildMarketingSignupUrl,
} from "./marketingAppRoutes";

describe("marketingAppRoutes", () => {
  it("builds dashboard handoff urls for existing accounts", () => {
    const url = new URL(
      buildMarketingExistingAccountUrl({
        phone: "6369856040",
        role: "owner",
        rememberMe: true,
      }),
    );
    expect(url.pathname).toBe("/owner/dashboard");
    expect(url.searchParams.get("phone")).toBe("6369856040");
    expect(url.searchParams.get("role")).toBe("owner");
    expect(url.searchParams.get("remember")).toBe("1");
  });

  it("builds signup handoff urls for new roles", () => {
    const url = new URL(
      buildMarketingSignupUrl({
        phone: "6369856040",
        role: "broker",
        rememberMe: false,
      }),
    );
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("signup")).toBe("1");
    expect(url.searchParams.get("role")).toBe("broker");
  });

  it("builds new-user signup urls without a preset role", () => {
    const url = new URL(buildMarketingNewUserSignupUrl("6369856040", true));
    expect(url.searchParams.get("signup")).toBe("1");
    expect(url.searchParams.get("role")).toBeNull();
    expect(url.searchParams.get("remember")).toBe("1");
  });
});
