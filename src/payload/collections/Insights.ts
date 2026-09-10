import type { CollectionConfig } from "payload";
import { INSIGHTS_TOPICS, PATIENT_INFORMATION_WARNING } from "../../lib/insights";
import { authenticated, publishedOrAuthenticated } from "../access";
import { slugField } from "../fields/slug";
import { insightsBodyEditor } from "../lexical";
import { cleanupAISourcesAfterDelete, clearAISourceSessionBeforePublish } from "../hooks/cleanupAISourceDocuments";
import { revalidateInsight, revalidateInsightAfterDelete } from "../hooks/revalidateInsights";
import { previewUrl } from "../preview";

export const Insights: CollectionConfig = {
  slug: "insights",
  labels: { singular: "Insight", plural: "Insights" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "_status", "publishedAt", "featured"],
    description: PATIENT_INFORMATION_WARNING,
    preview: previewUrl,
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated, readVersions: authenticated },
  versions: { maxPerDoc: 30, drafts: { autosave: { interval: 800 }, schedulePublish: false } },
  hooks: {
    beforeChange: [clearAISourceSessionBeforePublish],
    afterChange: [revalidateInsight],
    afterDelete: [revalidateInsightAfterDelete, cleanupAISourcesAfterDelete],
  },
  defaultSort: "-publishedAt",
  fields: [
    {
      name: "aiArticleAssistant",
      type: "ui",
      admin: { components: { Field: "@/payload/components/AIArticleAssistant#AIArticleAssistant" } },
    },
    {
      name: "aiSourceSession",
      type: "text",
      admin: { hidden: true },
    },
    { name: "title", type: "text", required: true, admin: { description: "The headline readers see. Also the default SEO title." } },
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            { name: "summary", label: "Short summary", type: "textarea", required: true, maxLength: 280, admin: { description: "One or two sentences. Shown on cards, under the article title, and used as the default meta description." } },
            { name: "keyPoints", label: "Key points", type: "array", labels: { singular: "Key point", plural: "Key points" }, admin: { description: "Shown in a panel near the top of the article. Keep each point to one sentence." }, fields: [{ name: "text", type: "text", required: true }] },
            { name: "body", label: "Article body", type: "richText", editor: insightsBodyEditor, admin: { description: "Write here. Use Heading for sections, and the block menu for key points, evidence summaries, images and callouts." } },
          ],
        },
        {
          label: "Authorship",
          fields: [
            { name: "author", type: "relationship", relationTo: "authors", required: true, admin: { description: "The clinician who wrote the article." } },
            { name: "medicalReviewer", label: "Medical reviewer", type: "relationship", relationTo: "authors", admin: { description: "The clinician who checked the medical content. Shown in the article byline." } },
            { name: "lastReviewedAt", label: "Last medically reviewed", type: "date", admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" }, description: "Also used as the article's modified date for search engines." } },
          ],
        },
        {
          label: "Related",
          fields: [
            { name: "relatedArticles", label: "Related articles", type: "relationship", relationTo: "insights", hasMany: true, maxRows: 3, filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true), admin: { description: "Up to three. Leave blank and NeuroLinks will suggest articles from the same topics." } },
            { name: "references", type: "relationship", relationTo: "references", hasMany: true, admin: { description: "Numbered and rendered at the end of the article. Inline reference markers point at this list." } },
            { name: "ctaHref", label: "Contact invitation link", type: "text", admin: { description: "Optional. Leave blank to use the topic default: Veterans articles link to the Veterans contact form, others to the matching treatment page or /contact/." } },
            { name: "ctaLabel", label: "Contact invitation label", type: "text" },
          ],
        },
        {
          label: "SEO",
          description: "Every field here is optional. Left blank, NeuroLinks falls back to the article title, summary and featured image.",
          fields: [
            { name: "seoTitle", label: "SEO title", type: "text", maxLength: 70, admin: { description: "Falls back to the article title." } },
            { name: "metaDescription", label: "Meta description", type: "textarea", maxLength: 170, admin: { description: "Falls back to the short summary." } },
            { name: "socialTitle", label: "Social title", type: "text", admin: { description: "Falls back to the SEO title, then the article title." } },
            { name: "socialDescription", label: "Social description", type: "textarea", admin: { description: "Falls back to the meta description." } },
            { name: "socialImage", label: "Social image", type: "upload", relationTo: "media", admin: { description: "Falls back to the featured image, then the NeuroLinks default share image." } },
            { name: "canonicalUrl", label: "Canonical URL override", type: "text", admin: { description: "Leave blank. The canonical URL is https://neurolinks.ca/insights/[slug]/ unless this is set." } },
            { name: "indexable", label: "Allow search indexing", type: "checkbox", defaultValue: true, admin: { description: "Untick for published articles that should stay out of Google and the sitemap." } },
          ],
        },
      ],
    },
    ...slugField(),
    { name: "category", type: "relationship", relationTo: "categories", required: true, admin: { position: "sidebar" } },
    { name: "topics", type: "select", hasMany: true, options: INSIGHTS_TOPICS.map((topic) => ({ label: topic.title, value: topic.slug })), admin: { position: "sidebar", description: "Drives the topic filters on /insights/ and the Veterans grouping." } },
    { name: "featuredImage", label: "Featured image", type: "upload", relationTo: "media", admin: { position: "sidebar", description: "Used on cards, at the top of the article and as the default social image. Alternative text comes from the image record." } },
    { name: "featuredImageAlt", label: "Featured image alt text override", type: "text", admin: { position: "sidebar", description: "Optional. Leave blank to use the alternative text stored with the image." } },
    {
      name: "publishedAt", label: "Published date", type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" }, description: "Required before the article can appear publicly. Set automatically when you publish." },
      hooks: { beforeChange: [({ siblingData, value }) => { if (value) return value; if (siblingData?._status === "published") return new Date().toISOString(); return value; }] },
    },
    { name: "featured", label: "Featured article", type: "checkbox", defaultValue: false, admin: { position: "sidebar", description: "Shown in the large slot at the top of /insights/." } },
    { name: "readingTime", label: "Reading time (minutes)", type: "number", min: 1, max: 60, admin: { position: "sidebar", step: 1, description: "Leave blank to estimate from the article body." } },
    { name: "sortOrder", label: "Article order", type: "number", admin: { position: "sidebar", step: 1, description: "Lower numbers appear first. Leave blank to order by published date." } },
  ],
};
