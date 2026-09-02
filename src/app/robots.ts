import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isPublicProductionIndexing, PRODUCTION_HOST, productionUrl } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!isPublicProductionIndexing(host)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: productionUrl("/sitemap.xml"),
    host: PRODUCTION_HOST,
  };
}
