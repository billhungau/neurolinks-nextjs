import { NEUROLINKS_EDITORIAL_RULES } from "./editorial-rules";
import { articleDraftJsonSchema, seoReviewJsonSchema, type AssistantRequest } from "./schemas";
import { INSIGHTS_TOPICS, TOPIC_PAGE_HREFS } from "../lib/insights";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.6";

const VALID_LINKS = [
  ...Object.entries(TOPIC_PAGE_HREFS).map(([topic, href]) => `${topic}: ${href}`),
  "contact: /contact/",
  "referral: /referral/",
  "insights: /insights/",
];

function userContext(request: AssistantRequest) {
  return JSON.stringify({
    task: request.action,
    topic: request.topic,
    primarySearchQuery: request.keyword,
    audience: request.audience,
    goal: request.goal,
    location: request.location,
    articleType: request.articleType,
    currentArticle: request.current,
    validTopicSlugs: INSIGHTS_TOPICS.map((topic) => topic.slug),
    approvedInternalDestinations: VALID_LINKS,
  }, null, 2);
}

function targetLength(articleType?: string) {
  if (articleType === "Evidence review") return "Aim for about 1,600–2,200 words unless the topic genuinely requires less.";
  if (articleType === "FAQ") return "Aim for about 900–1,400 words.";
  if (articleType === "Treatment comparison") return "Aim for about 1,400–2,000 words.";
  return "Aim for about 1,200–1,800 words.";
}

function instructions(request: AssistantRequest) {
  const task = request.action === "generate"
    ? "Create a complete, high-quality patient-facing draft. Use referenceRequirements for medical claims that need verification. Do not invent citations."
    : request.action === "improve"
      ? "Rewrite and improve the supplied article while preserving factual meaning and caveats. Do not invent new clinical facts. Return a complete replacement draft plus referenceRequirements."
      : "Audit the supplied article for search intent, information quality, medical evidence hygiene, metadata, structure, local relevance, internal linking and readability. The score is only an editorial heuristic, not a Google score.";
  return `${NEUROLINKS_EDITORIAL_RULES}\n\nTASK\n${task}\n\nLENGTH AND READABILITY\n${targetLength(request.articleType)} Keep paragraphs concise, avoid repetitive framing, do not restate the same benefit or caveat in multiple sections, and prioritize direct answers over filler. Use H2/H3 sections only when they add navigational value.\n\nOnly suggest internal hrefs from approvedInternalDestinations. Keep SEO title <= 70 characters, meta description <= 170 characters, summary <= 280 characters.`;
}

export async function runArticleAI(request: AssistantRequest): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED");
  const isSeo = request.action === "seo";
  const schema = isSeo ? seoReviewJsonSchema() : articleDraftJsonSchema();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 210_000);
  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_CONTENT_MODEL || DEFAULT_MODEL,
        reasoning: { effort: "low" },
        max_output_tokens: isSeo ? 5000 : 7000,
        instructions: instructions(request),
        input: userContext(request),
        text: {
          format: {
            type: "json_schema",
            name: isSeo ? "neurolinks_seo_review" : "neurolinks_article_draft",
            strict: true,
            schema,
          },
        },
      }),
    });
    if (!response.ok) {
      const providerText = await response.text().catch(() => "");
      console.error("[ai-article-assistant] provider request failed", response.status, providerText.slice(0, 1000));
      throw new Error("AI_PROVIDER_ERROR");
    }
    const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const raw = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
    if (!raw) throw new Error("AI_INVALID_OUTPUT");
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("AI_TIMEOUT");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
