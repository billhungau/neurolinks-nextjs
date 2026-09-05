import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";
import { INSIGHTS_PATH, insightsArticlePath } from "@/lib/insights";

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    {
      route: "/insights/:slug",
      filter: `_type == "article" && slug.current == $slug`,
    },
    {
      route: "/insights/",
      filter: `_type == "insightsSettings"`,
    },
  ]),
  locations: {
    article: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Article",
            href: doc?.slug ? insightsArticlePath(String(doc.slug)) : INSIGHTS_PATH,
          },
          { title: "Insights index", href: INSIGHTS_PATH },
        ],
      }),
    }),
    insightsSettings: defineLocations({
      select: { title: "introHeading" },
      resolve: () => ({
        locations: [{ title: "Insights index", href: INSIGHTS_PATH }],
      }),
    }),
  },
};
