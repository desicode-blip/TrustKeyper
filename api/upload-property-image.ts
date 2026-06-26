import { put } from "@vercel/blob";
import { assertSyncAccountAuth } from "./_lib/syncAuth.js";

const MAX_BYTES = 2 * 1024 * 1024;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fieldValue(value: string | File | null): string {
  if (typeof value === "string") return value;
  return "";
}

/** Accepts a property image upload and stores it in Vercel Blob. */
export async function POST(request: Request): Promise<Response> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse(400, { error: "Invalid form data" });
  }

  const phone = fieldValue(formData.get("phone"));
  if (!phone) {
    return jsonResponse(400, { error: "Phone is required" });
  }

  const auth = await assertSyncAccountAuth(request.headers.get("authorization") ?? undefined, phone);
  if (!auth.ok) {
    return jsonResponse(auth.status, { error: auth.error });
  }

  const imageEntry = formData.get("image");
  if (!(imageEntry instanceof Blob) || imageEntry.size === 0) {
    return jsonResponse(400, { error: "Image file is required" });
  }

  if (imageEntry.size > MAX_BYTES) {
    return jsonResponse(400, { error: "Image too large — max 2MB" });
  }

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
  const random = Math.random().toString(36).slice(2, 10);
  const pathname = `property-images/${normalizedPhone}/${Date.now()}-${random}.jpg`;

  try {
    const buffer = Buffer.from(await imageEntry.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return jsonResponse(400, { error: "Image too large — max 2MB" });
    }

    const result = await put(pathname, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    return jsonResponse(200, { url: result.url });
  } catch {
    return jsonResponse(502, { error: "Image upload failed" });
  }
}
