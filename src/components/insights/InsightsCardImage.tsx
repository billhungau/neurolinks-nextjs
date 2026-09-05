import Image from "next/image";
import { IMG_SIZES } from "@/lib/image-sizes";
import { MEDIA } from "@/lib/media";
import { insightsImageUrl } from "@/sanity/image";
import type { InsightsArticleCard } from "@/sanity/types";
import { NeuralMotif } from "./EditorialDiagram";

const FALLBACK_BY_TOPIC: Record<string, { src: string; alt: string }> = {
  tms: {
    src: MEDIA.tmsClinic,
    alt: "Patient receiving TMS treatment at NeuroLinks, with the treatment coil positioned by a clinician",
  },
  "ketamine-and-spravato": {
    src: MEDIA.ketamineHero,
    alt: "Ketamine treatment room at NeuroLinks in Nanaimo",
  },
  "veterans-and-coverage": {
    src: MEDIA.eval,
    alt: "Clinical consultation at NeuroLinks in Nanaimo",
  },
};

export function InsightsCardImage({
  article,
  featured = false,
}: {
  article: InsightsArticleCard;
  featured?: boolean;
}) {
  const sanityUrl = insightsImageUrl(article.featuredImage, featured ? 1400 : 900);
  const fallback =
    FALLBACK_BY_TOPIC[article.topics?.[0] ?? ""] ||
    FALLBACK_BY_TOPIC[article.category?.slug ?? ""] ||
    null;
  const alt = article.featuredImage?.alt || fallback?.alt;
  const className = featured ? "insights-featured-media" : "insights-card-media";

  if (sanityUrl && alt) {
    return (
      <div className={className}>
        <Image
          src={sanityUrl}
          alt={alt}
          fill
          sizes={featured ? IMG_SIZES.insightsFeatured : IMG_SIZES.insightsCard}
          className="object-cover"
        />
      </div>
    );
  }

  if (fallback) {
    return (
      <div className={className}>
        <Image
          src={fallback.src}
          alt={fallback.alt}
          fill
          sizes={featured ? IMG_SIZES.insightsFeatured : IMG_SIZES.insightsCard}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${className} insights-card-graphic`} aria-hidden="true">
      <NeuralMotif />
    </div>
  );
}
