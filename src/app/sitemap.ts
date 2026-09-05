import type { MetadataRoute } from "next";
import { SITEMAP_ROUTES } from "@/content/manifest";
import { insightsArticlePath } from "@/lib/insights";
import { isSearchIndexable, productionUrl } from "@/lib/site";
import { getIndexableArticleSlugs, shouldExposeInsightsPublicly } from "@/sanity/fetch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSearchIndexable()) return [];
  const routes: MetadataRoute.Sitemap = SITEMAP_ROUTES.map((route) => ({
    url: productionUrl(route),
    changeFrequency: "monthly" as const,
    priority: route === "/" ? 1 : 0.7,
  }));

  if (await shouldExposeInsightsPublicly()) {
    routes.push({
      url: productionUrl("/insights/"),
      changeFrequency: "weekly",
      priority: 0.6,
    });
    const slugs = await getIndexableArticleSlugs();
    for (const slug of slugs) {
      routes.push({
        url: productionUrl(insightsArticlePath(slug)),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return routes;
}
