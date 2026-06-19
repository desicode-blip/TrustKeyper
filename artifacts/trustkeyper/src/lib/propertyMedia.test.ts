import { describe, it, expect } from "vitest";
import {
  appendPropertyImagesFromFiles,
  normalizePropertyImages,
  propertyImagesEqual,
} from "./propertyMedia";

describe("normalizePropertyImages", () => {
  it("deduplicates and caps images", () => {
    const urls = ["a", "b", "a", "c", "d", "e", "f"];
    const result = normalizePropertyImages(urls);
    expect(result.images).toEqual(["a", "b", "c", "d", "e"]);
    expect(result.imageCount).toBe(5);
  });
});

describe("propertyImagesEqual", () => {
  it("treats duplicate entries as equal", () => {
    expect(propertyImagesEqual(["a", "b"], ["a", "a", "b"])).toBe(true);
  });
});

describe("appendPropertyImagesFromFiles", () => {
  it("skips non-image files", async () => {
    const textFile = new File(["hello"], "notes.txt", { type: "text/plain" });
    const result = await appendPropertyImagesFromFiles([textFile], ["existing"]);
    expect(result.images).toEqual(["existing"]);
    expect(result.failedCount).toBe(1);
  });
});
