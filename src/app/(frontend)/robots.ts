import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  CMS_ADMIN_PATH,
  CMS_API_PATH,
  isPublicProductionIndexing,
  PRODUCTION_HOST,
  productionUrl,
} from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("host");
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
      disallow: [CMS_ADMIN_PATH, `${CMS_API_PATH}/`, "/api/"],
    },
    sitemap: productionUrl("/sitemap.xml"),
    host: PRODUCTION_HOST,
  };
}
