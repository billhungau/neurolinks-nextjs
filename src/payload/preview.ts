import { createHmac, timingSafeEqual } from "node:crypto";

export const PREVIEW_ENABLE_PATH = "/api/insights-preview";
export const PREVIEW_DISABLE_PATH = "/api/insights-preview/exit";

/**
 * Preview links are signed with PAYLOAD_SECRET so a guessed URL cannot turn
 * on draft mode. The signature is not the only gate: the preview route also
 * requires a valid Payload session, so a leaked link is still useless to an
 * anonymous visitor.
 */
export function previewToken(slug: string): string {
  const secret = process.env.PAYLOAD_SECRET || "";
  return createHmac("sha256", secret).update(`insights:${slug}`).digest("hex");
}

export function isValidPreviewToken(slug: string, token: string | null): boolean {
  if (!token) return false;
  const expected = previewToken(slug);
  const provided = Buffer.from(token);
  const wanted = Buffer.from(expected);
  if (provided.length !== wanted.length) return false;
  return timingSafeEqual(provided, wanted);
}

export function previewPath(slug: string): string {
  const params = new URLSearchParams({ slug, token: previewToken(slug) });
  return `${PREVIEW_ENABLE_PATH}?${params.toString()}`;
}

/** Payload calls this for the Preview button and the live-preview iframe. */
export function previewUrl(doc: unknown): string {
  const slug = (doc as { slug?: string } | null)?.slug;
  if (!slug) return "/insights/";
  return previewPath(slug);
}
