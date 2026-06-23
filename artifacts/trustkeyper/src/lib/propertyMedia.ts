export const MAX_PROPERTY_IMAGES = 5;
export const MAX_PROPERTY_IMAGE_DIMENSION = 1280;
export const PROPERTY_IMAGE_JPEG_QUALITY = 0.82;
/** Keep each stored image under ~500 KB so five photos fit in localStorage. */
export const MAX_PROPERTY_IMAGE_DATA_URL_LENGTH = 520_000;

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

export function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return dataUrl.length;
  const base64 = dataUrl.slice(comma + 1);
  return Math.ceil((base64.length * 3) / 4);
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

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function canvasToJpegDataUrl(canvas: HTMLCanvasElement): Promise<string | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          resolve(typeof dataUrl === "string" ? dataUrl : null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      PROPERTY_IMAGE_JPEG_QUALITY,
    );
  });
}

async function resizeDataUrlToJpeg(dataUrl: string): Promise<string | null> {
  if (typeof document === "undefined") return null;

  try {
    const img = await loadImageElement(dataUrl);
    const longestEdge = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = Math.min(1, MAX_PROPERTY_IMAGE_DIMENSION / longestEdge);
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return canvasToJpegDataUrl(canvas);
  } catch {
    return null;
  }
}

/** Shrink an image data URL before persisting to localStorage. */
export async function compressDataUrlForStorage(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) return dataUrl;
  if (dataUrl.length <= MAX_PROPERTY_IMAGE_DATA_URL_LENGTH) return dataUrl;

  const compressed = await resizeDataUrlToJpeg(dataUrl);
  if (!compressed) return dataUrl;
  if (compressed.length < dataUrl.length) return compressed;
  return dataUrl;
}

async function compressImageFileToDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;

  const raw = await readFileAsDataUrl(file);
  if (!raw) return null;
  if (typeof document === "undefined") return raw;

  const compressed = await resizeDataUrlToJpeg(raw);
  return compressed ?? raw;
}

/** Compress all images before saving a property record. */
export async function preparePropertyImagesForStorage(images: string[]): Promise<{
  images: string[];
  imageCount: number;
}> {
  const normalized = normalizePropertyImages(images);
  if (normalized.images.length === 0) return normalized;

  const prepared = await Promise.all(
    normalized.images.map((url) => compressDataUrlForStorage(url)),
  );
  return normalizePropertyImages(prepared);
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

  const readResults = await Promise.all(candidates.map((file) => compressImageFileToDataUrl(file)));
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
