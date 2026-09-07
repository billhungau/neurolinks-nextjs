import Image from "next/image";
import { IMG_SIZES } from "@/lib/image-sizes";
import { MEDIA } from "@/lib/media";
import type { InsightsArticleCard } from "@/lib/payload/types";

const FALLBACK_BY_TOPIC: Record<string, { src: string; alt: string }> = {
  tms: {
    src: MEDIA.tmsClinic,
    alt: "TMS treatment room at NeuroLinks in Nanaimo",
  },
  "ketamine-and-spravato": {
    src: MEDIA.ketamineHero,
    alt: "Ketamine treatment room at NeuroLinks in Nanaimo",
  },
  "veterans-and-coverage": {
    src: MEDIA.eval,
    alt: "Clinical consultation at NeuroLinks in Nanaimo",
  },
  "treatment-resistant-depression": {
    src: MEDIA.consult,
    alt: "Psychiatric consultation setting at NeuroLinks",
  },
  depression: {
    src: MEDIA.office,
    alt: "NeuroLinks clinic interior in Nanaimo",
  },
  "ptsd-and-anxiety": {
    src: MEDIA.reception,
    alt: "NeuroLinks clinic interior in Nanaimo",
  },
  wellbeing: {
    src: MEDIA.office,
    alt: "NeuroLinks clinic interior in Nanaimo",
  },
};

function fallbackFromTitle(title: string) {
  const value = title.toLowerCase();
  if (/\btms\b|magnetic stimulation/.test(value)) return FALLBACK_BY_TOPIC.tms;
  if (/ketamine|esketamine|spravato/.test(value)) return FALLBACK_BY_TOPIC["ketamine-and-spravato"];
  if (/veteran|vac|medavie/.test(value)) return FALLBACK_BY_TOPIC["veterans-and-coverage"];
  if (/ptsd|anxiety|trauma/.test(value)) return FALLBACK_BY_TOPIC["ptsd-and-anxiety"];
  if (/depress/.test(value)) return FALLBACK_BY_TOPIC.depression;
  return null;
}

const DEFAULT_FALLBACK = {
  src: MEDIA.office,
  alt: "NeuroLinks clinic interior in Nanaimo",
};

export function InsightsCardImage({
  article,
  featured = false,
}: {
  article: InsightsArticleCard;
  featured?: boolean;
}) {
  const image = article.featuredImage;
  const fallback =
    FALLBACK_BY_TOPIC[article.topics?.[0] ?? ""] ||
    FALLBACK_BY_TOPIC[article.category?.slug ?? ""] ||
    fallbackFromTitle(article.title) ||
    DEFAULT_FALLBACK;
  const className = featured ? "insights-featured-media" : "insights-card-media";

  return (
    <div className={className}>
      <Image
        src={image?.url || fallback.src}
        alt={image?.alt || fallback.alt}
        fill
        sizes={featured ? IMG_SIZES.insightsFeatured : IMG_SIZES.insightsCard}
        className="object-cover"
      />
    </div>
  );
}
