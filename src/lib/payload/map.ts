import { lexicalWordCount, type LexicalState } from "../insights-content.ts";
import { isInsightsTopicSlug, type InsightsTopicSlug } from "../insights.ts";
import { relativizeToSite } from "../site.ts";
import type {
  InsightsArticle,
  InsightsArticleCard,
  InsightsCategory,
  InsightsImage,
  InsightsPerson,
  InsightsSource,
  InsightsTone,
} from "./types.ts";

/** Payload returns either an id or the populated document, depending on depth. */
type Ref<T> = number | string | T | null | undefined;

function populated<T extends object>(value: Ref<T>): T | null {
  if (!value || typeof value !== "object") return null;
  return value as T;
}

type MediaDoc = {
  url?: string | null;
  alt?: string | null;
  caption?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
};

export function mapImage(
  value: Ref<MediaDoc>,
  overrides: { alt?: string | null; caption?: string | null } = {},
): InsightsImage {
  const media = populated<MediaDoc>(value);
  if (!media?.url) return null;
  const alt = overrides.alt?.trim() || media.alt?.trim();
  if (!alt) return null;
  const caption = overrides.caption?.trim() || media.caption?.trim() || null;
  return {
    url: relativizeToSite(media.url),
    alt,
    caption: media.credit ? [caption, media.credit].filter(Boolean).join(" — ") : caption,
    width: media.width ?? null,
    height: media.height ?? null,
  };
}

type CategoryDoc = { title?: string | null; slug?: string | null; tone?: string | null };

export function mapCategory(value: Ref<CategoryDoc>): InsightsCategory {
  const category = populated<CategoryDoc>(value);
  if (!category?.title || !category.slug) return null;
  return {
    title: category.title,
    slug: category.slug,
    tone: (category.tone as InsightsTone | null) ?? null,
  };
}

type AuthorDoc = {
  id?: number | string;
  name?: string | null;
  role?: string | null;
  credentials?: string | null;
  bio?: string | null;
  photo?: Ref<MediaDoc>;
};

export function mapPerson(value: Ref<AuthorDoc>): InsightsPerson {
  const person = populated<AuthorDoc>(value);
  if (!person?.name) return null;
  return {
    id: person.id ?? person.name,
    name: person.name,
    role: person.role ?? null,
    credentials: person.credentials ?? null,
    bio: person.bio ?? null,
    photo: mapImage(person.photo),
  };
}

type ReferenceDoc = {
  id?: number | string;
  title?: string | null;
  authors?: string | null;
  publisher?: string | null;
  year?: number | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  pubmedUrl?: string | null;
  url?: string | null;
};

export function mapSource(value: Ref<ReferenceDoc>): InsightsSource | null {
  const source = populated<ReferenceDoc>(value);
  if (!source?.title) return null;
  return {
    id: source.id ?? source.title,
    title: source.title,
    authors: source.authors ?? null,
    publisher: source.publisher ?? null,
    year: source.year ?? null,
    volume: source.volume ?? null,
    issue: source.issue ?? null,
    pages: source.pages ?? null,
    doi: source.doi ?? null,
    pubmedUrl: source.pubmedUrl ?? null,
    url: source.url ?? null,
  };
}

export function mapSources(value: Ref<ReferenceDoc>[] | null | undefined) {
  if (!Array.isArray(value)) return null;
  const sources = value.map(mapSource).filter((source): source is InsightsSource => Boolean(source));
  return sources.length ? sources : null;
}

function mapTopics(value: unknown): InsightsTopicSlug[] | null {
  if (!Array.isArray(value)) return null;
  const topics = value.filter((topic): topic is InsightsTopicSlug =>
    isInsightsTopicSlug(typeof topic === "string" ? topic : null),
  );
  return topics.length ? topics : null;
}

function mapKeyPoints(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const points = value
    .map((entry) =>
      entry && typeof entry === "object" && typeof (entry as { text?: unknown }).text === "string"
        ? ((entry as { text: string }).text ?? "").trim()
        : "",
    )
    .filter(Boolean);
  return points.length ? points : null;
}

/** Payload documents as seen by the data layer at `depth: 1`. */
export type InsightsDoc = {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  publishedAt?: string | null;
  lastReviewedAt?: string | null;
  readingTime?: number | null;
  topics?: unknown;
  indexable?: boolean | null;
  keyPoints?: unknown;
  body?: unknown;
  category?: Ref<CategoryDoc>;
  featuredImage?: Ref<MediaDoc>;
  featuredImageAlt?: string | null;
  socialImage?: Ref<MediaDoc>;
  seoTitle?: string | null;
  metaDescription?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  canonicalUrl?: string | null;
  ctaHref?: string | null;
  ctaLabel?: string | null;
  author?: Ref<AuthorDoc>;
  medicalReviewer?: Ref<AuthorDoc>;
  relatedArticles?: Ref<InsightsDoc>[] | null;
  references?: Ref<ReferenceDoc>[] | null;
  _status?: string | null;
};

export function mapArticleCard(doc: InsightsDoc): InsightsArticleCard | null {
  if (!doc?.title || !doc.slug) return null;
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary ?? null,
    featured: doc.featured ?? null,
    sortOrder: doc.sortOrder ?? null,
    publishedAt: doc.publishedAt ?? null,
    lastReviewedAt: doc.lastReviewedAt ?? null,
    readingTime: doc.readingTime ?? null,
    bodyWordCount: lexicalWordCount(doc.body as LexicalState),
    topics: mapTopics(doc.topics),
    indexable: doc.indexable ?? null,
    category: mapCategory(doc.category),
    featuredImage: mapImage(doc.featuredImage, { alt: doc.featuredImageAlt }),
  };
}

export function mapArticleCards(docs: InsightsDoc[]): InsightsArticleCard[] {
  return docs
    .map(mapArticleCard)
    .filter((article): article is InsightsArticleCard => Boolean(article));
}

export function mapArticle(doc: InsightsDoc): InsightsArticle | null {
  const card = mapArticleCard(doc);
  if (!card) return null;
  const related = Array.isArray(doc.relatedArticles)
    ? mapArticleCards(
        doc.relatedArticles
          .map((entry) => populated<InsightsDoc>(entry))
          .filter((entry): entry is InsightsDoc => Boolean(entry)),
      )
    : [];
  return {
    ...card,
    status: doc._status === "published" ? "published" : "draft",
    keyPoints: mapKeyPoints(doc.keyPoints),
    body: (doc.body as LexicalState) ?? null,
    socialImage: mapImage(doc.socialImage),
    seoTitle: doc.seoTitle ?? null,
    metaDescription: doc.metaDescription ?? null,
    socialTitle: doc.socialTitle ?? null,
    socialDescription: doc.socialDescription ?? null,
    canonicalUrl: doc.canonicalUrl ?? null,
    ctaHref: doc.ctaHref ?? null,
    ctaLabel: doc.ctaLabel ?? null,
    author: mapPerson(doc.author),
    medicalReviewer: mapPerson(doc.medicalReviewer),
    relatedArticles: related.length ? related : null,
    references: mapSources(doc.references),
  };
}
