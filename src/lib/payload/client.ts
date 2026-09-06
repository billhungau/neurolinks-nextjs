import configPromise from "@payload-config";
import { getPayload, type Payload } from "payload";

/**
 * A single Payload instance shared by every server render.
 *
 * `DATABASE_URL` is treated as the switch for "is the CMS wired up yet". When
 * it is missing — a local checkout, or a preview build before the database is
 * provisioned — the read helpers fall back to their empty values instead of
 * failing the render, exactly as the previous CMS layer did.
 */
export function isCmsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
}

export async function getPayloadClient(): Promise<Payload> {
  return getPayload({ config: configPromise });
}

/**
 * Runs a Payload read, returning `fallback` when the CMS is not configured or
 * the database is unreachable. Errors are logged once rather than thrown so a
 * database blip cannot take the whole website down.
 */
export async function safeCmsRead<T>(
  label: string,
  read: (payload: Payload) => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isCmsConfigured()) return fallback;
  try {
    const payload = await getPayloadClient();
    return await read(payload);
  } catch (error) {
    console.error(`[insights] ${label} failed`, error);
    return fallback;
  }
}
