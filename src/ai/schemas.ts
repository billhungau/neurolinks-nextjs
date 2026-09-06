export const ARTICLE_TYPES = [
  "Treatment guide",
  "Condition guide",
  "FAQ",
  "Treatment comparison",
  "Evidence review",
  "Patient education",
  "Coverage / insurance guide",
  "Local treatment guide",
] as const;

export type ArticleType = (typeof ARTICLE_TYPES)[number];
export type AIAction = "generate" | "improve" | "seo";

export type ArticleSection = {
  heading?: string;
  level?: 2 | 3;
  paragraphs: string[];
  bullets?: string[];
};

export type ArticleDraft = {
  title: string;
  slug: string;
  summary: string;
  keyPoints: string[];
  sections: ArticleSection[];
  seoTitle: string;
  metaDescription: string;
  socialTitle: string;
  socialDescription: string;
  suggestedTopics: string[];
  suggestedInternalLinks: Array<{ anchor: string; href: string; reason: string }>;
  referenceRequirements: string[];
  imageConcept: string;
  imageAlt: string;
};

export type SEOReview = {
  score: number;
  readiness: "Needs work" | "Good" | "Strong";
  checks: Array<{ label: string; status: "good" | "warning" | "missing"; note: string }>;
  recommendations: string[];
  suggestedSeoTitle: string;
  suggestedMetaDescription: string;
  suggestedSlug: string;
  suggestedInternalLinks: Array<{ anchor: string; href: string; reason: string }>;
  referenceRequirements: string[];
};

export type AssistantRequest = {
  action: AIAction;
  topic?: string;
  keyword?: string;
  audience?: string;
  goal?: string;
  location?: string;
  articleType?: string;
  current?: {
    title?: string;
    summary?: string;
    bodyText?: string;
    seoTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
};

function text(value: unknown, max = 20000): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function parseAssistantRequest(value: unknown): AssistantRequest | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (input.action !== "generate" && input.action !== "improve" && input.action !== "seo") return null;
  const currentRaw = input.current && typeof input.current === "object" ? (input.current as Record<string, unknown>) : undefined;
  const result: AssistantRequest = {
    action: input.action,
    topic: text(input.topic, 300),
    keyword: text(input.keyword, 200),
    audience: text(input.audience, 300),
    goal: text(input.goal, 500),
    location: text(input.location, 200),
    articleType: text(input.articleType, 100),
    current: currentRaw
      ? {
          title: text(currentRaw.title, 300),
          summary: text(currentRaw.summary, 1000),
          bodyText: text(currentRaw.bodyText, 30000),
          seoTitle: text(currentRaw.seoTitle, 300),
          metaDescription: text(currentRaw.metaDescription, 1000),
          slug: text(currentRaw.slug, 300),
        }
      : undefined,
  };
  if (result.action === "generate" && !result.topic) return null;
  if (result.action !== "generate" && !result.current?.title && !result.current?.bodyText) return null;
  return result;
}

export function articleDraftJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["title", "slug", "summary", "keyPoints", "sections", "seoTitle", "metaDescription", "socialTitle", "socialDescription", "suggestedTopics", "suggestedInternalLinks", "referenceRequirements", "imageConcept", "imageAlt"],
    properties: {
      title: { type: "string" }, slug: { type: "string" }, summary: { type: "string" },
      keyPoints: { type: "array", items: { type: "string" } },
      sections: { type: "array", items: { type: "object", additionalProperties: false, required: ["heading", "level", "paragraphs", "bullets"], properties: { heading: { type: "string" }, level: { type: "integer", enum: [2, 3] }, paragraphs: { type: "array", items: { type: "string" } }, bullets: { type: "array", items: { type: "string" } } } } },
      seoTitle: { type: "string" }, metaDescription: { type: "string" }, socialTitle: { type: "string" }, socialDescription: { type: "string" },
      suggestedTopics: { type: "array", items: { type: "string" } },
      suggestedInternalLinks: { type: "array", items: { type: "object", additionalProperties: false, required: ["anchor", "href", "reason"], properties: { anchor: { type: "string" }, href: { type: "string" }, reason: { type: "string" } } } },
      referenceRequirements: { type: "array", items: { type: "string" } }, imageConcept: { type: "string" }, imageAlt: { type: "string" },
    },
  } as const;
}

export function seoReviewJsonSchema() {
  return {
    type: "object", additionalProperties: false,
    required: ["score", "readiness", "checks", "recommendations", "suggestedSeoTitle", "suggestedMetaDescription", "suggestedSlug", "suggestedInternalLinks", "referenceRequirements"],
    properties: {
      score: { type: "integer", minimum: 0, maximum: 100 }, readiness: { type: "string", enum: ["Needs work", "Good", "Strong"] },
      checks: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "status", "note"], properties: { label: { type: "string" }, status: { type: "string", enum: ["good", "warning", "missing"] }, note: { type: "string" } } } },
      recommendations: { type: "array", items: { type: "string" } }, suggestedSeoTitle: { type: "string" }, suggestedMetaDescription: { type: "string" }, suggestedSlug: { type: "string" },
      suggestedInternalLinks: { type: "array", items: { type: "object", additionalProperties: false, required: ["anchor", "href", "reason"], properties: { anchor: { type: "string" }, href: { type: "string" }, reason: { type: "string" } } } },
      referenceRequirements: { type: "array", items: { type: "string" } },
    },
  } as const;
}
