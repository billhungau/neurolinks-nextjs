import type { MetadataRoute } from "next";
import { isSearchIndexable, siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexable()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
