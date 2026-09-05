export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** True when a real Sanity project can be queried. Placeholder IDs are not used. */
export function isSanityConfigured() {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
  const currentDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || dataset;
  return Boolean(id && currentDataset && /^[a-z0-9]+$/i.test(id));
}
