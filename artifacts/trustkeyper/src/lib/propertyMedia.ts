export const MAX_PROPERTY_IMAGES = 5;

/** Deduplicate and cap property image data URLs. */
export function normalizePropertyImages(images: string[]): {
  images: string[];
  imageCount: number;
} {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const url of images) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
    if (normalized.length >= MAX_PROPERTY_IMAGES) break;
  }
  return { images: normalized, imageCount: normalized.length };
}

export function propertyImagesEqual(a: string[], b: string[]): boolean {
  const left = normalizePropertyImages(a).images;
  const right = normalizePropertyImages(b).images;
  if (left.length !== right.length) return false;
  return left.every((url, index) => url === right[index]);
}

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      resolve(typeof dataUrl === "string" ? dataUrl : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export interface AppendPropertyImagesResult {
  images: string[];
  imageCount: number;
  addedCount: number;
  failedCount: number;
  skippedDuplicateCount: number;
}

/** Read image files and merge into an existing property image list. */
export async function appendPropertyImagesFromFiles(
  files: FileList | File[],
  existing: string[],
): Promise<AppendPropertyImagesResult> {
  const normalizedExisting = normalizePropertyImages(existing);
  const remaining = MAX_PROPERTY_IMAGES - normalizedExisting.images.length;
  const candidates = Array.from(files).slice(0, Math.max(remaining, 0));

  if (candidates.length === 0) {
    return {
      images: normalizedExisting.images,
      imageCount: normalizedExisting.imageCount,
      addedCount: 0,
      failedCount: 0,
      skippedDuplicateCount: 0,
    };
  }

  const readResults = await Promise.all(candidates.map((file) => readFileAsDataUrl(file)));
  const existingSet = new Set(normalizedExisting.images);
  let addedCount = 0;
  let failedCount = 0;
  let skippedDuplicateCount = 0;
  const merged = [...normalizedExisting.images];

  for (const dataUrl of readResults) {
    if (!dataUrl) {
      failedCount += 1;
      continue;
    }
    if (existingSet.has(dataUrl)) {
      skippedDuplicateCount += 1;
      continue;
    }
    if (merged.length >= MAX_PROPERTY_IMAGES) break;
    existingSet.add(dataUrl);
    merged.push(dataUrl);
    addedCount += 1;
  }

  const normalized = normalizePropertyImages(merged);
  return {
    images: normalized.images,
    imageCount: normalized.imageCount,
    addedCount,
    failedCount,
    skippedDuplicateCount,
  };
}
