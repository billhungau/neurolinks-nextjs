import type { MetadataRoute } from "next";
import { SITEMAP_ROUTES } from "@/content/manifest";
import { isSearchIndexable, productionUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexable()) return [];
  return SITEMAP_ROUTES.map((route) => ({
    url: productionUrl(route),
    changeFrequency: "monthly" as const,
    priority: route === "/" ? 1 : 0.7,
  }));
}
