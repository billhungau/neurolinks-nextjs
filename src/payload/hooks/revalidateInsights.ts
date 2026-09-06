import { revalidatePath, revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";
import { INSIGHTS_CACHE_TAG, INSIGHTS_PATH, insightsArticlePath } from "../../lib/insights";

/**
 * Publishing or editing in Payload has to show up on the public site without a
 * new deployment. Dropping the shared tag rebuilds the cached queries; the
 * path calls refresh the prerendered Insights routes that embed them.
 */
function revalidateInsightsSection(slugs: string[] = []) {
  revalidateTag(INSIGHTS_CACHE_TAG, "max");
  revalidatePath(INSIGHTS_PATH);
  revalidatePath("/sitemap.xml");
  revalidatePath("/veterans/");
  for (const slug of slugs) {
    if (slug) revalidatePath(insightsArticlePath(slug));
  }
}

export const revalidateInsight: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  if (context?.disableRevalidate) return doc;
  const slugs = [doc?.slug, previousDoc?.slug].filter(
    (slug): slug is string => typeof slug === "string",
  );
  revalidateInsightsSection([...new Set(slugs)]);
  return doc;
};

export const revalidateInsightAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (context?.disableRevalidate) return doc;
  revalidateInsightsSection(typeof doc?.slug === "string" ? [doc.slug] : []);
  return doc;
};

/** Categories, authors and references all change how articles render. */
export const revalidateSupportingContent: CollectionAfterChangeHook = ({
  doc,
  req: { context },
}) => {
  if (context?.disableRevalidate) return doc;
  revalidateTag(INSIGHTS_CACHE_TAG, "max");
  revalidatePath(INSIGHTS_PATH);
  return doc;
};

export const revalidateInsightsSettings: GlobalAfterChangeHook = ({
  doc,
  req: { context },
}) => {
  if (context?.disableRevalidate) return doc;
  revalidateTag(INSIGHTS_CACHE_TAG, "max");
  revalidatePath(INSIGHTS_PATH);
  return doc;
};
