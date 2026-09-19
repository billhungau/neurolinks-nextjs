import type { FaqBlock, FaqItem } from "@/content/faqs";
import { faqEvidenceLinks, isStructuredFaqAnswer } from "@/content/faqs";

const RELATED_INSIGHTS: Record<string, { title: string; href: string }> = {
  "Is the effect of TMS durable?": {
    title: "How Long Do the Effects of TMS Last? Maintaining Results After Treatment",
    href: "/insights/how-long-do-effects-of-tms-last/",
  },
  "What factors affect the treatment outcome?": {
    title: "Who Is Most Likely to Respond to TMS for Depression?",
    href: "/insights/who-is-most-likely-to-respond-to-tms-for-depression/",
  },
  "How good is the treatment effect in obsessive-compulsive disorder (OCD)?": {
    title: "How Good Is TMS for OCD? A Practical Look at the Evidence",
    href: "/insights/how-good-is-tms-for-ocd-evidence/",
  },
};

const PTSD_FAQ: FaqItem = {
  q: "Can TMS help with PTSD?",
  a: [
    {
      type: "p",
      content: [
        {
          type: "text",
          value:
            "Yes. Recent research suggests that TMS can meaningfully improve PTSD symptoms, especially when combined with trauma-focused therapy. In a 2026 randomized trial involving military personnel and veterans with mostly severe or extreme combat-related PTSD, 85% of those receiving active TMS achieved a reliable improvement in symptoms, compared with 59% receiving sham treatment.",
        },
      ],
    },
    {
      type: "p",
      content: [
        {
          type: "text",
          value:
            "TMS is not a replacement for trauma-focused therapy, but it may be a useful additional treatment for selected patients.",
        },
      ],
    },
    {
      type: "p",
      content: [
        { type: "strong", value: "Related Insight: " },
        {
          type: "link",
          value: "Can TMS Help With Combat-Related PTSD? What a New Trial Means →",
          href: "/insights/tms-combat-related-ptsd-evidence-review/",
        },
      ],
    },
  ],
};

function isTmsFaqSet(items: FaqItem[]) {
  return items.some((item) => item.q === "How likely will depression improve with TMS?") &&
    items.some((item) => item.q === "Is the effect of TMS durable?");
}

function appendRelatedInsight(item: FaqItem): FaqItem {
  const related = RELATED_INSIGHTS[item.q];
  if (!related || faqEvidenceLinks(item.a).some((link) => link.href === related.href)) {
    return item;
  }

  if (!isStructuredFaqAnswer(item.a)) {
    return item;
  }

  const relatedBlock: FaqBlock = {
    type: "p",
    content: [
      { type: "strong", value: "Related Insight: " },
      { type: "link", value: `${related.title} →`, href: related.href },
    ],
  };

  return { ...item, a: [...item.a, relatedBlock] };
}

export function enhanceTmsFaqs(items: FaqItem[]): FaqItem[] {
  if (!isTmsFaqSet(items)) return items;

  const enhanced = items.map(appendRelatedInsight);
  if (enhanced.some((item) => item.q === PTSD_FAQ.q)) return enhanced;

  const ocdIndex = enhanced.findIndex(
    (item) => item.q === "How good is the treatment effect in obsessive-compulsive disorder (OCD)?",
  );
  const insertAt = ocdIndex >= 0 ? ocdIndex + 1 : enhanced.length;

  return [...enhanced.slice(0, insertAt), PTSD_FAQ, ...enhanced.slice(insertAt)];
}
