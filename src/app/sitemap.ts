import type { MetadataRoute } from "next";
import { PAGE_MANIFEST } from "@/content/manifest";
import { absoluteUrl, isSearchIndexable } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexable()) return [];
  return PAGE_MANIFEST.map((page) => ({
    url: absoluteUrl(page.route),
    changeFrequency: "monthly",
    priority: page.route === "/" ? 1 : 0.7,
  }));
}
