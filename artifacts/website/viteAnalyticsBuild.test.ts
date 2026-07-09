import { execSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const websiteDir = path.resolve(import.meta.dirname);
const distIndex = path.join(websiteDir, "dist", "index.html");
const GTAG_SCRIPT_URL = "googletagmanager.com/gtag/js?id=G-72DKWMCJ1R";

function runWebsiteBuild(env: NodeJS.ProcessEnv): void {
  execSync("pnpm run build", {
    cwd: websiteDir,
    env: { ...process.env, ...env },
    stdio: "pipe",
  });
}

describe("marketing analytics dist output", () => {
  afterEach(() => {
    rmSync(path.join(websiteDir, "dist"), { recursive: true, force: true });
  });

  it("omits Google scripts when VITE_ENABLE_ANALYTICS is unset", () => {
    runWebsiteBuild({ VITE_ENABLE_ANALYTICS: undefined });
    const html = readFileSync(distIndex, "utf8");
    expect(html).not.toContain("GTM-T679X9X7");
    expect(html).not.toContain(GTAG_SCRIPT_URL);
    expect(html).not.toContain("AW-18274047914");
  });

  it("includes the exact gtag.js URL when VITE_ENABLE_ANALYTICS=1", () => {
    runWebsiteBuild({ VITE_ENABLE_ANALYTICS: "1" });
    const html = readFileSync(distIndex, "utf8");
    expect(html).toContain(GTAG_SCRIPT_URL);
    expect(html).not.toContain("googletagmanager.com/gtm/js?id=G-72DKWMCJ1R");
    expect(html).toContain("GTM-T679X9X7");
    expect(html).toContain("G-72DKWMCJ1R");
    expect(html).toContain("AW-18274047914");
    expect(html).toContain("googletagmanager.com/gtm.js");
    expect(html).toContain("Google Tag Manager (noscript)");
  });
});
