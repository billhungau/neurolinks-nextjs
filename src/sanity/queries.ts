import { defineQuery } from "next-sanity";
import { PUBLISHED_ARTICLE_GROQ_FILTER } from "@/lib/insights";

const articleCardProjection = `
  _id,
  title,
  "slug": slug.current,
  summary,
  featured,
  sortOrder,
  publishedAt,
  lastReviewedAt,
  readingTime,
  "bodyWordCount": count(string::split(pt::text(body), " ")),
  topics,
  indexable,
  "category": category->{
    title,
    "slug": slug.current,
    tone
  },
  featuredImage{
    alt,
    caption,
    asset->{
      _id,
      url,
      metadata{ lqip, dimensions }
    }
  }
`;

const sourceProjection = `
  _id,
  title,
  authors,
  publisher,
  year,
  volume,
  issue,
  pages,
  doi,
  pubmedUrl,
  url,
  editorialNote
`;

const personProjection = `
  _id,
  name,
  role,
  credentials
`;

export const publishedArticlesQuery = defineQuery(`
  *[${PUBLISHED_ARTICLE_GROQ_FILTER}] | order(coalesce(sortOrder, 9999) asc, publishedAt desc) {
    ${articleCardProjection}
  }
`);

export const featuredArticlesQuery = defineQuery(`
  *[${PUBLISHED_ARTICLE_GROQ_FILTER} && featured == true] | order(coalesce(sortOrder, 9999) asc, publishedAt desc) {
    ${articleCardProjection}
  }
`);

export const articlesByTopicQuery = defineQuery(`
  *[${PUBLISHED_ARTICLE_GROQ_FILTER} && $topic in topics] | order(coalesce(sortOrder, 9999) asc, publishedAt desc) {
    ${articleCardProjection}
  }
`);

export const articleSlugsQuery = defineQuery(`
  *[${PUBLISHED_ARTICLE_GROQ_FILTER} && indexable != false].slug.current
`);

export const articleBySlugQuery = defineQuery(`
  *[
    _type == "article" &&
    slug.current == $slug &&
    (
      !(_id in path("drafts.**")) ||
      $preview == true
    )
  ] | order(_updatedAt desc) [0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    keyPoints,
    featured,
    featuredImage{
      alt,
      caption,
      asset->{
        _id,
        url,
        metadata{ lqip, dimensions }
      }
    },
    socialImage{
      alt,
      asset->{
        _id,
        url,
        metadata{ lqip, dimensions }
      }
    },
    publishedAt,
    lastReviewedAt,
    readingTime,
    topics,
    indexable,
    seoTitle,
    metaDescription,
    socialTitle,
    socialDescription,
    canonicalUrl,
    ctaHref,
    ctaLabel,
    body[]{
      ...,
      _type == "relatedReading" => {
        ...,
        articles[]->{
          title,
          "slug": slug.current
        }
      },
      _type == "referencesSection" => {
        ...,
        sources[]->{
          _id,
          title,
          authors,
          publisher,
          year,
          volume,
          issue,
          pages,
          doi,
          pubmedUrl,
          url
        }
      },
      _type == "imageWithCaption" => {
        ...,
        image{
          ...,
          asset->{
            _id,
            url,
            metadata{ lqip, dimensions }
          }
        }
      }
    },
    "category": category->{
      title,
      "slug": slug.current,
      tone
    },
    "author": author->{ ${personProjection} },
    "medicalReviewer": medicalReviewer->{ ${personProjection} },
    "relatedArticles": relatedArticles[]->{
      ${articleCardProjection}
    },
    "references": references[]->{ ${sourceProjection} }
  }
`);

export const insightsSettingsQuery = defineQuery(`
  *[_type == "insightsSettings" && !(_id in path("drafts.**"))][0]{
    introHeading,
    introBody,
    medicalAuthorship,
    contactHeading,
    contactBody
  }
`);
