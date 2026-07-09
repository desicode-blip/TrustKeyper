import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { injectMarketingAnalytics, isMarketingAnalyticsEnabled } from "./viteAnalyticsPlugin";

const PLUGIN_SOURCE = readFileSync(path.resolve(import.meta.dirname, "viteAnalyticsPlugin.ts"), "utf8");

const GTAG_HEAD_SCRIPT_MATCH = PLUGIN_SOURCE.match(
  /const GTAG_HEAD_SCRIPT = `([\s\S]*?)`;/,
)?.[1];

const BASE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TrustKeyper</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const HTML_WITH_ATTRIBUTES = `<!DOCTYPE html>
<html lang="en">
  <head class="x">
    <title>TrustKeyper</title>
  </head>
  <body id="app">
    <div id="root"></div>
  </body>
</html>`;

describe("GTAG_HEAD_SCRIPT on disk", () => {
  it("uses googletagmanager.com/gtag/js, not gtm/js", () => {
    expect(GTAG_HEAD_SCRIPT_MATCH).toBeDefined();
    expect(GTAG_HEAD_SCRIPT_MATCH).toContain(
      "https://www.googletagmanager.com/gtag/js?id=G-72DKWMCJ1R",
    );
    expect(GTAG_HEAD_SCRIPT_MATCH).not.toContain("googletagmanager.com/gtm/js?id=G-72DKWMCJ1R");
  });
});

describe("snippet identifiers", () => {
  it("contains required Google IDs and script URLs character-for-character", () => {
    expect(PLUGIN_SOURCE).toContain("googletagmanager.com/gtag/js?id=G-72DKWMCJ1R");
    expect(PLUGIN_SOURCE).toContain("googletagmanager.com/gtm.js?id=");
    expect(PLUGIN_SOURCE).toContain("googletagmanager.com/ns.html?id=GTM-T679X9X7");
    expect(PLUGIN_SOURCE).toContain("GTM-T679X9X7");
    expect(PLUGIN_SOURCE).toContain("G-72DKWMCJ1R");
    expect(PLUGIN_SOURCE).toContain("AW-18274047914");
    expect(PLUGIN_SOURCE).not.toContain("googletagmanager.com/gtm/js?id=G-72DKWMCJ1R");
  });
});

describe("isMarketingAnalyticsEnabled", () => {
  it("is disabled unless VITE_ENABLE_ANALYTICS is exactly 1", () => {
    expect(isMarketingAnalyticsEnabled({})).toBe(false);
    expect(isMarketingAnalyticsEnabled({ VITE_ENABLE_ANALYTICS: "0" })).toBe(false);
    expect(isMarketingAnalyticsEnabled({ VITE_ENABLE_ANALYTICS: "1" })).toBe(true);
  });
});

describe("injectMarketingAnalytics", () => {
  it("injects all four Google blocks into head and body", () => {
    const html = injectMarketingAnalytics(BASE_HTML);

    expect(html).toContain("googletagmanager.com/gtag/js?id=G-72DKWMCJ1R");
    expect(html).toContain("googletagmanager.com/gtm.js?id=");
    expect(html).not.toContain("googletagmanager.com/gtm/js?id=G-72DKWMCJ1R");
    expect(html.indexOf("<!-- Google Tag Manager -->")).toBeLessThan(html.indexOf("</head>"));
    expect(html.indexOf("<!-- Google tag (gtag.js) -->")).toBeLessThan(html.indexOf("</head>"));
    expect(html.indexOf("<!-- Google Tag Manager (noscript) -->")).toBeGreaterThan(
      html.indexOf("<body>"),
    );
  });

  it("matches head and body tags with attributes", () => {
    const html = injectMarketingAnalytics(HTML_WITH_ATTRIBUTES);
    expect(html).toContain('<head class="x">');
    expect(html).toContain("googletagmanager.com/gtag/js?id=G-72DKWMCJ1R");
    expect(html).toContain('<body id="app">');
    expect(html).toContain("Google Tag Manager (noscript)");
  });

  it("throws when head is missing", () => {
    expect(() => injectMarketingAnalytics("<html></html>")).toThrow(/<head> not found/);
  });

  it("throws when body is missing", () => {
    expect(() => injectMarketingAnalytics("<html><head></head></html>")).toThrow(/<body> not found/);
  });
});
