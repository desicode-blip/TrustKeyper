import { describe, expect, it, vi } from "vitest";
import {
  buildMarketingAuthRedirectUrl,
  decodeMarketingSessionHash,
  DEFAULT_MARKETING_SITE_URL,
  getMarketingSiteUrl,
  resolveMarketingSiteUrl,
} from "./marketingHandoff";

describe("marketingHandoff", () => {
  it("returns null configured url when marketing env is unset", () => {
    expect(getMarketingSiteUrl()).toBeNull();
    expect(resolveMarketingSiteUrl()).toBe(DEFAULT_MARKETING_SITE_URL);
    expect(buildMarketingAuthRedirectUrl("login")).toBe(`${DEFAULT_MARKETING_SITE_URL}#login`);
    expect(buildMarketingAuthRedirectUrl("signup")).toBe(`${DEFAULT_MARKETING_SITE_URL}#signup`);
  });

  it("decodes session tokens from the marketing handoff hash", () => {
    const payload = btoa(JSON.stringify({ access_token: "abc", refresh_token: "def" }));
    const hash = `#tk_session=${encodeURIComponent(payload)}`;
    expect(decodeMarketingSessionHash(hash)).toEqual({
      access_token: "abc",
      refresh_token: "def",
    });
  });
});

describe("marketingHandoff with VITE_MARKETING_URL", () => {
  it("builds login and signup redirect urls from env", () => {
    vi.stubEnv("VITE_MARKETING_URL", "https://staging.trustkeyper.com");
    expect(getMarketingSiteUrl()).toBe("https://staging.trustkeyper.com");
    expect(resolveMarketingSiteUrl()).toBe("https://staging.trustkeyper.com");
    expect(buildMarketingAuthRedirectUrl("login")).toBe("https://staging.trustkeyper.com#login");
    expect(buildMarketingAuthRedirectUrl("signup")).toBe("https://staging.trustkeyper.com#signup");
    vi.unstubAllEnvs();
  });
});
