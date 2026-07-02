import { describe, expect, it } from "vitest";
import { resolveApiBase } from "@/lib/apiBase";

describe("resolveApiBase", () => {
  it("defaults to same-origin /api when VITE_API_URL is unset", () => {
    const original = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = "";
    expect(resolveApiBase()).toBe("/api");
    import.meta.env.VITE_API_URL = original;
  });

  it("appends /api when host is provided without it", () => {
    const original = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = "http://localhost:8080";
    expect(resolveApiBase()).toBe("http://localhost:8080/api");
    import.meta.env.VITE_API_URL = original;
  });

  it("keeps /api when already present", () => {
    const original = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = "http://localhost:8080/api";
    expect(resolveApiBase()).toBe("http://localhost:8080/api");
    import.meta.env.VITE_API_URL = original;
  });
});
