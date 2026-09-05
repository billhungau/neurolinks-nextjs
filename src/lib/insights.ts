import { productionUrl, withTrailingSlash } from "./site.ts";

export const INSIGHTS_PATH = "/insights/";
export const STUDIO_PATH = "/studio/";

export const INSIGHTS_NAME = "NeuroLinks Insights";
export const INSIGHTS_EYEBROW = "NeuroLinks Insights";
export const INSIGHTS_HEADING =
  "Evidence, treatment and practical guidance from a specialist neuropsychiatric clinic.";
export const INSIGHTS_SUPPORTING =
  "Clear, evidence-informed guidance on TMS, ketamine, treatment-resistant depression and navigating specialist mental healthcare.";

export const PATIENT_INFORMATION_WARNING =
  "Do not enter identifiable patient information into article content, images, captions or editorial notes.";

export const DEFAULT_AUTHOR = {
  name: "Dr. Chi Hung Au",
  role: "Psychiatrist",
} as const;

export const MEDICAL_AUTHORSHIP_STATEMENT =
  "NeuroLinks Insights is written for patients, families and referring clinicians. Articles are prepared and medically reviewed by the NeuroLinks clinical team in Nanaimo, BC. This information is educational and does not replace an individual psychiatric assessment.";

export const DEFAULT_ARTICLE_CTA = {
  heading: "Not sure how this information applies to you?",
  body: "Treatment recommendations depend on diagnosis, previous treatment, medical history and individual priorities.",
  label: "Start a confidential conversation",
} as const;

export const INSIGHTS_TOPICS = [
  { slug: "veterans-and-coverage", title: "Veterans and coverage" },
  { slug: "tms", title: "TMS" },
  { slug: "ketamine-and-spravato", title: "Ketamine and Spravato" },
  { slug: "treatment-resistant-depression", title: "Treatment-resistant depression" },
  { slug: "depression", title: "Depression" },
  { slug: "ptsd-and-anxiety", title: "PTSD and anxiety" },
] as const;

export type InsightsTopicSlug = (typeof INSIGHTS_TOPICS)[number]["slug"];

export const TOPIC_PAGE_HREFS: Record<InsightsTopicSlug, string> = {
  "veterans-and-coverage": "/veterans/",
  tms: "/about-tms-treatment-on-psychiatric-illness/",
  "ketamine-and-spravato": "/ketamine-treatment-resistant-depression-nanaimo/",
  "treatment-resistant-depression": "/services-psychiatric-tms-ketamine-treatment/",
  depression: "/about-tms-treatment-on-psychiatric-illness/",
  "ptsd-and-anxiety": "/veterans/",
};

export const WORDS_PER_MINUTE = 220;

/** Public Insights listing and article URLs. Studio is independent of this flag. */
export function isInsightsPublicEnabled() {
  return process.env.NEXT_PUBLIC_INSIGHTS_ENABLED === "true";
}

export function isInsightsPath(pathname: string) {
  const normalized = withTrailingSlash(pathname.split("?")[0] ?? pathname);
  return normalized === INSIGHTS_PATH || normalized.startsWith("/insights/");
}

export function insightsArticlePath(slug: string) {
  return withTrailingSlash(`/insights/${slug.replace(/^\/+|\/+$/g, "")}`);
}

export function topicFilterHref(slug?: string | null) {
  if (!slug) return INSIGHTS_PATH;
  return `${INSIGHTS_PATH}?topic=${encodeURIComponent(slug)}`;
}

export function isInsightsTopicSlug(value: string | null | undefined): value is InsightsTopicSlug {
  return Boolean(value && INSIGHTS_TOPICS.some((topic) => topic.slug === value));
}

export function topicBySlug(slug: string | null | undefined) {
  return INSIGHTS_TOPICS.find((topic) => topic.slug === slug) ?? null;
}

export function slugifyHeading(text: string) {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

export function uniqueHeadingIds(headings: string[]) {
  const seen = new Map<string, number>();
  return headings.map((heading) => {
    const base = slugifyHeading(heading);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

export function readingTimeMinutes(wordCount: number, override?: number | null) {
  if (typeof override === "number" && override > 0) return Math.round(override);
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export function countWords(text: string) {
  const matches = text.trim().match(/\S+/g);
  return matches?.length ?? 0;
}

export function defaultCtaHref(topics: readonly string[] | null | undefined) {
  if (topics?.includes("veterans-and-coverage")) return "/veterans/#veterans-contact";
  if (topics?.includes("ketamine-and-spravato")) {
    return "/ketamine-treatment-resistant-depression-nanaimo/";
  }
  if (topics?.includes("tms")) return "/about-tms-treatment-on-psychiatric-illness/";
  if (topics?.includes("treatment-resistant-depression")) {
    return "/services-psychiatric-tms-ketamine-treatment/#assessment";
  }
  return "/contact/";
}

export function formatInsightsDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Vancouver",
  }).format(date);
}

export const PUBLISHED_ARTICLE_GROQ_FILTER =
  '_type == "article" && defined(slug.current) && !(_id in path("drafts.**")) && defined(publishedAt)';

export function isPublishedArticle(article: {
  _id?: string | null;
  slug?: string | null;
  publishedAt?: string | null;
} | null) {
  if (!article?.slug) return false;
  if (article._id?.startsWith("drafts.")) return false;
  return Boolean(article.publishedAt);
}

export function doiHref(doi: string | null | undefined) {
  if (!doi) return null;
  if (doi.startsWith("http")) return doi;
  return `https://doi.org/${doi.replace(/^doi:/i, "").trim()}`;
}

export function formatReference(source: {
  title: string;
  authors?: string | null;
  publisher?: string | null;
  year?: number | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
}): string {
  const parts: string[] = [];
  if (source.authors) parts.push(`${source.authors}.`);
  parts.push(source.title.endsWith(".") ? source.title : `${source.title}.`);
  if (source.publisher) parts.push(source.publisher);
  const loc = [source.volume, source.issue ? `(${source.issue})` : null, source.pages ? `:${source.pages}` : null]
    .filter(Boolean)
    .join("");
  if (loc) parts.push(loc);
  if (source.year) parts.push(`(${source.year})`);
  if (source.doi) parts.push(`doi:${source.doi.replace(/^https?:\/\/doi.org\//i, "")}`);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : productionUrl(item.path),
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  summary?: string | null;
  publishedAt?: string | null;
  lastReviewedAt?: string | null;
  canonicalUrl?: string | null;
  author?: { name?: string | null; role?: string | null } | null;
  medicalReviewer?: { name?: string | null; role?: string | null } | null;
  image?: string | null;
}) {
  const path = insightsArticlePath(article.slug);
  const canonical = article.canonicalUrl || productionUrl(path);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    datePublished: article.publishedAt || undefined,
    dateModified: article.lastReviewedAt || article.publishedAt || undefined,
    publisher: {
      "@type": "MedicalClinic",
      name: "NeuroLinks",
      url: productionUrl("/"),
    },
  };
  if (article.image) data.image = article.image;
  if (article.author?.name) {
    data.author = {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role || undefined,
    };
  }
  if (article.medicalReviewer?.name) {
    data.reviewedBy = {
      "@type": "Person",
      name: article.medicalReviewer.name,
      jobTitle: article.medicalReviewer.role || undefined,
    };
  }
  return data;
}
