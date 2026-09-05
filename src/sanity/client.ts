import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

/**
 * A client is always constructed so Studio and fetch helpers can import it.
 * Queries are gated with `isSanityConfigured()` so a missing project ID cannot
 * break `next build`.
 */
export const client = createClient({
  projectId: projectId || "unconfigured",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl: "/studio/",
  },
});

export { isSanityConfigured };
