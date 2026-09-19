import type { FaqItem } from "@/content/faqs";
import { faqAnswerText } from "@/content/faqs";
import { enhanceTmsFaqs } from "@/content/tms-faq-enhancements";

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const displayItems = enhanceTmsFaqs(items);
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: displayItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: faqAnswerText(item.a) },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
